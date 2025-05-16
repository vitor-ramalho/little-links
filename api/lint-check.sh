#!/bin/bash
# Script to run ESLint on the project

# Navigate to the API directory
cd "$(dirname "$0")"

# Display header
echo "====================================="
echo "Little Link - ESLint Code Validation"
echo "====================================="
echo ""

# Run ESLint in check mode first
echo "Checking code for linting issues..."
npx eslint --ext .ts ./src --max-warnings 0

# Check if the lint check passed
if [ $? -eq 0 ]; then
  echo "✅ Code validation passed!"
else
  echo ""
  echo "❌ Code validation failed!"
  echo ""
  read -p "Would you like to attempt to fix the issues automatically? (y/n) " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Running ESLint with auto-fix..."
    npx eslint --ext .ts ./src --fix
    echo ""
    echo "Auto-fix complete. Please check the results and fix any remaining issues manually."
  fi
fi

echo ""
echo "For detailed linting in your IDE, make sure the ESLint extension is installed and enabled."
