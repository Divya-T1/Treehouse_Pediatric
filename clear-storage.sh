#!/bin/bash

# Clear Expo cache and restart
echo "Clearing Expo cache..."
npx expo start --clear

# For React Native CLI (if needed):
# watchman watch-del-all
# rm -rf node_modules
# npm install
# npm start -- --reset-cache

echo "Done! The app should restart with cleared cache."

