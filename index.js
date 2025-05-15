const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

app.post('/', async (req, res) => {
  try {
    const prompt = req.body.sessionInfo?.parameters?.prompt;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is missing from sessionInfo.parameters' });
    }

    if (!SECRET_TOKEN) {
      return res.status(403).send('Forbidden: Secret token not configured');
    }

    // Generate Mermaid code using OpenAI
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
        temperature:
