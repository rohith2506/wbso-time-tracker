#!/bin/bash

# Build React frontend
echo "Building React frontend..."
cd frontend
npm install
npm run build

# Copy built files to backend static directory
echo "Copying build files to backend..."
cd ..
mkdir -p backend/static
cp -r frontend/build/* backend/static/

echo "Build complete!"
