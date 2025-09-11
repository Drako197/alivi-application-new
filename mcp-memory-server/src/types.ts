// Types for the MCP Memory Server

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
  createdAt: Date;
  updatedAt: Date;
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
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  userId: string;
  preferences: {
    language: string;
    responseStyle: 'concise' | 'detailed' | 'technical';
    medicalTerminology: 'basic' | 'intermediate' | 'advanced';
    formGuidance: 'minimal' | 'standard' | 'comprehensive';
    notifications: boolean;
    darkMode: boolean;
    autoSuggestions: boolean;
  };
  learningProfile: {
    expertiseLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    commonTasks: string[];
    frequentErrors: string[];
    successfulPatterns: string[];
    learningGoals: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface MedicalTermUsage {
  id: string;
  term: string;
  userId: string;
  usageCount: number;
  lastUsed: Date;
  context: string[];
  relatedTerms: string[];
  userNotes?: string;
}

export interface FormCompletionPattern {
  userId: string;
  formType: string;
  completionRate: number;
  averageTime: number;
  commonFields: string[];
  errorFields: string[];
  successfulWorkflows: string[];
  lastCompleted: Date;
}

export interface MemoryQuery {
  userId?: string;
  sessionId?: string;
  type?: string;
  key?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
  orderBy?: 'createdAt' | 'updatedAt' | 'importance';
  order?: 'asc' | 'desc';
}

export interface MemoryStats {
  totalEntries: number;
  entriesByType: Record<string, number>;
  entriesByUser: Record<string, number>;
  recentActivity: Array<{
    timestamp: number;
    type: string;
    userId: string;
    action: string;
  }>;
  topTerms: Array<{
    term: string;
    usageCount: number;
  }>;
  userEngagement: Array<{
    userId: string;
    sessionCount: number;
    totalInteractions: number;
    lastActive: Date;
  }>;
}
