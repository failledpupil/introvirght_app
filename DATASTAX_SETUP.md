# DataStax Astra DB Setup Guide

## Your Configuration

Your DataStax endpoint is already configured:
```
DATASTAX_ENDPOINT=https://f7c167af-9dec-491a-8e25-dd6fdf530692-us-east-2.apps.astra.datastax.com
```

## Get Your DataStax Token

1. Go to [astra.datastax.com](https://astra.datastax.com)
2. Sign in to your account
3. Navigate to your database dashboard
4. Click on "Connect" tab
5. Generate an Application Token with the following roles:
   - Database Administrator (for full access)
6. Copy the token and update your `.env` file:

```bash
DATASTAX_TOKEN=your-actual-token-here
```

## Verify Setup

Once you have your token configured, the application will:

1. ✅ Connect to your DataStax Astra DB
2. ✅ Create the vector collection automatically
3. ✅ Generate embeddings using OpenAI
4. ✅ Store diary entries as vectors
5. ✅ Enable semantic search and AI companion features

## Test the Integration

1. Start the server: `npm run dev`
2. Create a diary entry
3. Try the AI companion - it will use your diary context
4. Use semantic search to find related entries

## Collection Schema

The system automatically creates a collection with:
- **Dimension**: 1536 (OpenAI text-embedding-3-small)
- **Metric**: Cosine similarity
- **Collection Name**: diary_embeddings
- **Keyspace**: diary_vectors

## Troubleshooting

If you see connection errors:
1. Verify your token has the correct permissions
2. Check that your database is active (not hibernated)
3. Ensure the endpoint URL is correct
4. Check the server logs for detailed error messages