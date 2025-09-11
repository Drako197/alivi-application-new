// Database setup and operations for MCP Memory Server
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import type { 
  MemoryEntry, 
  ConversationMemory, 
  UserPreferences, 
  MedicalTermUsage, 
  FormCompletionPattern,
  MemoryQuery,
  MemoryStats 
} from './types.js';

export class MemoryDatabase {
  private db: Database.Database;

  constructor(dbPath: string = './memory.db') {
    this.db = new Database(dbPath);
    this.initializeTables();
  }

  private initializeTables() {
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
    `);

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
    `);

    // User preferences table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id TEXT PRIMARY KEY,
        preferences TEXT NOT NULL,
        learning_profile TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

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
    `);

    // Form completion patterns table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS form_completion_patterns (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        form_type TEXT NOT NULL,
        completion_rate REAL DEFAULT 0,
        average_time INTEGER DEFAULT 0,
        common_fields TEXT,
        error_fields TEXT,
        successful_workflows TEXT,
        last_completed DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, form_type)
      )
    `);

    // Create indexes for better performance
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_memory_user_id ON memory_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_memory_session_id ON memory_entries(session_id);
      CREATE INDEX IF NOT EXISTS idx_memory_type ON memory_entries(type);
      CREATE INDEX IF NOT EXISTS idx_memory_key ON memory_entries(key);
      CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON conversations(session_id);
      CREATE INDEX IF NOT EXISTS idx_medical_terms_user_id ON medical_term_usage(user_id);
      CREATE INDEX IF NOT EXISTS idx_medical_terms_term ON medical_term_usage(term);
      CREATE INDEX IF NOT EXISTS idx_form_patterns_user_id ON form_completion_patterns(user_id);
      CREATE INDEX IF NOT EXISTS idx_form_patterns_form_type ON form_completion_patterns(form_type);
    `);
  }

  // Memory Entry Operations
  async createMemoryEntry(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<MemoryEntry> {
    const id = uuidv4();
    const now = new Date();
    
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
      now.toISOString(),
      now.toISOString()
    );

    return {
      id,
      ...entry,
      createdAt: now,
      updatedAt: now
    };
  }

  async getMemoryEntries(query: MemoryQuery): Promise<MemoryEntry[]> {
    let sql = 'SELECT * FROM memory_entries WHERE 1=1';
    const params: any[] = [];

    if (query.userId) {
      sql += ' AND user_id = ?';
      params.push(query.userId);
    }

    if (query.sessionId) {
      sql += ' AND session_id = ?';
      params.push(query.sessionId);
    }

    if (query.type) {
      sql += ' AND type = ?';
      params.push(query.type);
    }

    if (query.key) {
      sql += ' AND key = ?';
      params.push(query.key);
    }

    if (query.tags && query.tags.length > 0) {
      sql += ' AND JSON_EXTRACT(metadata, "$.tags") IS NOT NULL';
      for (const tag of query.tags) {
        sql += ` AND JSON_EXTRACT(metadata, "$.tags") LIKE ?`;
        params.push(`%"${tag}"%`);
      }
    }

    sql += ` ORDER BY ${query.orderBy || 'created_at'} ${query.order || 'DESC'}`;
    
    if (query.limit) {
      sql += ' LIMIT ?';
      params.push(query.limit);
    }

    if (query.offset) {
      sql += ' OFFSET ?';
      params.push(query.offset);
    }

    const rows = this.db.prepare(sql).all(...params) as any[];

    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      type: row.type,
      key: row.key,
      value: JSON.parse(row.value),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  async updateMemoryEntry(id: string, updates: Partial<MemoryEntry>): Promise<MemoryEntry | null> {
    const now = new Date();
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
      return null;
    }

    updateFields.push('updated_at = ?');
    params.push(now.toISOString());
    params.push(id);

    const sql = `UPDATE memory_entries SET ${updateFields.join(', ')} WHERE id = ?`;
    const stmt = this.db.prepare(sql);
    const result = stmt.run(...params);

    if (result.changes === 0) {
      return null;
    }

    // Return updated entry
    const row = this.db.prepare('SELECT * FROM memory_entries WHERE id = ?').get(id) as any;
    return {
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      type: row.type,
      key: row.key,
      value: JSON.parse(row.value),
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  async deleteMemoryEntry(id: string): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM memory_entries WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Conversation Operations
  async saveConversation(conversation: Omit<ConversationMemory, 'id' | 'createdAt' | 'updatedAt'>): Promise<ConversationMemory> {
    const id = uuidv4();
    const now = new Date();
    
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
      now.toISOString(),
      now.toISOString()
    );

    return {
      id,
      ...conversation,
      createdAt: now,
      updatedAt: now
    };
  }

  async getConversation(id: string): Promise<ConversationMemory | null> {
    const row = this.db.prepare('SELECT * FROM conversations WHERE id = ?').get(id) as any;
    
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      messages: JSON.parse(row.messages),
      context: JSON.parse(row.context),
      summary: row.summary,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  async getUserConversations(userId: string, limit: number = 10): Promise<ConversationMemory[]> {
    const rows = this.db.prepare(`
      SELECT * FROM conversations 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(userId, limit) as any[];

    return rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      messages: JSON.parse(row.messages),
      context: JSON.parse(row.context),
      summary: row.summary,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  }

  // Medical Term Usage Operations
  async recordMedicalTermUsage(term: string, userId: string, context: string[] = []): Promise<MedicalTermUsage> {
    const existing = this.db.prepare(`
      SELECT * FROM medical_term_usage WHERE term = ? AND user_id = ?
    `).get(term, userId) as any;

    if (existing) {
      // Update existing usage
      const stmt = this.db.prepare(`
        UPDATE medical_term_usage 
        SET usage_count = usage_count + 1, 
            last_used = CURRENT_TIMESTAMP,
            context = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE term = ? AND user_id = ?
      `);

      stmt.run(JSON.stringify([...JSON.parse(existing.context || '[]'), ...context]), term, userId);

      return {
        id: existing.id,
        term: existing.term,
        userId: existing.user_id,
        usageCount: existing.usage_count + 1,
        lastUsed: new Date(),
        context: [...JSON.parse(existing.context || '[]'), ...context],
        relatedTerms: JSON.parse(existing.related_terms || '[]'),
        userNotes: existing.user_notes
      };
    } else {
      // Create new usage record
      const id = uuidv4();
      const stmt = this.db.prepare(`
        INSERT INTO medical_term_usage (id, term, user_id, usage_count, last_used, context, created_at, updated_at)
        VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `);

      stmt.run(id, term, userId, JSON.stringify(context));

      return {
        id,
        term,
        userId,
        usageCount: 1,
        lastUsed: new Date(),
        context,
        relatedTerms: [],
        userNotes: undefined
      };
    }
  }

  async getMedicalTermUsage(userId: string, limit: number = 20): Promise<MedicalTermUsage[]> {
    const rows = this.db.prepare(`
      SELECT * FROM medical_term_usage 
      WHERE user_id = ? 
      ORDER BY usage_count DESC, last_used DESC 
      LIMIT ?
    `).all(userId, limit) as any[];

    return rows.map(row => ({
      id: row.id,
      term: row.term,
      userId: row.user_id,
      usageCount: row.usage_count,
      lastUsed: new Date(row.last_used),
      context: JSON.parse(row.context || '[]'),
      relatedTerms: JSON.parse(row.related_terms || '[]'),
      userNotes: row.user_notes
    }));
  }

  // Statistics
  async getMemoryStats(): Promise<MemoryStats> {
    const totalEntries = this.db.prepare('SELECT COUNT(*) as count FROM memory_entries').get() as { count: number };
    
    const entriesByType = this.db.prepare(`
      SELECT type, COUNT(*) as count 
      FROM memory_entries 
      GROUP BY type
    `).all() as Array<{ type: string; count: number }>;

    const entriesByUser = this.db.prepare(`
      SELECT user_id, COUNT(*) as count 
      FROM memory_entries 
      WHERE user_id IS NOT NULL 
      GROUP BY user_id
    `).all() as Array<{ user_id: string; count: number }>;

    const recentActivity = this.db.prepare(`
      SELECT created_at as timestamp, type, user_id, 'created' as action
      FROM memory_entries 
      WHERE created_at > datetime('now', '-7 days')
      ORDER BY created_at DESC
      LIMIT 50
    `).all() as Array<{ timestamp: string; type: string; user_id: string; action: string }>;

    const topTerms = this.db.prepare(`
      SELECT term, SUM(usage_count) as usage_count
      FROM medical_term_usage 
      GROUP BY term 
      ORDER BY usage_count DESC 
      LIMIT 10
    `).all() as Array<{ term: string; usage_count: number }>;

    const userEngagement = this.db.prepare(`
      SELECT 
        user_id,
        COUNT(DISTINCT session_id) as session_count,
        COUNT(*) as total_interactions,
        MAX(created_at) as last_active
      FROM conversations 
      GROUP BY user_id 
      ORDER BY total_interactions DESC 
      LIMIT 10
    `).all() as Array<{ user_id: string; session_count: number; total_interactions: number; last_active: string }>;

    return {
      totalEntries: totalEntries.count,
      entriesByType: Object.fromEntries(entriesByType.map(e => [e.type, e.count])),
      entriesByUser: Object.fromEntries(entriesByUser.map(e => [e.user_id, e.count])),
      recentActivity: recentActivity.map(a => ({
        timestamp: new Date(a.timestamp).getTime(),
        type: a.type,
        userId: a.user_id,
        action: a.action
      })),
      topTerms: topTerms.map(t => ({
        term: t.term,
        usageCount: t.usage_count
      })),
      userEngagement: userEngagement.map(u => ({
        userId: u.user_id,
        sessionCount: u.session_count,
        totalInteractions: u.total_interactions,
        lastActive: new Date(u.last_active)
      }))
    };
  }

  close() {
    this.db.close();
  }
}

