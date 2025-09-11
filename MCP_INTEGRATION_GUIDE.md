# MCP Memory Server Integration Guide

This guide explains how to integrate the MCP Memory Server with your Alivi application to give Mila persistent memory capabilities.

## 🚀 Quick Start

1. **Setup the MCP Memory Server:**
   ```bash
   ./setup-mcp-memory.sh
   ```

2. **Start the Memory Server:**
   ```bash
   ./start-memory-server.sh
   ```

3. **Configure your AI assistant to use the MCP client**

## 🧠 What This Gives Mila

### **Short-term Memory (Session-based)**
- Remembers the current conversation context
- Tracks form completion progress
- Maintains user preferences during the session
- Learns from immediate user interactions

### **Long-term Memory (Persistent)**
- Remembers user preferences across sessions
- Tracks medical terminology usage patterns
- Learns from form completion workflows
- Builds user-specific knowledge profiles
- Maintains conversation history

## 🔧 Integration Options

### **Option 1: Direct MCP Client Integration**
Add MCP client to your existing AI service:

```typescript
// In your AIAssistantService.ts
import { MCPClient } from '@modelcontextprotocol/sdk/client/index.js';

class AIAssistantService {
  private mcpClient: MCPClient;
  
  async initializeMemory() {
    this.mcpClient = new MCPClient({
      name: 'alivi-ai-assistant',
      version: '1.0.0'
    });
    
    await this.mcpClient.connect({
      command: 'node',
      args: ['mcp-memory-server/dist/index.js']
    });
  }
  
  async storeMemory(userId: string, type: string, key: string, value: any) {
    return await this.mcpClient.callTool({
      name: 'store_memory',
      arguments: {
        userId,
        type,
        key,
        value
      }
    });
  }
  
  async retrieveMemory(userId: string, type?: string, key?: string) {
    return await this.mcpClient.callTool({
      name: 'retrieve_memory',
      arguments: {
        userId,
        type,
        key,
        limit: 10
      }
    });
  }
}
```

### **Option 2: HTTP API Wrapper**
Create a simple HTTP wrapper around the MCP server:

```typescript
// memory-api.ts
export class MemoryAPI {
  private baseUrl = 'http://localhost:3001'; // Your MCP server HTTP wrapper
  
  async storeMemory(userId: string, type: string, key: string, value: any) {
    const response = await fetch(`${this.baseUrl}/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type, key, value })
    });
    return response.json();
  }
  
  async retrieveMemory(userId: string, type?: string) {
    const params = new URLSearchParams({ userId });
    if (type) params.append('type', type);
    
    const response = await fetch(`${this.baseUrl}/memory?${params}`);
    return response.json();
  }
}
```

### **Option 3: Database Direct Access**
Access the SQLite database directly from your application:

```typescript
// memory-service.ts
import Database from 'better-sqlite3';

export class MemoryService {
  private db: Database.Database;
  
  constructor() {
    this.db = new Database('./mcp-memory-server/memory.db');
  }
  
  async storeMemory(userId: string, type: string, key: string, value: any) {
    const stmt = this.db.prepare(`
      INSERT INTO memory_entries (id, user_id, type, key, value, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    return stmt.run(uuidv4(), userId, type, key, JSON.stringify(value), new Date(), new Date());
  }
  
  async retrieveMemory(userId: string, type?: string) {
    let sql = 'SELECT * FROM memory_entries WHERE user_id = ?';
    const params = [userId];
    
    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    
    const stmt = this.db.prepare(sql);
    return stmt.all(...params);
  }
}
```

## 🎯 Use Cases for Mila

### **1. Personalized Responses**
```typescript
// Remember user's preferred response style
await storeMemory(userId, 'preference', 'response_style', 'detailed');
await storeMemory(userId, 'preference', 'medical_level', 'advanced');
```

### **2. Medical Term Learning**
```typescript
// Track which terms the user asks about most
await recordMedicalTermUsage('diabetes mellitus', userId, ['definition_request']);
await recordMedicalTermUsage('hypertension', userId, ['billing_question']);
```

### **3. Form Completion Assistance**
```typescript
// Remember user's common form completion patterns
await storeMemory(userId, 'form_data', 'common_errors', ['provider_id', 'subscriber_id']);
await storeMemory(userId, 'form_data', 'successful_workflows', ['auto_fill_provider', 'validate_dates']);
```

### **4. Conversation Context**
```typescript
// Save complete conversation for context
await saveConversation({
  userId,
  sessionId,
  messages: conversationHistory,
  context: { formType: 'claims_submission', currentStep: 3 },
  summary: 'User asking about diabetes billing codes'
});
```

## 📊 Memory Types Available

| Type | Description | Use Case |
|------|-------------|----------|
| `conversation` | Chat messages and context | Remember what was discussed |
| `preference` | User settings and choices | Personalize responses |
| `learning` | AI learning patterns | Improve over time |
| `context` | Current session state | Maintain context |
| `medical_term` | Medical terminology usage | Track term familiarity |
| `form_data` | Form completion data | Assist with forms |

## 🔍 Querying Memory

### **Get User Preferences**
```typescript
const preferences = await retrieveMemory(userId, 'preference');
// Returns: response_style, medical_level, form_guidance, etc.
```

### **Get Medical Term Usage**
```typescript
const termUsage = await getMedicalTermUsage(userId);
// Returns: Most used terms, context, related terms
```

### **Get Conversation History**
```typescript
const conversations = await getUserConversations(userId, 5);
// Returns: Last 5 conversations with full context
```

### **Get Memory Statistics**
```typescript
const stats = await getMemoryStats();
// Returns: Usage analytics, top terms, user engagement
```

## 🚀 Getting Started

1. **Run the setup script:**
   ```bash
   ./setup-mcp-memory.sh
   ```

2. **Start the memory server:**
   ```bash
   ./start-memory-server.sh
   ```

3. **Choose your integration method** (Direct MCP, HTTP API, or Database)

4. **Start storing memories** in your AI service

5. **Watch Mila get smarter** with each interaction!

## 🎉 Benefits

- **Smarter Responses**: Mila remembers your preferences and adapts
- **Better Context**: Maintains conversation flow across sessions
- **Learning Capability**: Gets better at helping with your specific needs
- **Personalized Experience**: Tailored to your medical billing expertise
- **Persistent Knowledge**: Never loses important information

The MCP Memory Server will make Mila much more intelligent and helpful by giving her the ability to remember and learn from every interaction!

