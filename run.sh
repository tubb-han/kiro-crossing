#!/bin/bash

# Run script for Ghost Crossing Docker container

CONTAINER_NAME="ghost-crossing-game"
IMAGE_NAME="ghost-crossing:latest"
HOST_PORT=8080
CONTAINER_PORT=80

echo "Starting Ghost Crossing container..."

# Check if container already exists
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "Container $CONTAINER_NAME already exists. Removing..."
    docker rm -f $CONTAINER_NAME
fi

# Run the container
docker run -d \
    --name $CONTAINER_NAME \
    -p $HOST_PORT:$CONTAINER_PORT \
    --restart unless-stopped \
    $IMAGE_NAME

if [ $? -eq 0 ]; then
    echo "✓ Container started successfully!"
    echo "Game is accessible at: http://localhost:$HOST_PORT"
    echo "Container name: $CONTAINER_NAME"
    docker ps -f name=$CONTAINER_NAME
else
    echo "✗ Failed to start container!"
    exit 1
fi
