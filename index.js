const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

// Load keys from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

app.post('/', async (req, res) => {
  try {
    // Verify the secret token from the custom header 'x-secret-token'
    const clientSecret = req.header('x-secret-token');
    if (!clientSecret || clientSecret !== mySuperSecret123) {
      return res.status(403).send('Forbidden: Invalid secret token');
    }

    // Extract prompt from Dialogflow-style payload
    const prompt = req.body.sessionInfo?.parameters?.prompt;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is missing from sessionInfo.parameters' });
    }

    // Call OpenAI API to generate Mermaid.js code
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
      }
    );

    const mermaidCode = openaiResponse.data.choices[0].message.content;

    // Return the Mermaid code as JSON
    res.json({ mermaidCode });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
