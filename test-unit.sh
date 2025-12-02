#!/bin/bash

# Unit tests for Ghost Crossing containerization

# Source the test setup
source ./test-setup.sh

TESTS_PASSED=0
TESTS_FAILED=0

# Test helper functions
pass_test() {
    echo "✓ PASS: $1"
    ((TESTS_PASSED++))
}

fail_test() {
    echo "✗ FAIL: $1"
    ((TESTS_FAILED++))
}

# Test 1: Docker image builds successfully
test_image_builds() {
    echo ""
    echo "Test 1: Docker image builds successfully"
    
    if build_test_image; then
        pass_test "Docker image builds successfully"
    else
        fail_test "Docker image build failed"
    fi
}

# Test 2: All game files are present in the container
test_files_present() {
    echo ""
    echo "Test 2: All game files are present in the container"
    
    # Check for index.html
    if docker run --rm $TEST_IMAGE_NAME ls /usr/share/nginx/html/index.html > /dev/null 2>&1; then
        pass_test "index.html is present"
    else
        fail_test "index.html is missing"
    fi
    
    # Check for game.js
    if docker run --rm $TEST_IMAGE_NAME ls /usr/share/nginx/html/game.js > /dev/null 2>&1; then
        pass_test "game.js is present"
    else
        fail_test "game.js is missing"
    fi
    
    # Check for style.css
    if docker run --rm $TEST_IMAGE_NAME ls /usr/share/nginx/html/style.css > /dev/null 2>&1; then
        pass_test "style.css is present"
    else
        fail_test "style.css is missing"
    fi
}

# Test 3: Container starts and nginx process runs
test_container_starts() {
    echo ""
    echo "Test 3: Container starts and nginx process runs"
    
    if start_test_container; then
        pass_test "Container starts successfully"
        
        # Check if nginx is running
        if docker exec $TEST_CONTAINER_NAME ps aux | grep -q "[n]ginx"; then
            pass_test "nginx process is running"
        else
            fail_test "nginx process is not running"
        fi
    else
        fail_test "Container failed to start"
    fi
}

# Test 4: Container responds to HTTP requests
test_http_response() {
    echo ""
    echo "Test 4: Container responds to HTTP requests"
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$TEST_PORT/)
    
    if [ "$HTTP_CODE" = "200" ]; then
        pass_test "Container responds with HTTP 200"
    else
        fail_test "Container responded with HTTP $HTTP_CODE (expected 200)"
    fi
}

# Test 5: Image size is within acceptable limits (< 50MB)
test_image_size() {
    echo ""
    echo "Test 5: Image size is within acceptable limits (< 50MB)"
    
    # Get image size in MB
    IMAGE_SIZE=$(docker images $TEST_IMAGE_NAME --format "{{.Size}}" | head -1)
    
    # Extract numeric value (handle MB/GB suffixes)
    if [[ $IMAGE_SIZE == *"GB"* ]]; then
        fail_test "Image size is $IMAGE_SIZE (exceeds 50MB limit)"
    elif [[ $IMAGE_SIZE == *"MB"* ]]; then
        SIZE_NUM=$(echo $IMAGE_SIZE | sed 's/MB//')
        if (( $(echo "$SIZE_NUM < 50" | bc -l) )); then
            pass_test "Image size is $IMAGE_SIZE (within 50MB limit)"
        else
            fail_test "Image size is $IMAGE_SIZE (exceeds 50MB limit)"
        fi
    else
        pass_test "Image size is $IMAGE_SIZE (within 50MB limit)"
    fi
}

# Run all tests
echo "========================================"
echo "Running Unit Tests"
echo "========================================"

test_image_builds
test_files_present
test_container_starts
test_http_response
test_image_size

# Cleanup
cleanup_test_container

# Summary
echo ""
echo "========================================"
echo "Test Summary"
echo "========================================"
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo "========================================"

if [ $TESTS_FAILED -eq 0 ]; then
    echo "✓ All unit tests passed!"
    exit 0
else
    echo "✗ Some unit tests failed!"
    exit 1
fi
