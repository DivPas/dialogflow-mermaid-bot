const express = require('express');
const bodyParser = require('body-parser');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(bodyParser.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/', async (req, res) => {
  // Check for secret token in header
  if (req.headers['x-webhook-token'] !== SECRET_TOKEN) {
    return res.status(403).send('Forbidden: Invalid token');
  }

  try {
    const prompt = req.body.prompt;
    if (!prompt) {
      return res.status(400).send({ error: 'Missing prompt' });
    }

    // Call OpenAI to generate Mermaid code
    const completion = await openai.createChatCompletion({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that converts user prompts into Mermaid.js flowchart code.',
        },
        { role: 'user', content: prompt },
      ],
    });

    const mermaidCode = completion.data.choices[0].message.content.trim();

    // Encode Mermaid code for mermaid.ink URL
    const encoded = encodeURIComponent(mermaidCode);
    const mermaidUrl = `https://mermaid.ink/img/${encoded}`;

    // Return Mermaid code and image URL
    res.json({
      mermaid: mermaidCode,
      imageUrl: mermaidUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Mermaid webhook running');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
