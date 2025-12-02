#!/bin/bash

# Test setup script for Ghost Crossing containerization

TEST_CONTAINER_NAME="ghost-crossing-test"
TEST_IMAGE_NAME="ghost-crossing:test"
TEST_PORT=8081

# Cleanup function
cleanup_test_container() {
    echo "Cleaning up test container..."
    if [ "$(docker ps -aq -f name=$TEST_CONTAINER_NAME)" ]; then
        docker stop $TEST_CONTAINER_NAME 2>/dev/null
        docker rm $TEST_CONTAINER_NAME 2>/dev/null
        echo "✓ Test container cleaned up"
    fi
}

# Build test image
build_test_image() {
    echo "Building test image..."
    docker build -t $TEST_IMAGE_NAME .
    
    if [ $? -ne 0 ]; then
        echo "✗ Failed to build test image!"
        return 1
    fi
    echo "✓ Test image built successfully"
    return 0
}

# Start test container
start_test_container() {
    echo "Starting test container..."
    
    # Cleanup any existing test container
    cleanup_test_container
    
    # Start new test container
    docker run -d \
        --name $TEST_CONTAINER_NAME \
        -p $TEST_PORT:80 \
        $TEST_IMAGE_NAME
    
    if [ $? -ne 0 ]; then
        echo "✗ Failed to start test container!"
        return 1
    fi
    
    echo "✓ Test container started"
    
    # Wait for container to be healthy
    echo "Waiting for container to be ready..."
    sleep 3
    
    # Check if container is running
    if [ "$(docker ps -q -f name=$TEST_CONTAINER_NAME)" ]; then
        echo "✓ Test container is running"
        
        # Verify health check
        for i in {1..10}; do
            if curl -s http://localhost:$TEST_PORT/ > /dev/null 2>&1; then
                echo "✓ Container health check passed"
                return 0
            fi
            echo "Waiting for container to respond... ($i/10)"
            sleep 1
        done
        
        echo "✗ Container health check failed!"
        return 1
    else
        echo "✗ Test container is not running!"
        return 1
    fi
}

# Export functions and variables for use in tests
export TEST_CONTAINER_NAME
export TEST_IMAGE_NAME
export TEST_PORT
export -f cleanup_test_container
export -f build_test_image
export -f start_test_container

echo "Test setup script loaded"
echo "Test container name: $TEST_CONTAINER_NAME"
echo "Test port: $TEST_PORT"
