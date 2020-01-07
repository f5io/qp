curl this > https://unpkg.com/@paybase/csp@1.0.8/dist/esm/index.js
curl this > https://bellard.org/quickjs/quickjs-2019-12-21.tar.xz

circle, each arch:
  - install qjs/qjsc (make install)

      untar
      make

  - mount in src
  - test with qjs
 
    node test/foo.js | qjs src/main.js

  - compile with qjsc

      ./qjsc -o bin/{arch}/qp \
        -fno-proxy \
        -fno-eval \
        -fno-string-normalize \
        -fno-map \
        -fno-typedarray
        src/main.js

  - release to github
