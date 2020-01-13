
    ▄▀▀▀█ █▀▀▀▄
    █   █ █   █   qp - 0.0.1
     ▀▀ █ ▒ ▀▀    query-pipe: command-line (ND)JSON querying 
    · - █▄▄ ▪ ·  ·------------------------------------------·
        ▀

A tool for filtering and transforming JSON from the command-line.
Automatically interprets Newline Delimited JSON (NDJSON) from `stdin`,
including pretty-printed NDJSON, and can optionally query top-level array input.

- a familiar and approachable SQL-like query language
- `~600kb` binary, with _zero_ runtime dependencies

# Install

    $ VERSION=1.0.1 curl -o- https://raw.githubusercontent.com/paybase/qp/master/install.sh | sh

# Usage

    $ qp [...flags] [<query>]

Without any arguments qp is a straight stdin to stdout pipe for valid JSON.

- `-p`, `--pretty` - output pretty JSON
- `-a`, `--no-array` - disable processing of top-level arrays
- `-b`, `--buffer` - disable forced flushing of stdout for every JSON
- `-s`, `--strict` - exit on JSON parse error with exit code 1
- `-x` - silence JSON parse errors (stderr)

- `-h`, `--help` - display this help message
- `-sy`, `--syntax` - display the syntax guide
- `-v`, `--version` - print version

# Syntax

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

## Transforming

By default qp assumes `select *`, acting as an identity function over the JSON input.
Using a select clause you are able to transform the output of your filter.

- `select id where id >= 3` - [`{"id":3}`, `{"id":4}`, ...] 
- `select id as * where id >= 3` - [`3`, `4`, ...]
- `select age, name.first as firstName where age > 42` - [`{"age":43, "firstName":"<name>"}`, ...]
- `select data.0 as *` - [`"random"` ...]
- `select age as number` - [`{"number":<age>}`, ...]
- `select date(dob) as birthYear` - [`{"birthYear":"0000-00-00T00:00:00.000Z"}`, ...]
- `select 1` - [`1`, `1`, ...]
- `select true` - [`true`, `true`, ...]
- `select null` - [`null`, `null`, ...]
- `select (1,2,3)` - [`[1,2,3]`, ...]
- `select date()` - [`"2020-01-11T00:00:00.000Z"`, ...]
- `select 1 as one` - [`{"one":1}`, `{"one":1}`, ...]

## Filtering

By default qp assumes `where 1 = 1`, producing JSON output for every JSON input it receives.
Logical operator precedence is adhered to so the following are __not__ equivalent:

- `where (age > 30 and age <= 40) or name.first = "Orion"`
- `where age > 30 and (age <= 40 or name.first = "Orion")`

### Equality & Order Comparison Operators:

Either side of an equality operator can be a field identifier, literal or call expression.

- `=`, `is` - strict JS equality (equivalent to `===`)
- `!=`, `<>`, `is not` - strict JS inequality (equivalent to `!==`)
- `%=` - non-strict JS equality (equivalent to `==`)
- `%!=` - non-strict JS inequality (equivialent to `!=`)
- `>`, `>=`, `<=`, `<` - ordering comparison JS

### Other Operators:

- `like`, `not like` - case-sensitive JS regex
- `ilike`, `not ilike` - case-insensitive JS regex
- `in`, `not in` - lookup in JS array

For example:

- `select name where name.first like _am%` - [`{"name":{"first":"Sam"}}`, `{"name":{"first":"Cameron"}}`, ...]
- `select id as * where id like 1` - [`1`, `10`, `11`, `12` ...]
- `select name.first as n where name.first ilike "^[aeiou]"` - [`{"n":"Abed"}`, `{"n":"Izzy"}`, ...]
- `select * where id in (1,2,3)` - [`{"id":1, ...rest}`, `{"id":2, ...rest}`, `{"id":3, ...rest}`, ...]
- `select id as * where "tails" in data` - [`0`, `5`, ...]

## Call Expressions

qp provides a couple of utility functions that can be used in your query.

The `date()` function is synonymous with the javascript `Date()` constructor.

    select date() as now
    where date(dob) >= date("1984-01-01")

For more complex object construction you can use `from_entries((k, v)...)`. It takes
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

# Building

qp is built with [QuickJS](https://bellard.org/quickjs/).

To install QuickJS and the @paybase/csp dependency, run:

    $ sh build/vendor.sh

You can provide `QJS_VERSION` and `CSP_VERSION` environment variables to the command above.
By default the script will install QuickJS@2019-12-21 and @paybase/csp@1.0.8.

It may take a while to compile QuickJS, however when that process is complete, you can
build qp by running:

    $ sh build/compile.sh

Run the tests with:

    $ sh test/test.sh
