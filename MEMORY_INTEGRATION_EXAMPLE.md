# Memory Integration Example for Alivi Application

This example shows how to integrate the Memory Service with Mila to provide persistent memory capabilities.

## 🚀 Quick Start

1. **Start the Memory Server:**
   ```bash
   cd simple-memory-server
   npm start
   ```

2. **Import the Memory Service in your components:**
   ```typescript
   import { MemoryService } from '../services/MemoryService';
   ```

## 📝 Example Integration

### 1. Store User Preferences

```typescript
// In your AIAssistantService.ts or HelperModal.tsx

// Store user's preferred response style
await MemoryService.storeUserPreference(
  'user123',
  'response_style',
  'detailed',
  'high'
);

// Store user's medical terminology level
await MemoryService.storeUserPreference(
  'user123',
  'medical_level',
  'advanced',
  'high'
);

// Store user's form guidance preference
await MemoryService.storeUserPreference(
  'user123',
  'form_guidance',
  'comprehensive',
  'medium'
);
```

### 2. Retrieve User Preferences

```typescript
// Get all user preferences
const preferences = await MemoryService.getUserPreferences('user123');
console.log(preferences);
// Output: { response_style: 'detailed', medical_level: 'advanced', form_guidance: 'comprehensive' }

// Get specific preference
const responseStyle = preferences.response_style || 'standard';
```

### 3. Track Medical Term Usage

```typescript
// When user asks about a medical term
await MemoryService.recordMedicalTermUsage(
  'diabetes mellitus',
  'user123',
  ['definition_request', 'billing_question']
);

// Get user's most used terms
const termUsage = await MemoryService.getMedicalTermUsage('user123');
console.log(termUsage);
// Output: Array of terms with usage counts and context
```

### 4. Store Conversation Context

```typescript
// Store current conversation context
await MemoryService.storeConversationContext(
  'user123',
  'session456',
  {
    formType: 'claims_submission',
    currentField: 'provider_id',
    currentStep: 3,
    deviceType: 'desktop',
    userRole: 'biller'
  }
);
```

### 5. Save Complete Conversations

```typescript
// Save a complete conversation
await MemoryService.saveConversation(
  'user123',
  'session456',
  [
    {
      role: 'user',
      content: 'What is diabetes mellitus?',
      timestamp: Date.now()
    },
    {
      role: 'assistant',
      content: 'Diabetes mellitus is a group of metabolic disorders...',
      timestamp: Date.now()
    }
  ],
  {
    formType: 'claims_submission',
    currentField: 'diagnosis_codes',
    currentStep: 2
  },
  'User asked about diabetes mellitus definition'
);
```

### 6. Enhanced AI Assistant with Memory

```typescript
// Enhanced AIAssistantService with memory integration
export class AIAssistantService {
  private static async processUserInputWithMemory(
    input: string,
    context: AIContext
  ): Promise<string> {
    const userId = context.userId || 'anonymous';
    
    // Get user preferences
    const preferences = await MemoryService.getUserPreferences(userId);
    const responseStyle = preferences.response_style || 'standard';
    const medicalLevel = preferences.medical_level || 'intermediate';
    
    // Record medical term usage if applicable
    if (this.isTerminologyQuestion(input)) {
      const terms = this.extractMedicalTerms(input);
      for (const term of terms) {
        await MemoryService.recordMedicalTermUsage(term, userId, ['definition_request']);
      }
    }
    
    // Store conversation context
    await MemoryService.storeConversationContext(userId, context.sessionId || 'default', {
      formType: context.formType,
      currentField: context.currentField,
      currentStep: context.currentStep,
      deviceType: context.deviceType,
      userRole: context.userRole
    });
    
    // Process with enhanced context
    const response = await this.processUserInput(input, {
      ...context,
      userPreferences: preferences
    });
    
    return response;
  }
  
  private static extractMedicalTerms(input: string): string[] {
    const medicalTerms = [
      'diabetes mellitus', 'hypertension', 'glaucoma', 'cataract',
      'diabetic retinopathy', 'macular degeneration', 'copay', 'deductible'
    ];
    
    return medicalTerms.filter(term => 
      input.toLowerCase().includes(term.toLowerCase())
    );
  }
}
```

