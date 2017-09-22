
#!/bin/bash

set -e
set -x

DIR=$(realpath $(dirname "$0"))

# Build the default nginx config files.
cp "$DIR/../../nginx.conf" "$DIR/nginx/nginx.conf"
