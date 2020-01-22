: ${ARCH:="darwin"}

set -x

export TZ=utc

assert_eq() {
  if [ "$1" != "$2" ]; then
    echo "error: \"$1\" is not equal to \"$2\""
    exit 1
  fi
}

assert() {
  echo "checking: $1"
  local actual="`./qjs/qjs test/producer.js | ./bin/$ARCH/qp "$1" | tr '\n' ','`"
  local expected=`echo "$2" | tr '\n' ','`
  assert_eq "$actual" "$expected"
}

assert_err() {
  local actual="`echo "$1" | ./bin/$ARCH/qp "$2" 2>&1 | tr '\n' ','`"
  local expected="`echo "$3" | tr '\n' ','`"
  echo "checking for err: $expected"
  assert_eq "$actual" "$expected"
}

assert_silent_err() {
  local actual="`echo "$1" | ./bin/$ARCH/qp -x "$2" 2>&1 | tr '\n' ','`"
  local expected="`echo "$3" | tr '\n' ','`"
  echo "checking for err: $expected"
  assert_eq "$actual" "$expected"
}

assert \
 "select id where id >= 3 limit 2" \
 '{"id":3}\n{"id":4}' 

assert \
  "select id as * where id >= 3 limit 3" \
  '3\n4\n5'

assert \
  "select data.0 as * limit 2" \
  '"heads"\n"tails"'

assert \
  "select age, name.first as firstName where age >= 40 limit 1" \
  '{"age":40,"firstName":"Sam"}'

assert \
  "select age as number offset 2 limit 2" \
  '{"number":27}\n{"number":19}'

assert \
  "select date(dob) as birthYear limit 1" \
  '{"birthYear":"1979-06-23T00:00:00.000Z"}'

assert \
  "select 1 limit 3" \
  '1\n1\n1'

assert \
  "select true limit 3" \
  'true\ntrue\ntrue'

assert \
  "select null limit 2" \
  'null\nnull'

assert \
  "select (1,2,3) limit 2" \
  '[1,2,3]\n[1,2,3]'

assert \
  "select date(2020, 0) limit 1" \
  '"2020-01-01T00:00:00.000Z"'

assert \
  "select 1 as one limit 4" \
  '{"one":1}\n{"one":1}\n{"one":1}\n{"one":1}'

assert \
  "select name.first as * where (age > 30 and age <= 40) or name.first = 'Orion' limit 4" \
  '"Sam"\n"Izzy"\n"Orion"\n"Cameron"'

assert \
  "select name.first as * where ((age > 30 and age <= 40) or name.first = 'Orion') limit 2" \
  '"Sam"\n"Izzy"'

assert \
  "select name.first as * where (((age > 30 and age <= 40) or name.first = 'Orion') and age = 19) limit 2" \
  '"Orion"\n"Orion"'

assert \
  "select name.first as * where age > 30 and (age <= 40 or name.first = 'Orion') limit 3" \
  '"Sam"\n"Izzy"\n"Cameron"'

assert \
  "select name.first as * where name.first like _am% limit 2" \
  '"Sam"\n"Cameron"'

assert \
  "select id as * where id like 1 limit 10" \
  '1\n10\n11\n12\n13\n14\n15\n16\n17\n18'

assert \
  "select name.first as * where name.first ilike '^[aeiou]' offset 1 limit 3" \
  '"Abed"\n"Orion"\n"Ana"'

assert \
  "select id as * where id in (1,2,3) limit 3" \
  '1\n2\n3'

assert \
  "select id as * where 'heads' in data limit 2" \
  '0\n5'

assert \
  "select from_entries(('f', name.first), ('nest', from_entries(('age', age)))) limit 1" \
  '{"f":"Sam","nest":{"age":40}}'

assert_err \
  "{" \
  "where foo = 'bar'" \
  "json parse error: expecting property name"

assert_err \
  '{"foo":"bar"}\nfoobar\n{"foo":"bar"}' \
  "select true where foo = 'bar'" \
  "true\njson parse error: unexpected token: 'foobar'\ntrue"

assert_silent_err \
  '{"foo":"bar"}\nfoobar\n{"foo":"bar"}' \
  "select true where foo = 'bar'" \
  "true\ntrue"
