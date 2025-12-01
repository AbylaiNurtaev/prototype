#!/bin/bash

ZONE_NAME="btc-prototype"

ACCESS_KEY="32543b6b-4807-4604-b17325c86cf1-6d23-492c"

DIST_DIR="./dist"

find "$DIST_DIR" -type f | while read -r file; do
  REL_PATH="${file#$DIST_DIR/}"
  echo "Uploading $REL_PATH"
  curl -s -T "$file" \
    -H "AccessKey: $ACCESS_KEY" \
    "https://storage.bunnycdn.com/$ZONE_NAME/$REL_PATH"
done

