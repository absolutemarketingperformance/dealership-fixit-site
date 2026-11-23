#!/usr/bin/env bash
# Inlines _head.html into every page's <!--HEAD--> marker. Output goes to ./dist (what gets deployed).
set -e
cd "$(dirname "$0")"
rm -rf dist && mkdir -p dist
cp -r assets api vercel.json dist/
HEAD=$(cat _head.html)
for f in *.html; do
  [[ "$f" == _* ]] && continue
  python3 - "$f" "dist/$f" <<'PY'
import sys
src, dst = sys.argv[1], sys.argv[2]
head = open("_head.html").read()
open(dst, "w").write(open(src).read().replace("<!--HEAD-->", head))
PY
done
echo "built $(ls dist/*.html | wc -l) pages into dist/"
