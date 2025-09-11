#!/bin/bash

# Setup script for Alivi MCP Memory Server
echo "🧠 Setting up Alivi MCP Memory Server..."

# Navigate to the MCP server directory
cd mcp-memory-server

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the server
echo "🔨 Building the server..."
npm run build

# Create a startup script
echo "📝 Creating startup script..."
cat > start-memory-server.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting Alivi MCP Memory Server..."
cd mcp-memory-server
npm start
EOF

chmod +x start-memory-server.sh

# Create a configuration file
echo "⚙️ Creating configuration file..."
cat > mcp-config.json << 'EOF'
{
  "mcpServers": {
    "alivi-memory": {
      "command": "node",
      "args": ["mcp-memory-server/dist/index.js"],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
EOF

echo "✅ Setup complete!"
echo ""
echo "To start the MCP Memory Server:"
echo "  ./start-memory-server.sh"
echo ""
echo "Or manually:"
echo "  cd mcp-memory-server && npm start"
echo ""
echo "The server will provide persistent memory for Mila across conversations!"

