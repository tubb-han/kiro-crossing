#!/bin/bash

# Property-Based Test: File Integrity Preservation
# Feature: game-containerization, Property 2: File Integrity Preservation
# Validates: Requirements 4.4

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

# Property: For any static game file in the source directory, 
# when that file is served by the containerized web server, 
# the content should be byte-for-byte identical to the original source file.

test_file_integrity_property() {
    local file_path=$1
    local iteration=$2
    
    # Compute checksum of source file
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows
        SOURCE_CHECKSUM=$(certutil -hashfile "$file_path" MD5 | findstr /v ":" | tr -d ' \r\n')
    else
        # Linux/Mac
        SOURCE_CHECKSUM=$(md5sum "$file_path" | cut -d' ' -f1)
    fi
    
    # Fetch file from container and compute checksum
    SERVED_CONTENT=$(curl -s http://localhost:$TEST_PORT/$file_path)
    
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
        # Windows - save to temp file and hash
        echo "$SERVED_CONTENT" > temp_served_file.tmp
        SERVED_CHECKSUM=$(certutil -hashfile temp_served_file.tmp MD5 | findstr /v ":" | tr -d ' \r\n')
        rm -f temp_served_file.tmp
    else
        # Linux/Mac
        SERVED_CHECKSUM=$(echo -n "$SERVED_CONTENT" | md5sum | cut -d' ' -f1)
    fi
    
    # Compare checksums
    if [ "$SOURCE_CHECKSUM" = "$SERVED_CHECKSUM" ]; then
        pass_test
    else
        fail_test "Iteration $iteration: $file_path - Checksum mismatch (source: $SOURCE_CHECKSUM, served: $SERVED_CHECKSUM)"
    fi
}

# Setup test environment
echo "========================================"
echo "Property Test: File Integrity"
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

# Define test files
test_files=("index.html" "game.js" "style.css")

# Run property tests across multiple iterations
for ((i=1; i<=ITERATIONS; i++)); do
    # Test each file
    for file in "${test_files[@]}"; do
        test_file_integrity_property "$file" "$i"
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
echo "Total Tests: $((ITERATIONS * ${#test_files[@]}))"
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo "========================================"

if [ $TESTS_FAILED -eq 0 ]; then
    echo "✓ All property tests passed!"
    echo "Property verified: File integrity preserved across $ITERATIONS iterations"
    exit 0
else
    echo "✗ Some property tests failed!"
    exit 1
fi
