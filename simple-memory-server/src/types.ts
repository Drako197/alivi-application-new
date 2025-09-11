// Types for the Simple Memory Server

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
    lastActive: string;
  }>;
}

