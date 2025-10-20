#!/bin/bash

# Little Links - Test Automation Script
# This script runs all tests automatically to save manual testing time

set -e  # Exit on any error

echo "🧪 Starting Little Links Test Automation"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required services are running
check_services() {
    print_status "Checking required services..."
    
    # Check if API is running
    if curl -s http://localhost:3000/health > /dev/null; then
        print_success "API is running on port 3000"
    else
        print_warning "API is not running. Starting API..."
        cd api && npm run start:dev &
        API_PID=$!
        sleep 10
        if curl -s http://localhost:3000/health > /dev/null; then
            print_success "API started successfully"
        else
            print_error "Failed to start API"
            exit 1
        fi
    fi
    
    # Check if Web is running for E2E tests
    if curl -s http://localhost:3002 > /dev/null; then
        print_success "Web app is running on port 3002"
    else
        print_warning "Web app is not running. Starting Web app..."
        cd web && npm run dev &
        WEB_PID=$!
        sleep 15
        if curl -s http://localhost:3002 > /dev/null; then
            print_success "Web app started successfully"
        else
            print_error "Failed to start Web app"
            exit 1
        fi
    fi
}

# Run API tests
run_api_tests() {
    print_status "Running API tests..."
    cd api
    
    # Unit tests
    print_status "Running API unit tests..."
    if npm run test; then
        print_success "API unit tests passed"
    else
        print_error "API unit tests failed"
        return 1
    fi
    
    # E2E tests
    print_status "Running API E2E tests..."
    if npm run test:e2e; then
        print_success "API E2E tests passed"
    else
        print_error "API E2E tests failed"
        return 1
    fi
    
    cd ..
}

# Run Web component tests
run_web_tests() {
    print_status "Running Web component tests..."
    cd web
    
    if npm run test; then
        print_success "Web component tests passed"
    else
        print_error "Web component tests failed"
        return 1
    fi
    
    cd ..
}

# Run E2E tests
run_e2e_tests() {
    print_status "Running E2E tests (Playwright)..."
    cd web
    
    if npm run test:e2e; then
        print_success "E2E tests passed"
    else
        print_error "E2E tests failed"
        return 1
    fi
    
    cd ..
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    if [ ! -z "$API_PID" ]; then
        kill $API_PID 2>/dev/null || true
    fi
    if [ ! -z "$WEB_PID" ]; then
        kill $WEB_PID 2>/dev/null || true
    fi
}

# Set trap to cleanup on exit
trap cleanup EXIT

# Main execution
main() {
    # Parse command line arguments
    SKIP_SERVICES=false
    QUICK_MODE=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-services)
                SKIP_SERVICES=true
                shift
                ;;
            --quick)
                QUICK_MODE=true
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --skip-services   Skip service health checks"
                echo "  --quick          Run only critical tests"
                echo "  --help           Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Check services unless skipped
    if [ "$SKIP_SERVICES" = false ]; then
        check_services
    fi
    
    # Start test execution
    TEST_START_TIME=$(date +%s)
    
    if [ "$QUICK_MODE" = true ]; then
        print_status "Running in quick mode (API unit tests + basic E2E)"
        
        if run_api_tests && run_e2e_tests; then
            TESTS_PASSED=true
        else
            TESTS_PASSED=false
        fi
    else
        print_status "Running full test suite"
        
        if run_api_tests && run_web_tests && run_e2e_tests; then
            TESTS_PASSED=true
        else
            TESTS_PASSED=false
        fi
    fi
    
    # Calculate execution time
    TEST_END_TIME=$(date +%s)
    EXECUTION_TIME=$((TEST_END_TIME - TEST_START_TIME))
    
    # Print final results
    echo ""
    echo "======================================="
    if [ "$TESTS_PASSED" = true ]; then
        print_success "🎉 All tests passed! Execution time: ${EXECUTION_TIME}s"
        echo ""
        print_success "Your app is ready for deployment! 🚀"
        exit 0
    else
        print_error "❌ Some tests failed. Execution time: ${EXECUTION_TIME}s"
        echo ""
        print_error "Please fix the failing tests before deployment."
        exit 1
    fi
}

# Run main function
main "$@"
