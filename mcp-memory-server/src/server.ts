// MCP Memory Server implementation
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { MemoryDatabase } from './database.js';
import { v4 as uuidv4 } from 'uuid';
import type { MemoryEntry, ConversationMemory, UserPreferences, MedicalTermUsage, FormCompletionPattern } from './types.js';

export class AliviMemoryServer {
  private server: Server;
  private db: MemoryDatabase;

  constructor() {
    this.db = new MemoryDatabase();
    this.server = new Server(
      {
        name: 'alivi-memory-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'store_memory',
            description: 'Store a memory entry for the AI assistant',
            inputSchema: {
              type: 'object',
              properties: {
                userId: { type: 'string', description: 'User identifier' },
                sessionId: { type: 'string', description: 'Session identifier' },
                type: { 
                  type: 'string', 
                  enum: ['conversation', 'preference', 'learning', 'context', 'medical_term', 'form_data'],
                  description: 'Type of memory entry'
                },
                key: { type: 'string', description: 'Memory key' },
                value: { type: 'object', description: 'Memory value' },
                metadata: { type: 'object', description: 'Additional metadata' }
              },
              required: ['type', 'key', 'value']
            }
          },
          {
            name: 'retrieve_memory',
            description: 'Retrieve memory entries based on query',
            inputSchema: {
              type: 'object',
              properties: {
                userId: { type: 'string', description: 'User identifier' },
                sessionId: { type: 'string', description: 'Session identifier' },
                type: { type: 'string', description: 'Type of memory entry' },
                key: { type: 'string', description: 'Memory key' },
                tags: { type: 'array', items: { type: 'string' }, description: 'Tags to filter by' },
                limit: { type: 'number', description: 'Maximum number of results' }
              }
            }
          },
          {
            name: 'update_memory',
            description: 'Update an existing memory entry',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Memory entry ID' },
                value: { type: 'object', description: 'New value' },
                metadata: { type: 'object', description: 'Updated metadata' }
              },
              required: ['id']
            }
          },
          {
            name: 'delete_memory',
            description: 'Delete a memory entry',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Memory entry ID' }
              },
              required: ['id']
            }
          },
          {
            name: 'save_conversation',
            description: 'Save a complete conversation',
            inputSchema: {
              type: 'object',
              properties: {
                userId: { type: 'string', description: 'User identifier' },
                sessionId: { type: 'string', description: 'Session identifier' },
                messages: { 
                  type: 'array', 
                  items: {
                    type: 'object',
                    properties: {
                      role: { type: 'string', enum: ['user', 'assistant', 'system'] },
                      content: { type: 'string' },
                      timestamp: { type: 'number' },
                      metadata: { type: 'object' }
                    }
                  },
                  description: 'Conversation messages'
                },
                context: { type: 'object', description: 'Conversation context' },
                summary: { type: 'string', description: 'Conversation summary' }
              },
              required: ['userId', 'sessionId', 'messages']
            }
          },
          {
            name: 'get_conversation',
            description: 'Retrieve a conversation by ID',
            inputSchema: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'Conversation ID' }
              },
              required: ['id']
            }
          },
          {
            name: 'get_user_conversations',
            description: 'Get recent conversations for a user',
            inputSchema: {
              type: 'object',
              properties: {
                userId: { type: 'string', description: 'User identifier' },
                limit: { type: 'number', description: 'Maximum number of conversations' }
              },
              required: ['userId']
            }
          },
          {
            name: 'record_medical_term_usage',
            description: 'Record usage of a medical term',
            inputSchema: {
              type: 'object',
              properties: {
                term: { type: 'string', description: 'Medical term' },
                userId: { type: 'string', description: 'User identifier' },
                context: { type: 'array', items: { type: 'string' }, description: 'Usage context' }
              },
              required: ['term', 'userId']
            }
          },
          {
            name: 'get_medical_term_usage',
            description: 'Get medical term usage for a user',
            inputSchema: {
              type: 'object',
              properties: {
                userId: { type: 'string', description: 'User identifier' },
                limit: { type: 'number', description: 'Maximum number of results' }
              },
              required: ['userId']
            }
          },
          {
            name: 'get_memory_stats',
            description: 'Get memory usage statistics',
            inputSchema: {
              type: 'object',
              properties: {}
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'store_memory':
            return await this.handleStoreMemory(args);
          
          case 'retrieve_memory':
            return await this.handleRetrieveMemory(args);
          
          case 'update_memory':
            return await this.handleUpdateMemory(args);
          
          case 'delete_memory':
            return await this.handleDeleteMemory(args);
          
          case 'save_conversation':
            return await this.handleSaveConversation(args);
          
          case 'get_conversation':
            return await this.handleGetConversation(args);
          
          case 'get_user_conversations':
            return await this.handleGetUserConversations(args);
          
          case 'record_medical_term_usage':
            return await this.handleRecordMedicalTermUsage(args);
          
          case 'get_medical_term_usage':
            return await this.handleGetMedicalTermUsage(args);
          
          case 'get_memory_stats':
            return await this.handleGetMemoryStats(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          ],
          isError: true
        };
      }
    });
  }

  private async handleStoreMemory(args: any) {
    const memory = await this.db.createMemoryEntry({
      userId: args.userId,
      sessionId: args.sessionId,
      type: args.type,
      key: args.key,
      value: args.value,
      metadata: args.metadata
    });

    return {
      content: [
        {
          type: 'text',
          text: `Memory stored successfully with ID: ${memory.id}`
        }
      ]
    };
  }

  private async handleRetrieveMemory(args: any) {
    const memories = await this.db.getMemoryEntries({
      userId: args.userId,
      sessionId: args.sessionId,
      type: args.type,
      key: args.key,
      tags: args.tags,
      limit: args.limit || 10
    });

    return {
      content: [
        {
          type: 'text',
          text: `Found ${memories.length} memory entries:\n\n${JSON.stringify(memories, null, 2)}`
        }
      ]
    };
  }

  private async handleUpdateMemory(args: any) {
    const updated = await this.db.updateMemoryEntry(args.id, {
      value: args.value,
      metadata: args.metadata
    });

    if (!updated) {
      return {
        content: [
          {
            type: 'text',
            text: 'Memory entry not found or could not be updated'
          }
        ],
        isError: true
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `Memory updated successfully: ${JSON.stringify(updated, null, 2)}`
        }
      ]
    };
  }

  private async handleDeleteMemory(args: any) {
    const deleted = await this.db.deleteMemoryEntry(args.id);
    
    return {
      content: [
        {
          type: 'text',
          text: deleted ? 'Memory deleted successfully' : 'Memory not found'
        }
      ]
    };
  }

  private async handleSaveConversation(args: any) {
    const conversation = await this.db.saveConversation({
      userId: args.userId,
      sessionId: args.sessionId,
      messages: args.messages,
      context: args.context || {},
      summary: args.summary
    });

    return {
      content: [
        {
          type: 'text',
          text: `Conversation saved with ID: ${conversation.id}`
        }
      ]
    };
  }

  private async handleGetConversation(args: any) {
    const conversation = await this.db.getConversation(args.id);
    
    if (!conversation) {
      return {
        content: [
          {
            type: 'text',
            text: 'Conversation not found'
          }
        ],
        isError: true
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `Conversation found:\n\n${JSON.stringify(conversation, null, 2)}`
        }
      ]
    };
  }

  private async handleGetUserConversations(args: any) {
    const conversations = await this.db.getUserConversations(args.userId, args.limit || 10);
    
    return {
      content: [
        {
          type: 'text',
          text: `Found ${conversations.length} conversations for user ${args.userId}:\n\n${JSON.stringify(conversations, null, 2)}`
        }
      ]
    };
  }

  private async handleRecordMedicalTermUsage(args: any) {
    const usage = await this.db.recordMedicalTermUsage(args.term, args.userId, args.context || []);
    
    return {
      content: [
        {
          type: 'text',
          text: `Medical term usage recorded: ${JSON.stringify(usage, null, 2)}`
        }
      ]
    };
  }

  private async handleGetMedicalTermUsage(args: any) {
    const usage = await this.db.getMedicalTermUsage(args.userId, args.limit || 20);
    
    return {
      content: [
        {
          type: 'text',
          text: `Medical term usage for user ${args.userId}:\n\n${JSON.stringify(usage, null, 2)}`
        }
      ]
    };
  }

  private async handleGetMemoryStats(args: any) {
    const stats = await this.db.getMemoryStats();
    
    return {
      content: [
        {
          type: 'text',
          text: `Memory Statistics:\n\n${JSON.stringify(stats, null, 2)}`
        }
      ]
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Alivi Memory Server started');
  }

  async stop() {
    this.db.close();
    console.error('Alivi Memory Server stopped');
  }
}

// Start the server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new AliviMemoryServer();
  server.start().catch(console.error);
  
  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });
}

