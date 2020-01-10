const rs = '\x1b[31m';
const ul = '\x1b[4m';
const cl = '\x1b[0m';

const asExpr = `
  ${ul}AsExpression${cl}:

  As expressions allow the transformation of the input after it matches a predicate.
  It also offers the ability to provide additional information for the output.

    [ * | \`FieldIdentifier\` | \`(*)Literal\` | \`CallExpression\` ] AS \`FieldIdentifier\`

  Examples:

    - SELECT a AS b, b AS c
    - SELECT a.b.c.d AS d
    - SELECT (1, 2, 3) AS e
    - SELECT DATE() AS now`;

const binExpr = `
  ${ul}BinaryExpression${cl}:

  Binary expressions allow the filtering of the input to a defined predicate. If
  the input does not match the predicate then it will not be output.

    [ \`FieldIdentifier\` | \`(Number|String|Boolean|Matcher)Literal\` | \`CallExpression\` ]
      \`BinaryOperator\`
      [ \`FieldIdentifier\` | \`(*)Literal\` | \`CallExpression\` ]

  Logical operator precedence is adhered to so the following are ${ul}not${cl} equivalent:

    1) WHERE (a = b AND b = c) OR b = d
    2) WHERE a = b AND (b = c OR b = d)

  As you can see, use of parentheses can be used to force a specific precedence:

    1) if \`a\` is equal to \`b\` and \`b\` is equal to \`c\`
       ${ul}or${cl} \`b\` is equal to \`d\`, so the following inputs will both pass:

       - { "a": 1, "b": 1, "c": 1 }
       - { "a": 4, "b": 1, "c": 24, "d": 1 }

    2) if \`a\` is equal to \`b\` ${ul}and${cl} \`b\` is equal to \`c\`
       or \`b\` is equal to \`d\`, so the following inputs will both pass:

       - { "a": 1, "b": 1, "c": 1 }
       - { "a": 1, "b": 1, "c": 24, "d": 1 }

  Binary Operators:

    \`=\` | \`IS\`                  - strict JS equality (equivalent to \`===\`)
    \`!=\` | \`<>\` | \`IS NOT\`      - strict JS inequality (equivalent to \`!==\`)
    \`%=\`                        - non-strict JS equality (equivalent to \`==\`)
    \`%!=\`                       - non-strict JS inequality (equivialent to \`!=\`)
    \`>\` | \`>=\` | \`<=\` | \`<\`     - ordering comparison JS
    \`LIKE\` | \`NOT LIKE\`         - case-sensitive JS regex
    \`iLIKE\` | \`NOT iLIKE\`       - case-insensitive JS regex
    \`IN\` | \`NOT IN\`             - lookup in JS array

  Examples:

    - WHERE a = 2 AND b %!= "4"
    - WHERE a >= 2 AND a < 5
    - WHERE b LIKE _foo% OR c NOT iLIKE %bar%
    - WHERE c IN (1, 2, 3) AND d NOT IN (e.f.g, 5)
    - WHERE LENGTH(posts) > 10
    - WHERE posts.length > 10`;

const usage = `
  ${ul}Usage${cl}:

    qp [...options] [-q <query>]

  ${ul}Options${cl}:

    -q,  --query <query>   - a SQL-like query
    -p,  --pretty          - output pretty JSON
    -a,  --no-array        - disable processing of top-level arrays
    -b,  --buffer          - disable forced flushing of stdout for every JSON
    -s,  --strict          - exit on JSON parse error with exit code 1
    -x                     - silence JSON parse errors (stderr)

    -h,  --help            - display this help message
    -sy, --syntax          - display the syntax guide
    -v,  --version         - print version

  ${ul}Example usage${cl}:

    $ tail -f input.log | qp -q 'WHERE a > b' > output.log
    $ cat input.json | qp -q 'SELECT a AS b' > ouput.json`;

export const syntax = `
  The query language is heavily inspired by SQL, offering a
  familiar and approachable syntax. Behind the scenes it uses
  a recursive descent parser to adhere to logical operator precedence.

    [ SELECT [ * | \`FieldIdentifier\` | \`AsExpression\` ] ]
      WHERE \`BinaryExpression\`
        [ [ AND \`BinaryExpression\` | OR \`BinaryExpression\` ] [, ...] ]
      [ LIMIT \`NumberLiteral\` ]
      [ OFFSET \`NumberLiteral\` ]
  ${asExpr}
  ${binExpr}

  ${ul}Example queries${cl}:

  - SELECT * WHERE (a = true AND b IS NOT NULL) OR (c > 100 AND d = "foo")
  - SELECT age WHERE name LIKE _rock% AND age NOT IN (21, 35)
  - WHERE DATE(profile.dob) > DATE("1984-01-12") LIMIT 10`;

export const VERSION = '0.0.1';
export const help = `
  ▄▀▀▀█ █▀▀▀▄
  █   █ █   █   qp - ${VERSION}
   ▀▀ █ ▒ ▀▀    query-pipe: command-line (ND)JSON querying 
  · - █▄▄ ▪ ·  ·------------------------------------------·
      ▀      

  A tool for processing and filtering JSON from the command-line.
  Automatically interprets Newline Delimited JSON (NDJSON) from \`stdin\`,
  including pretty-printed NDJSON, and can optionally query top-level array input.

  Without any arguments qp is a straight stdin to stdout pipe for valid JSON.

  ${ul}Note${cl}: If the input is a top-level array and the \`--no-array\` flag
  is not used, the filter will be applied to each element in the array.
  This also works for new-line delimited JSON where each line is a top-level array.
  ${usage}
`;
