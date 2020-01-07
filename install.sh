set +x

: ${CSP_VERSION:="1.0.8"}
: ${QJS_VERSION:="2019-12-21"}

: ${ARCH:="darwin"}

echo "retrieving @paybase/csp@${CSP_VERSION}"
curl "https://unpkg.com/@paybase/csp@$CSP_VERSION/dist/esm/index.js" > ./src/csp.js

echo "retrieving quickjs@${QJS_VERSION}"
mkdir -p qjs && curl "https://bellard.org/quickjs/quickjs-${QJS_VERSION}.tar.xz" | tar xJf - -C qjs --strip-components 1

if [ "$ARCH" = "win" ]; then
  echo "editing makefile for windows"
  sed -i '' 's/#CONFIG_WIN32/CONFIG_WIN32/' qjs/Makefile
fi

cd qjs && make


