set -x

url="https://github.com/tcnksm/ghr/releases/download/v0.13.0/ghr_v0.13.0_linux_amd64.tar.gz"
curl -sL $url | tar -zxf -

for file in bin/release/*; do
  local filename="$(basename $file)"
  echo "$(openssl dgst -sha256 "$file" | cut -d' ' -f2) - $filename" > bin/release/SHASUM
done

cat bin/release/SHASUM

#./ghr -u paybase -r qp $CIRCLE_TAG bin/release/

