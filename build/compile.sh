: ${ARCH:="darwin"}
: ${VERSION:="1.0.0"}

set -x 

mkdir -p "bin/$ARCH"
mkdir -p "bin/release"

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

tar -zcf "`pwd`/bin/release/qp-$VERSION-$ARCH.tar.gz" -C "`pwd`/bin/$ARCH" qp
