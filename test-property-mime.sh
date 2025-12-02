#!/bin/bash

# Property-Based Test: MIME Type Correctness
# Feature: game-containerization, Property 1: MIME Type Correctness
# Validates: Requirements 3.1

# Source the test setup
source ./test-setup.sh

ITERATIONS=100
TESTS_PASSED=0
TESTS_FAILED=0

# Test helper functions
pass_test() {
    ((TESTS_PASSED++))
}

fail_test() {
    echo "✗ FAIL: $1"
    ((TESTS_FAILED++))
}

# Property: For any static file type (HTML, CSS, JavaScript), 
# when the web server serves that file, the Content-Type header 
# should match the expected MIME type for that file extension.

test_mime_type_property() {
    local file_path=$1
    local expected_mime=$2
    local iteration=$3
    
    # Make HTTP request and get Content-Type header
    CONTENT_TYPE=$(curl -s -I http://localhost:$TEST_PORT/$file_path | grep -i "content-type:" | cut -d' ' -f2- | tr -d '\r\n')
    
    # Check if Content-Type contains the expected MIME type
    if [[ $CONTENT_TYPE == *"$expected_mime"* ]]; then
        pass_test
    else
        fail_test "Iteration $iteration: $file_path - Expected '$expected_mime', got '$CONTENT_TYPE'"
    fi
}

# Setup test environment
echo "========================================"
echo "Property Test: MIME Type Correctness"
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

echo ""
echo "Running property tests with $ITERATIONS iterations..."
echo ""

# Define test cases: file path and expected MIME type
declare -A test_cases=(
    ["index.html"]="text/html"
    ["game.js"]="application/javascript"
    ["style.css"]="text/css"
)

# Run property tests across multiple iterations
for ((i=1; i<=ITERATIONS; i++)); do
    # Test each file type
    for file in "${!test_cases[@]}"; do
        expected_mime="${test_cases[$file]}"
        test_mime_type_property "$file" "$expected_mime" "$i"
    done
    
    # Progress indicator every 10 iterations
    if [ $((i % 10)) -eq 0 ]; then
        echo "Progress: $i/$ITERATIONS iterations completed"
    fi
done

# Cleanup
cleanup_test_container

# Summary
echo ""
echo "========================================"
echo "Property Test Summary"
echo "========================================"
echo "Total Iterations: $ITERATIONS"
echo "Total Tests: $((ITERATIONS * ${#test_cases[@]}))"
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo "========================================"

if [ $TESTS_FAILED -eq 0 ]; then
    echo "✓ All property tests passed!"
    echo "Property verified: MIME types are correct for all file types across $ITERATIONS iterations"
    exit 0
else
    echo "✗ Some property tests failed!"
    exit 1
fi
