# Alivi MCP Memory Server

A Model Context Protocol (MCP) server that provides persistent memory capabilities for the Alivi AI Assistant (Mila). This server enables Mila to remember conversations, user preferences, medical terminology usage, and form completion patterns across sessions.

## Features

- **Persistent Memory Storage**: Store and retrieve memory entries with SQLite database
- **Conversation History**: Save and recall complete conversation contexts
- **User Preferences**: Remember user-specific settings and learning profiles
- **Medical Term Tracking**: Track usage patterns of medical terminology
- **Form Analytics**: Monitor form completion patterns and user workflows
- **Memory Statistics**: Get insights into memory usage and user engagement

## Installation

1. Navigate to the MCP server directory:
```bash
cd mcp-memory-server
```

2. Install dependencies:
```bash
npm install
```

3. Build the server:
```bash
npm run build
```

## Usage

### Start the Server
```bash
npm start
```

### Development Mode
```bash
npm run dev
```

### Watch Mode (for development)
```bash
npm run watch
```

## MCP Tools Available

### Memory Management
- `store_memory`: Store a memory entry
- `retrieve_memory`: Retrieve memory entries based on query
- `update_memory`: Update an existing memory entry
- `delete_memory`: Delete a memory entry

### Conversation Management
- `save_conversation`: Save a complete conversation
- `get_conversation`: Retrieve a conversation by ID
- `get_user_conversations`: Get recent conversations for a user

### Medical Term Tracking
- `record_medical_term_usage`: Record usage of a medical term
- `get_medical_term_usage`: Get medical term usage for a user

### Analytics
- `get_memory_stats`: Get memory usage statistics

## Database Schema

The server uses SQLite with the following tables:
- `memory_entries`: General memory storage
- `conversations`: Complete conversation records
- `user_preferences`: User-specific settings
- `medical_term_usage`: Medical terminology usage tracking
- `form_completion_patterns`: Form completion analytics

## Configuration

The server can be configured by modifying the database path in `src/database.ts`:

```typescript
constructor(dbPath: string = './memory.db') {
  this.db = new Database(dbPath);
  // ...
}
```

## Integration with Alivi Application

To integrate this MCP server with your Alivi application:

1. Start the MCP server
2. Configure your AI assistant to use the MCP client
3. Use the available tools to store and retrieve memory

## Example Usage

### Store a Memory Entry
```json
{
  "name": "store_memory",
  "arguments": {
    "userId": "user123",
    "sessionId": "session456",
    "type": "preference",
    "key": "response_style",
    "value": "detailed",
    "metadata": {
      "importance": "high",
      "tags": ["user_preference", "response_format"]
    }
  }
}
```

### Retrieve Memory
```json
{
  "name": "retrieve_memory",
  "arguments": {
    "userId": "user123",
    "type": "preference",
    "limit": 10
  }
}
```

### Record Medical Term Usage
```json
{
  "name": "record_medical_term_usage",
  "arguments": {
    "term": "diabetes mellitus",
    "userId": "user123",
    "context": ["definition_request", "billing_question"]
  }
}
```

## Development

### Project Structure
```
mcp-memory-server/
├── src/
│   ├── index.ts          # Main entry point
│   ├── server.ts         # MCP server implementation
│   ├── database.ts       # Database operations
│   └── types.ts          # TypeScript type definitions
├── package.json
├── tsconfig.json
└── README.md
```

### Building
```bash
npm run build
```

### Type Checking
```bash
npx tsc --noEmit
```

## License

MIT License - See LICENSE file for details.

## Support

For issues and questions, please contact the Alivi development team.

