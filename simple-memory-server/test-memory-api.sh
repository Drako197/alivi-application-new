#!/bin/bash
echo "🧪 Testing Memory API..."

# Test health endpoint
echo "Testing health endpoint..."
curl -s http://localhost:3001/health | jq .

# Test storing memory
echo -e "\nTesting memory storage..."
curl -s -X POST http://localhost:3001/memory \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-123",
    "type": "preference",
    "key": "response_style",
    "value": "detailed",
    "metadata": {
      "importance": "high",
      "tags": ["user_preference"]
    }
  }' | jq .

# Test retrieving memory
echo -e "\nTesting memory retrieval..."
curl -s "http://localhost:3001/memory?userId=test-user-123&type=preference" | jq .

# Test medical term usage
echo -e "\nTesting medical term usage..."
curl -s -X POST http://localhost:3001/medical-terms/usage \
  -H "Content-Type: application/json" \
  -d '{
    "term": "diabetes mellitus",
    "userId": "test-user-123",
    "context": ["definition_request", "billing_question"]
  }' | jq .

# Test statistics
echo -e "\nTesting statistics..."
curl -s http://localhost:3001/stats | jq .

echo -e "\n✅ API tests completed!"