### 7. Personalized Responses Based on Memory

```typescript
// In your HelperModal.tsx
const generatePersonalizedResponse = async (input: string, userId: string) => {
  // Get user's medical term usage
  const termUsage = await MemoryService.getMedicalTermUsage(userId);
  const mostUsedTerms = termUsage.slice(0, 5).map(t => t.term);
  
  // Get user preferences
  const preferences = await MemoryService.getUserPreferences(userId);
  const responseStyle = preferences.response_style || 'standard';
  
  // Generate personalized response
  let response = await AIAssistantService.processUserInput(input, {});
  
  // Add personalization based on usage patterns
  if (mostUsedTerms.length > 0) {
    response += `\n\n**Related to your frequently asked terms:** ${mostUsedTerms.join(', ')}`;
  }
  
  // Adjust response style
  if (responseStyle === 'detailed') {
    response += `\n\n**Additional Context:** This information is based on your medical billing expertise level.`;
  }
  
  return response;
};
```

### 8. Learning from User Interactions

```typescript
// Store learning patterns
const storeUserLearningPattern = async (userId: string, interaction: any) => {
  await MemoryService.storeLearningPattern(
    userId,
    'definition_requests',
    {
      commonTerms: interaction.terms,
      preferredFormat: interaction.format,
      followUpQuestions: interaction.followUps
    }
  );
};

// Use learning patterns to improve responses
const getPersonalizedSuggestions = async (userId: string) => {
  const learningPatterns = await MemoryService.getMemory(
    userId,
    undefined,
    'learning'
  );
  
  const definitionPattern = learningPatterns.find(p => p.key === 'learning_definition_requests');
  if (definitionPattern) {
    return definitionPattern.value.commonTerms.slice(0, 3);
  }
  
  return ['diabetes', 'hypertension', 'glaucoma'];
};
```

## 🎯 Benefits of Memory Integration

### **For Users:**
- **Personalized Responses**: Mila remembers your preferences and adapts
- **Learning Capability**: Gets better at helping with your specific needs
- **Context Awareness**: Maintains conversation flow across sessions
- **Efficient Workflows**: Learns your common patterns and suggests shortcuts

### **For Developers:**
- **Simple API**: Easy to integrate with existing code
- **Flexible Storage**: Store any type of data with metadata
- **Analytics**: Track usage patterns and user engagement
- **Scalable**: Built on SQLite with room for growth

## 🔧 Configuration

### **Enable/Disable Memory Service:**
```typescript
// Disable memory service (fallback to stateless mode)
MemoryService.setEnabled(false);

// Re-enable memory service
MemoryService.setEnabled(true);
```

### **Check Memory Service Status:**
```typescript
const isAvailable = await MemoryService.isAvailable();
if (isAvailable) {
  // Use memory features
} else {
  // Fallback to basic functionality
}
```

## 📊 Memory Types Available

| Type | Description | Use Case |
|------|-------------|----------|
| `preference` | User settings and choices | Personalize responses |
| `conversation` | Chat messages and context | Maintain context |
| `learning` | AI learning patterns | Improve over time |
| `context` | Current session state | Track progress |
| `medical_term` | Medical terminology usage | Track familiarity |
| `form_data` | Form completion data | Assist with forms |

## 🚀 Getting Started

1. **Start the memory server:**
   ```bash
   cd simple-memory-server
   npm start
   ```

2. **Import the service:**
   ```typescript
   import { MemoryService } from '../services/MemoryService';
   ```

3. **Start storing memories:**
   ```typescript
   await MemoryService.storeUserPreference('user123', 'response_style', 'detailed');
   ```

4. **Watch Mila get smarter!** 🧠✨

The memory service will make Mila significantly more intelligent by remembering your preferences, learning from your interactions, and providing increasingly personalized assistance!

