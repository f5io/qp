set -x

: ${GHR_VERSION:="0.13.0"}
: ${VERSION:="1.0.0"}

url="https://github.com/tcnksm/ghr/releases/download/v${GHR_VERSION}/ghr_v${GHR_VERSION}_linux_amd64.tar.gz"
curl -sL $url | tar -zxf - -C . --strip-components 1 "ghr_v${GHR_VERSION}_linux_amd64/ghr"

for file in bin/release/*; do
  filename="$(basename $file)"
  echo "$(openssl dgst -sha256 "$file" | cut -d' ' -f2) - $filename" >> bin/release/SHASUM
done

cat bin/release/SHASUM

./ghr \
  -u paybase \
  -r qp \
  -n $VERSION \
  -c $COMMIT_SHA \
  -delete \
  $VERSION bin/release/

