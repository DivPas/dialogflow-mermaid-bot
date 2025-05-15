import express from "express";
import bodyParser from "body-parser";
import zlib from "zlib";
import { OpenAI } from "openai";

const app = express();
app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function encodeMermaidToURL(text) {
  const compressed = zlib.deflateSync(text, { level: 9 });
  return compressed.toString("base64url");
}

app.post("/", async (req, res) => {
  const prompt = req.body.sessionInfo?.parameters?.prompt || "Create a basic flowchart";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Only output valid Mermaid.js flowchart code. No explanation or intro text.",
        },
        { role: "user", content: prompt },
      ],
    });

    const mermaidCode = completion.choices[0].message.content.trim();
    const encoded = encodeMermaidToURL(mermaidCode);
    const imageUrl = `https://mermaid.ink/img/${encoded}`;

    res.json({
      fulfillment_response: {
        messages: [
          {
            text: { text: ["Here is your diagram!"] },
          },
          {
            payload: {
              richContent: [
                [
                  {
                    type: "image",
                    rawUrl: imageUrl,
                    accessibilityText: "Mermaid Diagram"
                  }
                ]
              ]
            }
          }
        ],
      },
    });
  } catch (err) {
    console.error("Error generating diagram:", err);
    res.json({
      fulfillment_response: {
        messages: [
          {
            text: {
              text: ["Something went wrong!"],
            },
          },
        ],
      },
    });
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));