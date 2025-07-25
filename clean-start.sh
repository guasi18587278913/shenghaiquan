#!/bin/bash

echo "🧹 Cleaning build cache and dependencies..."

# Stop any running processes on port 3000
echo "Stopping processes on port 3000..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Remove build directories and caches
echo "Removing build directories..."
rm -rf .next
rm -rf ".next 2"
rm -rf node_modules/.cache

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Build the project
echo "Building the project..."
npm run build

echo "✅ Clean build completed!"
echo "You can now run 'npm run dev' to start the development server."