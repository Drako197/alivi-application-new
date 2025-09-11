# 🚀 Gemini AI Integration Setup Instructions

## Step 1: Get Your Gemini API Key

1. **Visit Google AI Studio**: https://aistudio.google.com/
2. **Sign in** with your Google account
3. **Create a new project** (if you don't have one)
4. **Generate API Key**:
   - Click "Get API Key" in the left sidebar
   - Click "Create API Key"
   - Copy and save the key securely

## Step 2: Configure Environment Variables

1. **Create a `.env` file** in your project root:
   ```bash
   touch .env
   ```

2. **Add your API key** to the `.env` file:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Verify `.env` is in `.gitignore`** ✅ (Already done)

## Step 3: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Open M.I.L.A. in any form**:
   - Click the floating M.I.L.A. button
   - Look for the "🧪 Test Gemini AI" button at the bottom (development only)
   - Click it to test the integration

## Step 4: How the Hybrid System Works

### 🧠 **Gemini AI is used for:**
- Complex reasoning questions ("Explain the difference between...")
- Multi-step workflows ("Walk me through...")
- Conversational queries ("Help me understand...")
- Medical billing strategy ("What's the best way to...")
- Ambiguous or context-dependent questions

### ⚡ **Local Knowledge is used for:**
- Direct code lookups (E11.9, 92250, etc.)
- Simple terminology (OD, OS, NPI, CPT)
- Form field guidance
- Quick medical code definitions

## Step 5: Usage Examples

### Will use Gemini AI:
- "Explain why ICD-10 codes are more specific than ICD-9"
- "Walk me through the claims submission process for diabetic retinopathy"
- "What's the difference between CPT and HCPCS codes?"
- "Help me understand when to use modifier 25"

### Will use Local Knowledge:
- "What is OD?"
- "E11.9"
- "92250"
- "What does NPI stand for?"

## Step 6: Rate Limits & Usage

- **Free Tier**: 15 requests per minute
- **Automatic Rate Limiting**: Built-in protection
- **Fallback System**: Uses local knowledge if Gemini is unavailable
- **Cost**: Completely free within the rate limits

## Step 7: Security & Compliance

✅ **HIPAA Compliant**: No PHI is sent to Gemini
✅ **API Key Protected**: Stored in environment variables
✅ **Local Processing**: Medical codes stay on your system
✅ **Graceful Fallback**: Always works even if Gemini is down

## Troubleshooting

### API Key Issues:
- Ensure key is correctly set in `.env`
- Restart development server after adding the key
- Check browser console for error messages

### Rate Limiting:
- Free tier allows 15 requests/minute
- System automatically waits if limit is reached
- Falls back to local knowledge during rate limits

### Testing:
- Use the "🧪 Test Gemini AI" button in development
- Check console logs for detailed debugging info
- Try both simple and complex queries to see routing in action

## What's New in M.I.L.A.

M.I.L.A. now has:
- 🧠 **Enhanced reasoning** for complex medical billing questions
- 🔄 **Smart routing** between local knowledge and AI
- 📊 **Usage tracking** to monitor API consumption
- 🛡️ **Automatic fallbacks** to ensure reliability
- 🎯 **Medical billing specialization** with context-aware responses

Your local medical knowledge base is still intact and working faster than ever for simple queries!

