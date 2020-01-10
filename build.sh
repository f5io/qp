: ${ARCH:="darwin"}

set +e

mkdir -p "bin/$ARCH"

#  -fno-bigint \ - not supported in quickjs versions prior to 2020-01-05

./qjs/qjsc \
  -o "bin/$ARCH/qp" \
  -fno-proxy \
  -fno-eval \
  -fno-string-normalize \
  -fno-map \
  -fno-typedarray \
  src/main.js

ls -lh "bin/$ARCH"
