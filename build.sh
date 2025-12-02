#!/bin/bash

# Build script for Ghost Crossing Docker image

echo "Building Ghost Crossing Docker image..."
docker build -t ghost-crossing:latest .

if [ $? -eq 0 ]; then
    echo "✓ Build successful!"
    echo "Image: ghost-crossing:latest"
    docker images ghost-crossing:latest
else
    echo "✗ Build failed!"
    exit 1
fi
