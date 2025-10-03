# OpenAI API Setup Guide

This application uses OpenAI's ChatGPT API to provide intelligent, context-aware responses in the AI companion feature.

## Setup Instructions

### 1. Get an OpenAI API Key

1. Go to [OpenAI's website](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to the API section
4. Create a new API key
5. Copy the API key (it starts with `sk-`)

### 2. Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   OPENAI_MODEL=gpt-3.5-turbo
   ```

### 3. Available Models

You can use different OpenAI models by changing the `OPENAI_MODEL` environment variable:

- `gpt-3.5-turbo` (recommended, cost-effective)
- `gpt-4` (more capable, higher cost)
- `gpt-4-turbo-preview` (latest GPT-4 model)

### 4. Fallback Behavior

If the OpenAI API key is not provided or the API is unavailable, the application will:
- Fall back to rule-based responses for the chatbot
- Use simple hash-based embeddings for vector search
- Continue to function with reduced AI capabilities

### 5. Cost Considerations

- GPT-3.5-turbo: ~$0.002 per 1K tokens
- GPT-4: ~$0.03 per 1K tokens
- Embeddings: ~$0.0001 per 1K tokens

The application is designed to be cost-efficient:
- Responses are limited to 300 tokens
- Only recent conversation history is included
- Embeddings are cached in the database

### 6. Privacy and Security

- API keys are stored securely in environment variables
- User diary data is only sent to OpenAI for generating responses
- No data is stored by OpenAI when using the API
- All conversations remain private to the user

## Testing

To test the OpenAI integration:

1. Start the server with your API key configured
2. Create some diary entries
3. Open the AI Companion chat
4. Send a message and verify you get an intelligent, contextual response

If you see generic responses, check your API key configuration and server logs for any errors.