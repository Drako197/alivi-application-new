// Simple HTTP Memory Server
import express from 'express';
import cors from 'cors';
import { SimpleMemoryDatabase } from './database.js';
import type { MemoryEntry, ConversationMemory, MedicalTermUsage } from './types.js';

export class SimpleMemoryServer {
  private app: express.Application;
  private db: SimpleMemoryDatabase;
  private port: number;

  constructor(port: number = 3001) {
    this.app = express();
    this.port = port;
    this.db = new SimpleMemoryDatabase();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
  }

  private setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Memory Entry Routes
    this.app.post('/memory', async (req, res) => {
      try {
        const { userId, sessionId, type, key, value, metadata } = req.body;
        const memory = await this.db.createMemoryEntry({
          userId,
          sessionId,
          type,
          key,
          value,
          metadata
        });
        res.json({ success: true, data: memory });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.app.get('/memory', async (req, res) => {
      try {
        const { userId, sessionId, type, key, limit } = req.query;
        const memories = await this.db.getMemoryEntries(
          userId as string,
          sessionId as string,
          type as string,
          key as string,
          limit ? parseInt(limit as string) : 10
        );
        res.json({ success: true, data: memories });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.app.put('/memory/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { value, metadata } = req.body;
        const updated = await this.db.updateMemoryEntry(id, { value, metadata });
        if (updated) {
          res.json({ success: true, data: updated });
        } else {
          res.status(404).json({ success: false, error: 'Memory entry not found' });
        }
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.app.delete('/memory/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const deleted = await this.db.deleteMemoryEntry(id);
        res.json({ success: true, deleted });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Conversation Routes
    this.app.post('/conversations', async (req, res) => {
      try {
        const { userId, sessionId, messages, context, summary } = req.body;
        const conversation = await this.db.saveConversation({
          userId,
          sessionId,
          messages,
          context: context || {},
          summary
        });
        res.json({ success: true, data: conversation });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.app.get('/conversations/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const conversation = await this.db.getConversation(id);
        if (conversation) {
          res.json({ success: true, data: conversation });
        } else {
          res.status(404).json({ success: false, error: 'Conversation not found' });
        }
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.app.get('/conversations/user/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const { limit } = req.query;
        const conversations = await this.db.getUserConversations(
          userId,
          limit ? parseInt(limit as string) : 10
        );
        res.json({ success: true, data: conversations });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Medical Term Usage Routes
    this.app.post('/medical-terms/usage', async (req, res) => {
      try {
        const { term, userId, context } = req.body;
        const usage = await this.db.recordMedicalTermUsage(term, userId, context || []);
        res.json({ success: true, data: usage });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    this.app.get('/medical-terms/usage/:userId', async (req, res) => {
      try {
        const { userId } = req.params;
        const { limit } = req.query;
        const usage = await this.db.getMedicalTermUsage(
          userId,
          limit ? parseInt(limit as string) : 20
        );
        res.json({ success: true, data: usage });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Statistics Route
    this.app.get('/stats', async (req, res) => {
      try {
        const stats = await this.db.getMemoryStats();
        res.json({ success: true, data: stats });
      } catch (error) {
        res.status(500).json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    // Error handling middleware
    this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Server error:', err);
      res.status(500).json({ success: false, error: 'Internal server error' });
    });
  }

  async start() {
    return new Promise<void>((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`🧠 Simple Memory Server running on port ${this.port}`);
        console.log(`📊 Health check: http://localhost:${this.port}/health`);
        console.log(`📚 API docs: http://localhost:${this.port}/api-docs`);
        resolve();
      });
    });
  }

  async stop() {
    this.db.close();
    console.log('🛑 Simple Memory Server stopped');
  }
}

