#!/bin/bash

echo "🔍 Checking TypeScript types..."

# Run TypeScript compiler in noEmit mode to check for type errors
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ No TypeScript errors found!"
else
    echo "❌ TypeScript errors found. Please fix them before committing."
    exit 1
fi