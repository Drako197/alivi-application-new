#!/bin/bash

# Setup script for Simple Memory Server
echo "🧠 Setting up Simple Memory Server for Alivi..."

# Navigate to the simple memory server directory
cd simple-memory-server

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the server
echo "🔨 Building the server..."
npm run build

# Create a startup script
echo "📝 Creating startup script..."
cat > start-simple-memory.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Simple Memory Server..."
cd simple-memory-server
npm start
EOF

chmod +x start-simple-memory.sh

# Create a test script
echo "🧪 Creating test script..."
cat > test-memory-api.sh << 'EOF'
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
EOF

chmod +x test-memory-api.sh

echo "✅ Setup complete!"
echo ""
echo "To start the Simple Memory Server:"
echo "  ./start-simple-memory.sh"
echo ""
echo "To test the API (after starting the server):"
echo "  ./test-memory-api.sh"
echo ""
echo "The server will run on http://localhost:3001"
echo "Health check: http://localhost:3001/health"

