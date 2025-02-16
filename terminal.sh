#!/bin/bash
SCRIPT_DIR="$(realpath "$(dirname "${BASH_SOURCE[0]}")")"
echo "Starting terminal in $SCRIPT_DIR"

xfce4-terminal \
  --window -T "Blog" \
  --working-directory="$SCRIPT_DIR" --command="vscodium" \
  --tab -H -T "Terminal" \
  --working-directory="$SCRIPT_DIR" --command="bash" \
  --tab -H -T "Documentation" \
  --working-directory="$SCRIPT_DIR" --command="yarn docpress" \
  --tab -H -T "Build Loop" \
  --working-directory="$SCRIPT_DIR" --command="watch -n 60 yarn build"
