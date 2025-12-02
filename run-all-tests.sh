#!/bin/bash

# Master test runner for Ghost Crossing containerization

echo "========================================"
echo "Ghost Crossing - Test Suite"
echo "========================================"
echo ""

TOTAL_FAILED=0

# Run unit tests
echo "Running Unit Tests..."
./test-unit.sh
if [ $? -ne 0 ]; then
    ((TOTAL_FAILED++))
fi

echo ""
echo "========================================"
echo ""

# Run property test for MIME types
echo "Running Property Test: MIME Type Correctness..."
./test-property-mime.sh
if [ $? -ne 0 ]; then
    ((TOTAL_FAILED++))
fi

echo ""
echo "========================================"
echo ""

# Run property test for file integrity
echo "Running Property Test: File Integrity..."
./test-property-integrity.sh
if [ $? -ne 0 ]; then
    ((TOTAL_FAILED++))
fi

echo ""
echo "========================================"
echo ""

# Run integration tests
echo "Running Integration Tests..."
./test-integration.sh
if [ $? -ne 0 ]; then
    ((TOTAL_FAILED++))
fi

echo ""
echo "========================================"
echo "Final Test Summary"
echo "========================================"

if [ $TOTAL_FAILED -eq 0 ]; then
    echo "✓ ALL TEST SUITES PASSED!"
    echo ""
    echo "Containerization is complete and verified."
    echo "You can now deploy the game using:"
    echo "  - docker-compose up -d"
    echo "  - ./build.sh && ./run.sh"
    echo ""
    echo "Game will be accessible at: http://localhost:8080"
    exit 0
else
    echo "✗ $TOTAL_FAILED test suite(s) failed"
    echo "Please review the test output above"
    exit 1
fi
