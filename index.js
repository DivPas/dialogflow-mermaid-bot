const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

// Rate limiting middleware (optional but recommended for production)
app.use(rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per minute
  message: 'Too many requests, please try again later.',
}));

// Health check route
app.get('/', (req, res) => {
  res.status(200).send('Webhook service is running');
});

// Load secrets from environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

app.post('/', async (req, res) => {
  try {
    // Check if API key is configured
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    // Verify the secret token from the header
    const clientSecret = req.header('x-secret-token');
    if (!clientSecret || clientSecret !== SECRET_TOKEN) {
      console.warn('Unauthorized access attempt. Invalid or missing token.');
      return res.status(403).send('Forbidden: Invalid secret token');
    }

    // Extract prompt from Dialogflow CX payload
    const prompt = req.body.sessionInfo?.parameters?.prompt;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is missing from sessionInfo.parameters' });
    }

    // Call OpenAI API
    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that converts user prompts into valid Mermaid.js diagram code (flowchart format only). Only return the Mermaid code, nothing else.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000, // Timeout after 10 seconds
      }
    );

    const mermaidCode = openaiResponse.data.choices[0].message.content.trim();

    // Return the Mermaid code
    res.json({ mermaidCode });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
