#!/bin/bash

# Stop and cleanup script for Ghost Crossing Docker container

CONTAINER_NAME="ghost-crossing-game"

echo "Stopping Ghost Crossing container..."

# Stop the container
docker stop $CONTAINER_NAME

if [ $? -eq 0 ]; then
    echo "✓ Container stopped successfully!"
    
    # Remove the container
    echo "Removing container..."
    docker rm $CONTAINER_NAME
    
    if [ $? -eq 0 ]; then
        echo "✓ Container removed successfully!"
    else
        echo "✗ Failed to remove container!"
        exit 1
    fi
else
    echo "✗ Failed to stop container (it may not be running)!"
    exit 1
fi
