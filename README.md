# Mermaid Diagram Webhook for Dialogflow CX

This webhook accepts a prompt from Dialogflow CX, uses OpenAI to generate Mermaid.js code, then returns a rendered image URL using mermaid.ink.

## 🔧 Environment

- Node.js
- Google Cloud Run
- OpenAI
- Mermaid.ink

## 🚀 Deploy on Cloud Run

```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/mermaid-bot
gcloud run deploy mermaid-bot \
  --image gcr.io/YOUR_PROJECT_ID/mermaid-bot \
  --platform managed \
  --region us-central1 \
  --no-allow-unauthenticated \
  --set-env-vars OPENAI_API_KEY=your_openai_api_key
