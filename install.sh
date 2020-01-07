: ${CSP_VERSION:="1.0.8"}
: ${QJS_VERSION:="2019-12-21"}

echo "retrieving @paybase/csp@${CSP_VERSION}"
curl "https://unpkg.com/@paybase/csp@$CSP_VERSION/dist/esm/index.js" > ./src/csp.js

echo "retrieving quickjs@${QJS_VERSION}"
mkdir -p qjs && curl "https://bellard.org/quickjs/quickjs-${QJS_VERSION}.tar.xz" | tar xvz - -C qjs --strip-components 1
cd qjs && make


