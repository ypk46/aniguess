#!/bin/bash

# Test script for AniGuess TypeScript setup
echo "🧪 Testing AniGuess TypeScript Setup"
echo "=================================="

# Check Node.js version
echo "📋 Node.js version:"
node --version

# Check if we're using the right version
if [ -f .nvmrc ]; then
    expected_version=$(cat .nvmrc)
    current_version=$(node --version | sed 's/v//')
    major_version=$(echo $current_version | cut -d. -f1)
    
    if [ "$major_version" = "$expected_version" ]; then
        echo "✅ Using correct Node.js version (v$expected_version)"
    else
        echo "⚠️  Expected Node.js v$expected_version, but using v$current_version"
        echo "   Run 'nvm use' to switch to the correct version"
    fi
fi

echo ""
echo "📦 Dependencies check:"
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Dependencies not installed. Run 'npm install'"
    exit 1
fi

echo ""
echo "🔧 TypeScript compilation:"
npm run build
if [ $? -eq 0 ]; then
    echo "✅ TypeScript compilation successful"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

echo ""
echo "🎨 Code formatting check:"
npm run format:check
if [ $? -eq 0 ]; then
    echo "✅ Code formatting is correct"
else
    echo "⚠️  Code formatting issues found. Run 'npm run format' to fix"
fi

echo ""
echo "🔍 Type checking:"
npm run type-check
if [ $? -eq 0 ]; then
    echo "✅ Type checking passed"
else
    echo "❌ Type checking failed"
    exit 1
fi

echo ""
echo "📁 Build output:"
if [ -d "dist" ]; then
    echo "✅ Build directory exists"
    echo "   Files generated:"
    find dist -name "*.js" | sed 's/^/   - /'
else
    echo "❌ Build directory not found"
    exit 1
fi

echo ""
echo "🎉 All checks passed! The TypeScript setup is ready."
echo ""
echo "📚 Quick start:"
echo "   npm run dev    # Start development server"
echo "   npm run build  # Build for production"
echo "   npm start      # Start production server"
