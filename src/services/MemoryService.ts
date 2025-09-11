// Memory Service for Alivi Application
// This service integrates with the Simple Memory Server to provide persistent memory for Mila

export interface MemoryEntry {
  id: string;
  userId?: string;
  sessionId?: string;
  type: 'conversation' | 'preference' | 'learning' | 'context' | 'medical_term' | 'form_data';
  key: string;
  value: any;
  metadata?: {
    timestamp: number;
    source: string;
    importance: 'low' | 'medium' | 'high' | 'critical';
    tags: string[];
    expiresAt?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMemory {
  id: string;
  userId: string;
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    metadata?: any;
  }>;
  context: {
    formType?: string;
    currentField?: string;
    currentStep?: number;
    deviceType?: string;
    userRole?: string;
  };
  summary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalTermUsage {
  id: string;
  term: string;
  userId: string;
  usageCount: number;
  lastUsed: string;
  context: string[];
  relatedTerms: string[];
  userNotes?: string;
}

export class MemoryService {
  private static baseUrl = 'http://localhost:3001';
  private static isEnabled = true;

  // Enable/disable memory service
  static setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  // Check if memory service is available
  static async isAvailable(): Promise<boolean> {
    if (!this.isEnabled) return false;
    
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.warn('Memory service not available:', error);
      return false;
    }
  }

  // Store a memory entry
  static async storeMemory(
    userId: string,
    type: MemoryEntry['type'],
    key: string,
    value: any,
    sessionId?: string,
    metadata?: MemoryEntry['metadata']
  ): Promise<MemoryEntry | null> {
    if (!await this.isAvailable()) return null;

    try {
      const response = await fetch(`${this.baseUrl}/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId,
          type,
          key,
          value,
          metadata
        })
      });

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Failed to store memory:', error);
      return null;
    }
  }

  // Retrieve memory entries
  static async getMemory(
    userId?: string,
    sessionId?: string,
    type?: string,
    key?: string,
    limit: number = 10
  ): Promise<MemoryEntry[]> {
    if (!await this.isAvailable()) return [];

    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);
      if (sessionId) params.append('sessionId', sessionId);
      if (type) params.append('type', type);
      if (key) params.append('key', key);
      params.append('limit', limit.toString());

      const response = await fetch(`${this.baseUrl}/memory?${params}`);
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Failed to retrieve memory:', error);
      return [];
    }
  }

  // Update a memory entry
  static async updateMemory(
    id: string,
    value?: any,
    metadata?: MemoryEntry['metadata']
  ): Promise<MemoryEntry | null> {
    if (!await this.isAvailable()) return null;

    try {
      const response = await fetch(`${this.baseUrl}/memory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, metadata })
      });

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Failed to update memory:', error);
      return null;
    }
  }

  // Delete a memory entry
  static async deleteMemory(id: string): Promise<boolean> {
    if (!await this.isAvailable()) return false;

    try {
      const response = await fetch(`${this.baseUrl}/memory/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      return result.success && result.deleted;
    } catch (error) {
      console.error('Failed to delete memory:', error);
      return false;
    }
  }

  // Save a conversation
  static async saveConversation(
    userId: string,
    sessionId: string,
    messages: ConversationMemory['messages'],
    context: ConversationMemory['context'],
    summary?: string
  ): Promise<ConversationMemory | null> {
    if (!await this.isAvailable()) return null;

    try {
      const response = await fetch(`${this.baseUrl}/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          sessionId,
          messages,
          context,
          summary
        })
      });

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Failed to save conversation:', error);
      return null;
    }
  }

  // Get conversation by ID
  static async getConversation(id: string): Promise<ConversationMemory | null> {
    if (!await this.isAvailable()) return null;

    try {
      const response = await fetch(`${this.baseUrl}/conversations/${id}`);
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Failed to get conversation:', error);
      return null;
    }
  }

  // Get user conversations
  static async getUserConversations(
    userId: string,
    limit: number = 10
  ): Promise<ConversationMemory[]> {
    if (!await this.isAvailable()) return [];

    try {
      const response = await fetch(`${this.baseUrl}/conversations/user/${userId}?limit=${limit}`);
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Failed to get user conversations:', error);
      return [];
    }
  }

  // Record medical term usage
  static async recordMedicalTermUsage(
    term: string,
    userId: string,
    context: string[] = []
  ): Promise<MedicalTermUsage | null> {
    if (!await this.isAvailable()) return null;

    try {
      const response = await fetch(`${this.baseUrl}/medical-terms/usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          term,
          userId,
          context
        })
      });

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Failed to record medical term usage:', error);
      return null;
    }
  }

  // Get medical term usage for user
  static async getMedicalTermUsage(
    userId: string,
    limit: number = 20
  ): Promise<MedicalTermUsage[]> {
    if (!await this.isAvailable()) return [];

    try {
      const response = await fetch(`${this.baseUrl}/medical-terms/usage/${userId}?limit=${limit}`);
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Failed to get medical term usage:', error);
      return [];
    }
  }

  // Get memory statistics
  static async getMemoryStats(): Promise<any> {
    if (!await this.isAvailable()) return null;

    try {
      const response = await fetch(`${this.baseUrl}/stats`);
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (error) {
      console.error('Failed to get memory stats:', error);
      return null;
    }
  }

  // Helper methods for common use cases

  // Store user preference
  static async storeUserPreference(
    userId: string,
    key: string,
    value: any,
    importance: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<MemoryEntry | null> {
    return this.storeMemory(
      userId,
      'preference',
      key,
      value,
      undefined,
      {
        timestamp: Date.now(),
        source: 'user_interaction',
        importance,
        tags: ['user_preference']
      }
    );
  }

  // Get user preferences
  static async getUserPreferences(userId: string): Promise<Record<string, any>> {
    const memories = await this.getMemory(userId, undefined, 'preference');
    const preferences: Record<string, any> = {};
    
    memories.forEach(memory => {
      preferences[memory.key] = memory.value;
    });
    
    return preferences;
  }

  // Store form completion pattern
  static async storeFormPattern(
    userId: string,
    formType: string,
    pattern: any
  ): Promise<MemoryEntry | null> {
    return this.storeMemory(
      userId,
      'form_data',
      `form_pattern_${formType}`,
      pattern,
      undefined,
      {
        timestamp: Date.now(),
        source: 'form_completion',
        importance: 'medium',
        tags: ['form_pattern', formType]
      }
    );
  }

  // Store learning pattern
  static async storeLearningPattern(
    userId: string,
    pattern: string,
    context: any
  ): Promise<MemoryEntry | null> {
    return this.storeMemory(
      userId,
      'learning',
      `learning_${pattern}`,
      context,
      undefined,
      {
        timestamp: Date.now(),
        source: 'ai_learning',
        importance: 'high',
        tags: ['learning', 'pattern']
      }
    );
  }

  // Store conversation context
  static async storeConversationContext(
    userId: string,
    sessionId: string,
    context: any
  ): Promise<MemoryEntry | null> {
    return this.storeMemory(
      userId,
      'context',
      'current_context',
      context,
      sessionId,
      {
        timestamp: Date.now(),
        source: 'conversation',
        importance: 'high',
        tags: ['conversation', 'context']
      }
    );
  }
}

