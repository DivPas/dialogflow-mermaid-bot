# Mermaid Diagram Webhook for Dialogflow CX

This webhook accepts a prompt from Dialogflow CX, uses OpenAI to generate Mermaid.js code, then returns a rendered image URL using mermaid.ink.

## 🔧 Environment

- Node.js
- Google Cloud Run
- OpenAI
- Mermaid.ink

## 🚀 Deploy on Cloud Run

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/mermaid-webhook
gcloud run deploy mermaid-webhook \
  --image gcr.io/YOUR_PROJECT_ID/mermaid-webhook \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

Add environment variable:
- `OPENAI_API_KEY`

## 🤖 Use in Dialogflow CX

1. Create intent with `@sys.any` parameter called `prompt`.
2. In fulfillment, call this webhook.
3. It will return a Mermaid diagram image.

Test prompt:  
**"Create a signup and verification flow"**