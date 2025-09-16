# Gemini AI Setup Instructions

## Overview
MILA (Medical Intelligence & Learning Assistant) uses Google's Gemini AI for enhanced medical billing assistance. This guide will help you configure the Gemini API key for both local development and production deployment.

## 🔑 Getting Your Gemini API Key

### Step 1: Access Google AI Studio
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### Step 2: Local Development Setup

#### Option A: Environment File (Recommended)
1. Create a `.env` file in the project root:
```bash
# .env
VITE_GEMINI_API_KEY=your_actual_api_key_here
```

#### Option B: Direct Configuration
1. Open `src/services/GeminiAIService.ts`
2. Replace line 31 with your actual API key:
```typescript
const apiKey = "your_actual_api_key_here" // Replace with your real API key
```

### Step 3: Production Deployment (Netlify)

#### Method 1: Netlify Dashboard
1. Go to your Netlify site dashboard
2. Navigate to Site Settings > Environment Variables
3. Add a new variable:
   - **Key**: `VITE_GEMINI_API_KEY`
   - **Value**: Your actual API key
4. Redeploy your site

#### Method 2: Netlify CLI
```bash
netlify env:set VITE_GEMINI_API_KEY "your_actual_api_key_here"
netlify deploy --prod
```

#### Method 3: Update netlify.toml
Add to your `netlify.toml`:
```toml
[build.environment]
  NODE_VERSION = "18"
  VITE_GEMINI_API_KEY = "your_actual_api_key_here"
```

## 🧪 Testing the Configuration

### Local Testing
1. Start your development server: `npm run dev`
2. Open the MILA assistant
3. Ask a complex question like: "Explain the difference between ICD-10 and CPT codes"
4. You should see "🧠 Enhanced AI Response:" instead of "Configuration Error"

### Production Testing
1. Deploy with the API key configured
2. Test the same complex question in production
3. Verify you get enhanced AI responses

## 🔧 Troubleshooting

### Common Issues

#### "Configuration Error: Gemini AI is not properly configured"
- **Cause**: API key not set or incorrect
- **Solution**: Verify `VITE_GEMINI_API_KEY` is set correctly in your environment

#### "Rate Limit: Too many requests"
- **Cause**: Exceeded Gemini's free tier limits (15 requests/minute)
- **Solution**: Wait a minute or upgrade to a paid plan

#### "AI Service Temporarily Unavailable"
- **Cause**: Network issues or API service problems
- **Solution**: Check your internet connection and try again

### Debug Steps
1. Check browser console for error messages
2. Verify environment variable is loaded: `console.log(import.meta.env.VITE_GEMINI_API_KEY)`
3. Test API key directly with Google's API
4. Check Netlify environment variables in dashboard

## 💰 Pricing Information

### Free Tier
- **15 requests per minute**
- **1,500 requests per day**
- **1 million tokens per day**
- Perfect for development and small production use

### Paid Plans
- Higher rate limits
- More tokens per day
- Priority support
- See [Google AI Pricing](https://ai.google.dev/pricing) for details

## 🔒 Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables for all configurations**
3. **Rotate API keys regularly**
4. **Monitor usage to prevent unexpected charges**
5. **Use different keys for development and production**

## 📊 Usage Monitoring

The system includes built-in usage tracking:
- Rate limiting (15 requests/minute)
- Request counting
- Automatic fallback to local knowledge when limits are reached

## 🚀 Next Steps

Once configured, MILA will automatically:
1. Route complex queries to Gemini AI
2. Use local knowledge for simple lookups
3. Provide enhanced medical billing assistance
4. Fall back gracefully if Gemini is unavailable

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Review the browser console for errors
3. Verify your API key is working with Google's test endpoint
4. Contact support with specific error messages

---

**Note**: The system is designed to work with or without Gemini AI. If not configured, MILA will use its built-in medical billing knowledge base for all queries.