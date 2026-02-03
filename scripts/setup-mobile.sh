#!/bin/bash

# Mobile Setup Script for Refunds Tracker
# This script helps set up the mobile development environment

echo "🚀 Setting up Refunds Tracker for Mobile Development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Build the web app
echo "🔨 Building web app..."
npm run build

# Check which platform to set up
echo ""
echo "Which platform would you like to set up?"
echo "1) Android"
echo "2) iOS (macOS only)"
echo "3) Both"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "🤖 Setting up Android..."
        npm run cap:add:android
        echo "✅ Android setup complete!"
        echo "📱 To open Android Studio, run: npm run cap:open:android"
        ;;
    2)
        if [[ "$OSTYPE" != "darwin"* ]]; then
            echo "❌ iOS setup requires macOS"
            exit 1
        fi
        echo "🍎 Setting up iOS..."
        npm run cap:add:ios
        echo "✅ iOS setup complete!"
        echo "📱 To open Xcode, run: npm run cap:open:ios"
        echo "📝 Don't forget to run: cd ios/App && pod install"
        ;;
    3)
        echo "🤖 Setting up Android..."
        npm run cap:add:android
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            echo "🍎 Setting up iOS..."
            npm run cap:add:ios
            echo "📝 Don't forget to run: cd ios/App && pod install"
        else
            echo "⚠️  Skipping iOS setup (requires macOS)"
        fi
        
        echo "✅ Both platforms setup complete!"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Review MOBILE_SETUP.md for detailed instructions"
echo "2. Open the native project: npm run cap:open:android (or cap:open:ios)"
echo "3. Configure permissions and build settings"
echo "4. Build and test on device/emulator"
