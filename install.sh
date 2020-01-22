set -e

: ${VERSION:="1.0.1"}

case "$(uname)" in
  Darwin) platform="darwin" ;;
  Linux) platform="linux" ;;
  *) echo "unknown platform"; exit 1 ;;
esac

url="https://github.com/paybase/qp/releases/download/$VERSION/qp-$VERSION-$platform.tar.gz"

echo "👌  fetching download for qp $VERSION ($platform)"
curl -sL $url | tar -zxf - -C /usr/local/bin
echo "
🎉  successfully installed qp $VERSION ($platform)

see \`qp --help\` for usage.
"
