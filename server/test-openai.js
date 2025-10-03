// Simple OpenAI test script
const OpenAI = require('openai');
require('dotenv').config();

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API...');
    console.log('API Key:', process.env.OPENAI_API_KEY ? 'Present' : 'Missing');
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'user', content: 'Hello, this is a test message. Please respond briefly.' }
      ],
      max_tokens: 50
    });

    console.log('✅ OpenAI API working!');
    console.log('Response:', completion.choices[0].message.content);
    
  } catch (error) {
    console.error('❌ OpenAI API error:', error.message);
    console.error('Error details:', error);
  }
}

testOpenAI();