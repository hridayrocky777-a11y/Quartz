const http = require('http');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const PORT = Number(process.env.PORT) || 3000;
const STATIC_ROOT = path.resolve(__dirname, '..');
const MAX_BODY_BYTES = 64 * 1024;
const SYSTEM_INSTRUCTION = [
  'You are Quartz AI, a helpful student assistant.',
  'Explain concepts clearly, help with studying, and answer academic questions.',
  'Help students understand rather than simply giving answers.',
  'Use concise, student-friendly explanations.',
].join(' ');

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  response.end(JSON.stringify(body));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;

    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      size += Buffer.byteLength(chunk);
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Request body is too large.'), { statusCode: 413 }));
        request.destroy();
        return;
      }
      body += chunk;
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function buildPrompt({ userMessage, editorText, uploadedDocuments }) {
  const notes = typeof editorText === 'string' ? editorText.trim() : '';
  const documents = Array.isArray(uploadedDocuments)
    ? uploadedDocuments
        .filter((document) => document && typeof document.content === 'string')
        .map((document) => `${document.name || 'Uploaded document'}:\n${document.content}`)
        .join('\n\n')
    : '';

  return [
    `Student question:\n${userMessage.trim()}`,
    notes ? `Current study notes:\n${notes}` : '',
    documents ? `Uploaded study material:\n${documents}` : '',
  ].filter(Boolean).join('\n\n');
}

async function handleChat(request, response) {
  if (!process.env.GEMINI_API_KEY) {
    sendJson(response, 500, { error: 'The Gemini API key is not configured on the server.' });
    return;
  }

  let payload;
  try {
    const body = await readRequestBody(request);
    payload = JSON.parse(body);
  } catch (error) {
    sendJson(response, error.statusCode || 400, { error: 'Request body must be valid JSON.' });
    return;
  }

  const userMessage = typeof payload.userMessage === 'string'
    ? payload.userMessage.trim()
    : typeof payload.message === 'string'
      ? payload.message.trim()
      : '';

  if (!userMessage) {
    sendJson(response, 400, { error: 'A non-empty message is required.' });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const result = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: buildPrompt({ ...payload, userMessage }),
      config: { systemInstruction: SYSTEM_INSTRUCTION },
    });
    const message = typeof result.text === 'string' ? result.text.trim() : '';

    if (!message) {
      sendJson(response, 502, { error: 'Gemini returned an empty response.' });
      return;
    }

    sendJson(response, 200, { message });
  } catch (error) {
    console.error('Gemini request failed:', error.message);
    sendJson(response, 502, { error: 'The AI service is temporarily unavailable.' });
  }
}

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

function serveStatic(request, response) {
  const requestedPath = request.url === '/' ? '/html/index.html' : request.url.split('?')[0];
  const filePath = path.resolve(STATIC_ROOT, `.${requestedPath}`);
  if (!filePath.startsWith(`${STATIC_ROOT}${path.sep}`)) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500);
      response.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
      return;
    }
    response.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream',
    });
    response.end(content);
  });
}

const server = http.createServer((request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    });
    response.end();
    return;
  }

  if (request.method === 'POST' && request.url === '/api/chat') {
    handleChat(request, response);
    return;
  }

  if (request.method === 'GET') {
    serveStatic(request, response);
    return;
  }

  sendJson(response, 405, { error: 'Method not allowed.' });
});

server.listen(PORT, () => {
  console.log(`Quartz server running at http://localhost:${PORT}`);
});
