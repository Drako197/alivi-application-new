// Simple database operations using sqlite3
import sqlite3 from 'sqlite3';
import { v4 as uuidv4 } from 'uuid';
import type { 
  MemoryEntry, 
  ConversationMemory, 
  UserPreferences, 
  MedicalTermUsage,
  MemoryStats 
} from './types.js';

export class SimpleMemoryDatabase {
  private db: sqlite3.Database;

  constructor(dbPath: string = './memory.db') {
    this.db = new sqlite3.Database(dbPath);
    this.initializeTables();
  }

  private initializeTables(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Memory entries table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS memory_entries (
          id TEXT PRIMARY KEY,
          user_id TEXT,
          session_id TEXT,
          type TEXT NOT NULL,
          key TEXT NOT NULL,
          value TEXT NOT NULL,
          metadata TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err: Error | null) => {
        if (err) reject(err);
      });

      // Conversations table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          session_id TEXT NOT NULL,
          messages TEXT NOT NULL,
          context TEXT,
          summary TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err: Error | null) => {
        if (err) reject(err);
      });

      // User preferences table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS user_preferences (
          user_id TEXT PRIMARY KEY,
          preferences TEXT NOT NULL,
          learning_profile TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err: Error | null) => {
        if (err) reject(err);
      });

      // Medical term usage table
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS medical_term_usage (
          id TEXT PRIMARY KEY,
          term TEXT NOT NULL,
          user_id TEXT NOT NULL,
          usage_count INTEGER DEFAULT 1,
          last_used DATETIME DEFAULT CURRENT_TIMESTAMP,
          context TEXT,
          related_terms TEXT,
          user_notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(term, user_id)
        )
      `, (err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });

      // Create indexes
      this.db.exec(`
        CREATE INDEX IF NOT EXISTS idx_memory_user_id ON memory_entries(user_id);
        CREATE INDEX IF NOT EXISTS idx_memory_session_id ON memory_entries(session_id);
        CREATE INDEX IF NOT EXISTS idx_memory_type ON memory_entries(type);
        CREATE INDEX IF NOT EXISTS idx_memory_key ON memory_entries(key);
        CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
        CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
        CREATE INDEX IF NOT EXISTS idx_medical_terms_user_id ON medical_term_usage(user_id);
        CREATE INDEX IF NOT EXISTS idx_medical_terms_term ON medical_term_usage(term);
      `, (err: Error | null) => {
        if (err) console.error('Index creation error:', err);
      });
    });
  }

  // Memory Entry Operations
  async createMemoryEntry(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryEntry> {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const stmt = this.db.prepare(`
        INSERT INTO memory_entries (id, user_id, session_id, type, key, value, metadata, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        entry.userId || null,
        entry.sessionId || null,
        entry.type,
        entry.key,
        JSON.stringify(entry.value),
        entry.metadata ? JSON.stringify(entry.metadata) : null,
        now,
        now,
        (err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              id,
              ...entry,
              createdAt: now,
              updatedAt: now
            });
          }
        }
      );
    });
  }

  async getMemoryEntries(userId?: string, sessionId?: string, type?: string, key?: string, limit: number = 10): Promise<MemoryEntry[]> {
    return new Promise((resolve, reject) => {
      let sql = 'SELECT * FROM memory_entries WHERE 1=1';
      const params: any[] = [];

      if (userId) {
        sql += ' AND user_id = ?';
        params.push(userId);
      }

      if (sessionId) {
        sql += ' AND session_id = ?';
        params.push(sessionId);
      }

      if (type) {
        sql += ' AND type = ?';
        params.push(type);
      }

      if (key) {
        sql += ' AND key = ?';
        params.push(key);
      }

      sql += ' ORDER BY created_at DESC LIMIT ?';
      params.push(limit);

      this.db.all(sql, params, (err: Error | null, rows: any[]) => {
        if (err) {
          reject(err);
        } else {
          const entries = rows.map(row => ({
            id: row.id,
            userId: row.user_id,
            sessionId: row.session_id,
            type: row.type,
            key: row.key,
            value: JSON.parse(row.value),
            metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          }));
          resolve(entries);
        }
      });
    });
  }

  async updateMemoryEntry(id: string, updates: Partial<MemoryEntry>): Promise<MemoryEntry | null> {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      const updateFields: string[] = [];
      const params: any[] = [];

      if (updates.value !== undefined) {
        updateFields.push('value = ?');
        params.push(JSON.stringify(updates.value));
      }

      if (updates.metadata !== undefined) {
        updateFields.push('metadata = ?');
        params.push(JSON.stringify(updates.metadata));
      }

      if (updateFields.length === 0) {
        resolve(null);
        return;
      }

      updateFields.push('updated_at = ?');
      params.push(now);
      params.push(id);

      const sql = `UPDATE memory_entries SET ${updateFields.join(', ')} WHERE id = ?`;
      this.db.run(sql, params, (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          // Get updated entry
          this.db.get('SELECT * FROM memory_entries WHERE id = ?', [id], (err: Error | null, row: any) => {
            if (err) {
              reject(err);
            } else if (!row) {
              resolve(null);
            } else {
              resolve({
                id: row.id,
                userId: row.user_id,
                sessionId: row.session_id,
                type: row.type,
                key: row.key,
                value: JSON.parse(row.value),
                metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
                createdAt: row.created_at,
                updatedAt: row.updated_at
              });
            }
          });
        }
      });
    });
  }

  async deleteMemoryEntry(id: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM memory_entries WHERE id = ?', [id], function(err: Error | null) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // Conversation Operations
  async saveConversation(conversation: Omit<ConversationMemory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConversationMemory> {
    return new Promise((resolve, reject) => {
      const id = uuidv4();
      const now = new Date().toISOString();
      
      const stmt = this.db.prepare(`
        INSERT INTO conversations (id, user_id, session_id, messages, context, summary, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        id,
        conversation.userId,
        conversation.sessionId,
        JSON.stringify(conversation.messages),
        JSON.stringify(conversation.context),
        conversation.summary || null,
        now,
        now,
        (err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              id,
              ...conversation,
              createdAt: now,
              updatedAt: now
            });
          }
        }
      );
    });
  }

  async getConversation(id: string): Promise<ConversationMemory | null> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM conversations WHERE id = ?', [id], (err: Error | null, row: any) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            id: row.id,
            userId: row.user_id,
            sessionId: row.session_id,
            messages: JSON.parse(row.messages),
            context: JSON.parse(row.context),
            summary: row.summary,
            createdAt: row.created_at,
            updatedAt: row.updated_at
          });
        }
      });
    });
  }

  async getUserConversations(userId: string, limit: number = 10): Promise<ConversationMemory[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
        [userId, limit],
        (err: Error | null, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const conversations = rows.map(row => ({
              id: row.id,
              userId: row.user_id,
              sessionId: row.session_id,
              messages: JSON.parse(row.messages),
              context: JSON.parse(row.context),
              summary: row.summary,
              createdAt: row.created_at,
              updatedAt: row.updated_at
            }));
            resolve(conversations);
          }
        }
      );
    });
  }

  // Medical Term Usage Operations
  async recordMedicalTermUsage(term: string, userId: string, context: string[] = []): Promise<MedicalTermUsage> {
    return new Promise((resolve, reject) => {
      // Check if term already exists for user
      this.db.get(
        'SELECT * FROM medical_term_usage WHERE term = ? AND user_id = ?',
        [term, userId],
        (err: Error | null, existing: any) => {
          if (err) {
            reject(err);
          } else if (existing) {
            // Update existing usage
            const newContext = [...JSON.parse(existing.context || '[]'), ...context];
            this.db.run(
              `UPDATE medical_term_usage 
               SET usage_count = usage_count + 1, 
                   last_used = CURRENT_TIMESTAMP,
                   context = ?,
                   updated_at = CURRENT_TIMESTAMP
               WHERE term = ? AND user_id = ?`,
              [JSON.stringify(newContext), term, userId],
              (err: Error | null) => {
                if (err) {
                  reject(err);
                } else {
                  resolve({
                    id: existing.id,
                    term: existing.term,
                    userId: existing.user_id,
                    usageCount: existing.usage_count + 1,
                    lastUsed: new Date().toISOString(),
                    context: newContext,
                    relatedTerms: JSON.parse(existing.related_terms || '[]'),
                    userNotes: existing.user_notes
                  });
                }
              }
            );
          } else {
            // Create new usage record
            const id = uuidv4();
            this.db.run(
              `INSERT INTO medical_term_usage (id, term, user_id, usage_count, last_used, context, created_at, updated_at)
               VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
              [id, term, userId, JSON.stringify(context)],
              (err: Error | null) => {
                if (err) {
                  reject(err);
                } else {
                  resolve({
                    id,
                    term,
                    userId,
                    usageCount: 1,
                    lastUsed: new Date().toISOString(),
                    context,
                    relatedTerms: [],
                    userNotes: undefined
                  });
                }
              }
            );
          }
        }
      );
    });
  }

  async getMedicalTermUsage(userId: string, limit: number = 20): Promise<MedicalTermUsage[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM medical_term_usage WHERE user_id = ? ORDER BY usage_count DESC, last_used DESC LIMIT ?',
        [userId, limit],
        (err: Error | null, rows: any[]) => {
          if (err) {
            reject(err);
          } else {
            const usage = rows.map(row => ({
              id: row.id,
              term: row.term,
              userId: row.user_id,
              usageCount: row.usage_count,
              lastUsed: row.last_used,
              context: JSON.parse(row.context || '[]'),
              relatedTerms: JSON.parse(row.related_terms || '[]'),
              userNotes: row.user_notes
            }));
            resolve(usage);
          }
        }
      );
    });
  }

  // Statistics
  async getMemoryStats(): Promise<MemoryStats> {
    return new Promise((resolve, reject) => {
      const stats: MemoryStats = {
        totalEntries: 0,
        entriesByType: {},
        entriesByUser: {},
        recentActivity: [],
        topTerms: [],
        userEngagement: []
      };

      // Get total entries
      this.db.get('SELECT COUNT(*) as count FROM memory_entries', (err: Error | null, row: any) => {
        if (err) {
          reject(err);
          return;
        }
        stats.totalEntries = row.count;

        // Get entries by type
        this.db.all('SELECT type, COUNT(*) as count FROM memory_entries GROUP BY type', (err: Error | null, rows: any[]) => {
          if (err) {
            reject(err);
            return;
          }
          stats.entriesByType = Object.fromEntries(rows.map(r => [r.type, r.count]));

          // Get entries by user
          this.db.all('SELECT user_id, COUNT(*) as count FROM memory_entries WHERE user_id IS NOT NULL GROUP BY user_id', (err: Error | null, rows: any[]) => {
            if (err) {
              reject(err);
              return;
            }
            stats.entriesByUser = Object.fromEntries(rows.map(r => [r.user_id, r.count]));

            // Get recent activity
            this.db.all(`
              SELECT created_at as timestamp, type, user_id, 'created' as action
              FROM memory_entries 
              WHERE created_at > datetime('now', '-7 days')
              ORDER BY created_at DESC
              LIMIT 50
            `, (err: Error | null, rows: any[]) => {
              if (err) {
                reject(err);
                return;
              }
              stats.recentActivity = rows.map(r => ({
                timestamp: new Date(r.timestamp).getTime(),
                type: r.type,
                userId: r.user_id,
                action: r.action
              }));

              // Get top terms
              this.db.all(`
                SELECT term, SUM(usage_count) as usage_count
                FROM medical_term_usage 
                GROUP BY term 
                ORDER BY usage_count DESC 
                LIMIT 10
              `, (err: Error | null, rows: any[]) => {
                if (err) {
                  reject(err);
                  return;
                }
                stats.topTerms = rows.map(r => ({
                  term: r.term,
                  usageCount: r.usage_count
                }));

                // Get user engagement
                this.db.all(`
                  SELECT 
                    user_id,
                    COUNT(DISTINCT session_id) as session_count,
                    COUNT(*) as total_interactions,
                    MAX(created_at) as last_active
                  FROM conversations 
                  GROUP BY user_id 
                  ORDER BY total_interactions DESC 
                  LIMIT 10
                `, (err: Error | null, rows: any[]) => {
                  if (err) {
                    reject(err);
                    return;
                  }
                  stats.userEngagement = rows.map(r => ({
                    userId: r.user_id,
                    sessionCount: r.session_count,
                    totalInteractions: r.total_interactions,
                    lastActive: r.last_active
                  }));

                  resolve(stats);
                });
              });
            });
          });
        });
      });
    });
  }

  close() {
    this.db.close();
  }
}
