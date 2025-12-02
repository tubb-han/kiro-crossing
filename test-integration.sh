#!/bin/bash

# Integration tests for Ghost Crossing containerization

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

# Test 1: Accessing root path returns index.html
test_root_returns_index() {
    echo ""
    echo "Test 1: Accessing root path returns index.html"
    
    RESPONSE=$(curl -s http://localhost:$TEST_PORT/)
    
    if [[ $RESPONSE == *"<!DOCTYPE html>"* ]] && [[ $RESPONSE == *"<html"* ]]; then
        pass_test "Root path returns HTML document"
    else
        fail_test "Root path does not return valid HTML"
    fi
}

# Test 2: Game canvas element is present in served HTML
test_canvas_present() {
    echo ""
    echo "Test 2: Game canvas element is present in served HTML"
    
    RESPONSE=$(curl -s http://localhost:$TEST_PORT/)
    
    if [[ $RESPONSE == *"gameCanvas"* ]] && [[ $RESPONSE == *"<canvas"* ]]; then
        pass_test "Canvas element is present in HTML"
    else
        fail_test "Canvas element is missing from HTML"
    fi
    
    # Also check for game title
    if [[ $RESPONSE == *"Ghost Crossing"* ]]; then
        pass_test "Game title is present in HTML"
    else
        fail_test "Game title is missing from HTML"
    fi
}

# Test 3: All game assets are accessible via HTTP
test_assets_accessible() {
    echo ""
    echo "Test 3: All game assets are accessible via HTTP"
    
    # Test index.html
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$TEST_PORT/index.html)
    if [ "$HTTP_CODE" = "200" ]; then
        pass_test "index.html is accessible (HTTP 200)"
    else
        fail_test "index.html returned HTTP $HTTP_CODE"
    fi
    
    # Test game.js
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$TEST_PORT/game.js)
    if [ "$HTTP_CODE" = "200" ]; then
        pass_test "game.js is accessible (HTTP 200)"
    else
        fail_test "game.js returned HTTP $HTTP_CODE"
    fi
    
    # Test style.css
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$TEST_PORT/style.css)
    if [ "$HTTP_CODE" = "200" ]; then
        pass_test "style.css is accessible (HTTP 200)"
    else
        fail_test "style.css returned HTTP $HTTP_CODE"
    fi
}

# Test 4: Port mapping works correctly
test_port_mapping() {
    echo ""
    echo "Test 4: Port mapping works correctly"
    
    # Check if we can connect to the mapped port
    if curl -s http://localhost:$TEST_PORT/ > /dev/null 2>&1; then
        pass_test "Port mapping is working (can connect to port $TEST_PORT)"
    else
        fail_test "Cannot connect to port $TEST_PORT"
    fi
    
    # Verify container is listening on internal port 80
    CONTAINER_PORT=$(docker port $TEST_CONTAINER_NAME | grep "80/tcp" | cut -d':' -f2)
    if [ "$CONTAINER_PORT" = "$TEST_PORT" ]; then
        pass_test "Container port 80 is mapped to host port $TEST_PORT"
    else
        fail_test "Port mapping mismatch"
    fi
}

# Test 5: Container logs are being written
test_logs_written() {
    echo ""
    echo "Test 5: Container logs are being written"
    
    # Make a request to generate log entry
    curl -s http://localhost:$TEST_PORT/ > /dev/null
    
    # Wait a moment for logs to be written
    sleep 1
    
    # Check if logs contain our request
    LOGS=$(docker logs $TEST_CONTAINER_NAME 2>&1)
    
    if [[ $LOGS == *"GET"* ]] || [[ $LOGS == *"/"* ]]; then
        pass_test "Container logs are being written"
    else
        fail_test "No log entries found"
    fi
}

# Setup test environment
echo "========================================"
echo "Running Integration Tests"
echo "========================================"
echo "Building and starting test container..."

if ! build_test_image; then
    echo "✗ Failed to build test image"
    exit 1
fi

if ! start_test_container; then
    echo "✗ Failed to start test container"
    cleanup_test_container
    exit 1
fi

# Run all tests
test_root_returns_index
test_canvas_present
test_assets_accessible
test_port_mapping
test_logs_written

# Cleanup
cleanup_test_container

# Summary
echo ""
echo "========================================"
echo "Integration Test Summary"
echo "========================================"
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo "========================================"

if [ $TESTS_FAILED -eq 0 ]; then
    echo "✓ All integration tests passed!"
    exit 0
else
    echo "✗ Some integration tests failed!"
    exit 1
fi
