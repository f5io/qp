const rs = '\x1b[31m';
const ul = '\x1b[4m';
const cl = '\x1b[0m';

export const VERSION = '1.0.1';

const logo = `
  ▄▀▀▀█ █▀▀▀▄
  █   █ █   █   qp - ${VERSION}
   ▀▀ █ ▒ ▀▀    query-pipe: command-line (ND)JSON querying 
  · - █▄▄ ▪ ·  ·------------------------------------------·
      ▀`;

export const syntax = `${logo}

  ${ul}Syntax${cl}

  The query language is heavily inspired by SQL, offering a
  familiar and approachable syntax. Behind the scenes it uses
  a recursive descent parser to adhere to logical operator precedence.

      [ select [ * | field_ident | call_expr | (*)_lit | as_expression ] ]
        where [ bin_expr | logical_expr ] [ and | or ] [ ... ]
        [ limit num_lit ]
        [ offset num_lit ]

  In the examples below, it is assumed that qp is receiving a stream of input
  structured in the following way:

      {
        "id": <id>,
        "name": { "first": "<name>" },
        "age": <age>,
        "dob": "<date>",
        "data": [ "random", ... ]
      }

  ${ul}Transforming${cl}

  By default qp assumes \`select *\`, acting as an identity function over the JSON input.
  Using a select clause you are able to transform the output of your filter.

  - \`select id where id >= 3\` - [\`{"id":3}\`, \`{"id":4}\`, ...] 
  - \`select id as * where id >= 3\` - [\`3\`, \`4\`, ...]
  - \`select data.0 as *\` - [\`"random"\` ...]
  - \`select age, name.first as firstName where age > 42\` - [\`{"age":43, "firstName":"<name>"}\`, ...]
  - \`select age as number\` - [\`{"number":<age>}\`, ...]
  - \`select date(dob) as birthYear\` - [\`{"birthYear":"0000-00-00T00:00:00.000Z"}\`, ...]
  - \`select 1\` - [\`1\` \`1\` ...]
  - \`select true\` - [\`true\` \`true\` ...]
  - \`select null\` - [\`null\` \`null\` ...]
  - \`select (1,2,3)\` - [\`1,2,3]\` ...]
  - \`select date()\` - [\`2020-01-11T00:00:00.000Z"\` ...]
  - \`select 1 as one\` - [\`one":1}\` \`one":1}\` ...]

  ${ul}Filtering${cl}

  By default qp assumes \`where 1 = 1\` producing JSON output for every JSON input it receives.
  Logical operator precedence is adhered to so the following are ${ul}not${cl} equivalent:

  - \`where (age > 30 and age <= 40) or name.first = "Orion"\`
  - \`where age > 30 and (age <= 40 or name.first = "Orion")\`

  ${ul}Equality & Order Comparison Operators${cl}:

  Either side of an equality operator can be a field identifier, literal or call expression.

  - \`=\`, \`is\` - strict JS equality (equivalent to \`===\`)
  - \`!=\`, \`<>\`, \`is not\` - strict JS inequality (equivalent to \`!==\`)
  - \`%=\` - non-strict JS equality (equivalent to \`==\`)
  - \`%!=\` - non-strict JS inequality (equivialent to \`!=\`)
  - \`>\`, \`>=\`, \`<=\`, \`<\` - ordering comparison JS

  ${ul}Other Operators${cl}:

  - \`like\`, \`not like\` - case-sensitive JS regex
  - \`ilike\`, \`not ilike\` - case-insensitive JS regex
  - \`in\`, \`not in\` - lookup in JS array

  For example:

  - \`select name where name.first like _am%\` - [\`{"name":{"first":"Sam"}}\`, \`{"name":{"first":"Cameron"}}\`, ...]
  - \`select id as * where id like 1\` - [\`1\`, \`10\`, \`11\`, \`12\` ...]
  - \`select name.first as n where name.first ilike "^[aeiou]"\` - [\`{"n":"Abed"}\`, \`{"n":"Izzy"}\`, ...]
  - \`select * where id in (1,2,3)\` - [\`{"id":1, ...rest}\`, \`{"id":2, ...rest}\`, \`{"id":3, ...rest}\`, ...]
  - \`select id as * where "tails" in data\` - [\`0\`, \`5\`, ...]

  ${ul}Call Expressions${cl}

  qp provides a couple of utility functions that can be used in your query.

  The \`date()\` function is synonymous with the javascript \`Date()\` constructor.

      select date() as now
      where date(dob) >= date("1984-01-01")

  For more complex object construction you can use \`from_entries((k, v)...)\`. It takes
  a variadic number of tuples of (key, value) and can be used recursively.

      select from_entries(
        ("now", date()),
        ("nested", from_entries((name.first, age))),
        ("copy", *)
      )

  Which would output:

      {
        "now":"2020-01-11T00:00:00.000Z",
        "nested": { "Sam": 40 },
        "copy": { ...copy of input }
      }

  There is potential for new call expressions to be added to qp, or, with a slightly larger
  binary size, facilitate custom call expressions at runtime.
`;


const usage = `
  ${ul}Usage${cl}:

    qp [...flags] [<query>]

  ${ul}Flags${cl}:

    -p,  --pretty          - output pretty JSON
    -a,  --no-array        - disable processing of top-level arrays
    -b,  --buffer          - disable forced flushing of stdout for every JSON
    -s,  --strict          - exit on JSON parse error with exit code 1
    -x                     - silence JSON parse errors (stderr)

    -h,  --help            - display this help message
    -v,  --version         - print version
    --syntax               - display the syntax guide

  ${ul}Example usage${cl}:

    $ tail -f input.log | qp -xs 'where a > b' > output.log
    $ cat input.json | qp select a as b > ouput.json`;


export const help = `${logo}

  A tool for processing and filtering JSON from the command-line.
  Automatically interprets Newline Delimited JSON (NDJSON) from \`stdin\`,
  including pretty-printed NDJSON, and can optionally query top-level array input.

  Without any arguments qp is a straight stdin to stdout pipe for valid JSON.

  ${ul}Note${cl}: If the input is a top-level array and the \`--no-array\` flag
  is not used, the filter will be applied to each element in the array.
  This also works for new-line delimited JSON where each line is a top-level array.
  ${usage}
`;
