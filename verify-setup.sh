#!/bin/bash

echo "🔍 Verifying Exam Portal Setup"
echo "================================"
echo ""

# Check if bank folder exists
if [ ! -d "bank" ]; then
    echo "❌ bank folder not found"
    exit 1
fi
echo "✓ bank folder exists"

# Check for JSON files
json_count=$(find bank -name "*.json" -type f | wc -l | tr -d ' ')
if [ "$json_count" -eq 0 ]; then
    echo "⚠️  No JSON files found in bank folder"
    echo "   Add question bank files to get started"
else
    echo "✓ Found $json_count question bank file(s)"
fi

# List and validate JSON files
echo ""
echo "Question Banks:"
echo "---------------"

for file in bank/*.json; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        
        # Check if file is valid JSON
        if jq empty "$file" 2>/dev/null; then
            # Get bank info
            name=$(jq -r '.name // "Unknown"' "$file")
            question_count=$(jq '.questions | length' "$file" 2>/dev/null || echo "0")
            
            echo "  ✓ $filename"
            echo "    Name: $name"
            echo "    Questions: $question_count"
        else
            echo "  ❌ $filename (Invalid JSON)"
        fi
    fi
done

echo ""
echo "Dependencies:"
echo "-------------"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found"
    echo "   Run: npm install"
else
    echo "✓ node_modules installed"
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found"
    exit 1
fi
echo "✓ package.json exists"

echo ""
echo "Build Test:"
echo "-----------"

# Try to build
if command -v npx &> /dev/null; then
    echo "Building static site..."
    if npx tsx script/build-static.ts > /tmp/build.log 2>&1; then
        echo "✓ Build successful"
        
        # Check if bank files were copied
        if [ -d "dist/public/bank" ]; then
            bank_files=$(find dist/public/bank -name "*.json" -type f | wc -l | tr -d ' ')
            echo "✓ $bank_files bank file(s) copied to dist/public/bank"
            
            if [ -f "dist/public/bank/manifest.json" ]; then
                echo "✓ manifest.json created"
            else
                echo "⚠️  manifest.json not found"
            fi
        else
            echo "⚠️  dist/public/bank folder not created"
        fi
    else
        echo "❌ Build failed"
        echo "   Check /tmp/build.log for details"
        tail -n 20 /tmp/build.log
        exit 1
    fi
else
    echo "⚠️  npx not found, skipping build test"
fi

echo ""
echo "================================"
echo "✅ Setup verification complete!"
echo ""
echo "Next steps:"
echo "  1. Add question banks to the bank/ folder"
echo "  2. Run: npm run dev (for local development)"
echo "  3. Or push to GitHub for automatic deployment"
echo ""
echo "For more info, see:"
echo "  - bank/README.md (question format)"
echo "  - DEPLOYMENT.md (deployment guide)"
echo "  - README.md (general usage)"
