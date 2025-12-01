#!/bin/bash

echo "Testing Exam Portal API Endpoints"
echo "=================================="
echo ""

# Check if server is running
if ! curl -s http://localhost:5000 > /dev/null; then
    echo "❌ Server is not running on port 5000"
    echo "   Start the server with: npm run dev"
    exit 1
fi

echo "✓ Server is running"
echo ""

# Test GET /api/question-banks
echo "Testing: GET /api/question-banks"
echo "--------------------------------"
response=$(curl -s http://localhost:5000/api/question-banks)
count=$(echo "$response" | jq '. | length' 2>/dev/null)

if [ $? -eq 0 ] && [ "$count" -gt 0 ]; then
    echo "✓ Successfully fetched $count question bank(s)"
    echo "$response" | jq -r '.[] | "  - \(.name) (\(.questions | length) questions)"'
else
    echo "❌ Failed to fetch question banks"
    echo "Response: $response"
fi

echo ""

# Test GET /api/question-banks/:id
echo "Testing: GET /api/question-banks/aws-ai-practitioner"
echo "---------------------------------------------------"
response=$(curl -s http://localhost:5000/api/question-banks/aws-ai-practitioner)
name=$(echo "$response" | jq -r '.name' 2>/dev/null)

if [ $? -eq 0 ] && [ "$name" != "null" ]; then
    questions=$(echo "$response" | jq '.questions | length')
    echo "✓ Successfully fetched: $name"
    echo "  Questions: $questions"
else
    echo "❌ Failed to fetch specific question bank"
    echo "Response: $response"
fi

echo ""
echo "=================================="
echo "API Testing Complete"
