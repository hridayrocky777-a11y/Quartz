const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });
console.log("Gemini =", process.env.GEMINI_API_KEY);

// ===========================
// Gemini Configuration
// Paste your Gemini API key below or set GEMINI_API_KEY in .env
// ===========================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'Quartz AI API', geminiConfigured: GEMINI_API_KEY !== 'PASTE_YOUR_API_KEY_HERE' });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'A message is required.' });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Gemini API key is not configured. Set GEMINI_API_KEY in your .env file.' });
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are Quartz, a helpful AI study assistant for students. Respond clearly and concisely.\n\nUser: ${message.trim()}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const detail = data?.error?.message || 'Gemini request failed.';
      return res.status(response.status).json({ error: detail });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
    return res.json({ reply });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to reach the Gemini API.' });
  }
});

app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Quartz server listening on http://localhost:${PORT}`);
});
