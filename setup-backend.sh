#!/bin/bash

echo "🚀 Echo Backend Setup Script"
echo "=============================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Navigate to server directory
if [ ! -d "server" ]; then
    echo "❌ Server directory not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Installing backend dependencies..."
cd server
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "✅ Backend dependencies installed successfully!"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "=============================="
echo "✨ Setup Complete!"
echo "=============================="
echo ""
echo "To start the backend server:"
echo "  cd server"
echo "  npm run dev"
echo ""
echo "The server will run on http://localhost:3001"
echo ""
echo "To start the frontend:"
echo "  npm run dev"
echo ""
echo "See BACKEND_INTEGRATION.md for more details."
