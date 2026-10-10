#!/bin/bash
if [ ! -d node_modules ] || [ ! -f .os-marker ] || [ "$(cat .os-marker)" != "linux" ]; then
  echo "Setup untuk Ubuntu..."
  rm -rf node_modules
  npm install
  echo "linux" > .os-marker
fi
npm run dev