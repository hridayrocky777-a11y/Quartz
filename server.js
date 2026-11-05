
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

// Gemini Configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(__dirname));

// Health Check
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'Quartz AI API',
    geminiConfigured: Boolean(GEMINI_API_KEY)
  });
});

// Gemini Chat
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({
        error: 'A message is required.'
      });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key is not configured.'
      });
    }

    const response = await fetch(
      `${GEMINI_API_URL}?key=${encodeURIComponent(GEMINI_API_KEY)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are Quartz, a helpful AI study assistant for students. Respond clearly and concisely.

User: ${message.trim()}`
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
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'Gemini request failed.'
      });
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No response received.';

    return res.json({ reply });

  } catch (error) {
    console.error('Quartz API Error:', error.message);

    return res.status(500).json({
      error: 'Unable to reach the Gemini API.'
    });
  }
});

// Frontend
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Quartz server listening on port ${PORT}`);
});
