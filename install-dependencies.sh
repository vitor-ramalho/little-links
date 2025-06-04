#!/bin/zsh

# Script to install dependencies for the enhanced URL shortener project

# Display message function
echo_msg() {
  echo "\n\033[1;34m==>\033[0m \033[1m$1\033[0m"
}

echo_msg "Installing dependencies for the enhanced URL shortener project"

# Navigate to web directory
cd web

# Install required packages
echo_msg "Installing UI and animation dependencies"
npm install --legacy-peer-deps \
  @radix-ui/react-accordion \
  @radix-ui/react-dialog \
  @radix-ui/react-popover \
  @radix-ui/react-switch \
  @radix-ui/react-tabs \
  date-fns \
  react-day-picker \
  recharts \
  class-variance-authority

echo_msg "All dependencies installed successfully!"
echo "You can now run 'npm run dev' to start the development server."
