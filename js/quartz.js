dconst noteEditor = document.getElementById('noteEditor');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatWindow = document.getElementById('chatWindow');
const generateNotesButton = document.getElementById('generateNotes');
const summarizeNotesButton = document.getElementById('summarizeNotes');
const clearWorkspaceButton = document.getElementById('clearWorkspace');
const splitter = document.getElementById('splitter');
const leftPanel = document.querySelector('.editor-panel');
const fileUpload = document.getElementById('fileUpload');
const uploadedFilesList = document.getElementById('uploadedFiles');

// ========== DEBUG LOGGING ==========
const LOG_ENABLED = true;
function logDebug(...args) {
  if (LOG_ENABLED) console.log('[Quartz Chat]', ...args);
}
function logError(...args) {
  if (LOG_ENABLED) console.error('[Quartz Chat ERROR]', ...args);
}

// Validate DOM elements on load
logDebug('Quartz.js initialized. Validating DOM elements...');
if (!chatWindow) logError('chatWindow element not found! Chat will not render.');
if (!chatForm) logError('chatForm element not found! Form submission will not work.');
if (!chatInput) logError('chatInput element not found! Input will not capture text.');
logDebug('DOM Status - chatWindow: ' + !!chatWindow + ', chatForm: ' + !!chatForm + ', chatInput: ' + !!chatInput);

// ========== Backend Configuration ==========
const BACKEND_URL = 'http://localhost:3000';

// ========== Supabase Configuration ==========


if (!supabaseClient) {
  console.warn('Supabase client not initialized. Make sure the CDN script is loaded and SUPABASE_URL is configured.');
}

// Store uploaded documents for context
let uploadedDocuments = [];

const aiResponses = [
  'I can help turn your notes into a concise summary or explain any concept in a simple way.',
  'Try asking me to generate practice questions, explain a formula, or turn your chapter into a study guide.',
  'If you paste a lesson here, I can pull out the key ideas and highlight what matters most for exams.',
];

function addChatMessage(role, text) {
  if (!chatWindow) {
    logError('Cannot add message: chatWindow is null or undefined');
    return;
  }
  if (!text) {
    logError('Cannot add message: text is empty');
    return;
  }
  
  try {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${role}`;
    
    const speaker = document.createElement('span');
    speaker.className = 'speaker';
    speaker.textContent = role === 'user' ? 'You' : 'Assistant';
    
    const message = document.createElement('p');
    message.textContent = text;
    
    bubble.appendChild(speaker);
    bubble.appendChild(message);
    chatWindow.appendChild(bubble);
    
    // Ensure scroll happens on next frame for proper height calculation
    requestAnimationFrame(() => {
      chatWindow.scrollTop = chatWindow.scrollHeight;
    });
    
    logDebug('Message added - Role: ' + role + ', Text: ' + text.substring(0, 50) + (text.length > 50 ? '...' : ''));
  } catch (error) {
    logError('Error adding message:', error);
  }
}

function getSelectedText() {
  const selection = window.getSelection();
  return selection ? selection.toString().trim() : '';
}

function getEditorText() {
  return noteEditor.innerText.trim();
}

// ========== Function to call Backend API ==========
async function callOpenAIAPI(userMessage) {
  const editorText = getEditorText();

  const response = await fetch(`${BACKEND_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userMessage,
      editorText,
      uploadedDocuments,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend API error: ${response.status} ${response.statusText} -- ${errorText}`);
  }

  const data = await response.json();
  return data?.message || 'No response returned from AI.';
}

function createAssistantReplyMock(prompt) {
  console.warn('OpenAI API not configured yet. Using mock response.');
  return 'This is where OpenAI API will respond with intelligent answers!';
}

function createAssistantReply(prompt) {
  const content = getEditorText();
  const selected = getSelectedText();

  if (!prompt && !content) {
    return 'Start by typing some notes or asking a question. I will help you create quick study material instantly.';
  }

  if (prompt.toLowerCase().includes('summarize')) {
    if (!content) {
      return 'Paste or type your study notes first, then click Summarize to see a short review of the material.';
    }
    return `Summary: ${content.slice(0, 280)}${content.length > 280 ? '…' : ''}`;
  }

  if (prompt.toLowerCase().includes('generate')) {
    return 'Generated Notes: Use headings, bullets, and key definitions from your study material to build a fast review sheet.';
  }

  if (prompt.toLowerCase().includes('explain')) {
    return selected
      ? `Explanation: ${selected} means ... (use the note context to explain this concept clearly in simple terms).`
      : 'Highlight a phrase in your study notes or type the concept you want explained, and I will break it down for you.';
  }

  return aiResponses[Math.floor(Math.random() * aiResponses.length)];
}

// ========== File upload handler ==========
fileUpload.addEventListener('change', async (event) => {
  const files = Array.from(event.target.files || []);

  for (let file of files) {
    console.log('File to be processed:', file.name);
    const ext = file.name.split('.').pop().toLowerCase();
    let extractedText = '';

    if (ext === 'txt') {
      extractedText = await file.text();
    } else if (ext === 'pdf') {
      extractedText = 'PDF upload is not currently supported in this browser version. Please upload a .txt file or enable a backend parser.';
    } else if (ext === 'docx' || ext === 'doc') {
      extractedText = 'DOCX upload is not currently supported in this browser version. Please upload a .txt file or enable a backend parser.';
    } else {
      extractedText = `Unsupported file type: ${ext}. Only .txt is supported in the browser right now.`;
    }

    uploadedDocuments.push({
      name: file.name,
      content: extractedText,
    });
  }

  updateUploadedFilesList();
});

function updateUploadedFilesList() {
  uploadedFilesList.innerHTML = uploadedDocuments
    .map((doc, idx) => `
      <div class="file-item">
        <span class="file-icon">📄</span>
        <span>${doc.name}</span>
        <span class="remove-file" onclick="removeFile(${idx})">✕</span>
      </div>
    `).join('');
}

function removeFile(index) {
  uploadedDocuments.splice(index, 1);
  updateUploadedFilesList();
}

// ========== Chat Form Handler with Stub ==========
if (chatForm) {
  chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const prompt = chatInput.value.trim();
    
    logDebug('Form submitted. Prompt: "' + prompt + '"');
    
    if (!prompt) {
      logDebug('Prompt is empty, skipping message.');
      return;
    }

    logDebug('Adding user message to chat window...');
    addChatMessage('user', prompt);
    chatInput.value = '';
    chatInput.focus();

    setTimeout(() => {
      logDebug('Generating AI reply...');
      try {
        const reply = getLocalStubReply(prompt);
        logDebug('AI reply generated: "' + reply + '"');
        addChatMessage('assistant', reply);
      } catch (error) {
        logError('Error generating reply:', error);
        addChatMessage('assistant', 'Error generating reply.');
      }
    }, 250);
  });
} else {
  logError('chatForm not found - cannot attach submit listener!');
}

// Local stub: respond 'hello' to 'hi', otherwise show apology for questions/other messages
function getLocalStubReply(text) {
  if (!text) {
    logDebug('getLocalStubReply called with empty text');
    return 'we are very sorry, the ai will be coming soon';
  }
  
  const t = text.trim().toLowerCase();
  let reply = 'we are very sorry, the ai will be coming soon';
  
  if (t === 'hi' || t === 'hi!') {
    reply = 'hello';
  } else if (t === 'exit' || t === 'quit') {
    reply = 'Workspace cleared. Starting fresh.';
  } else if (t.includes('?') || /^(who|what|why|how|when|where)\b/.test(t)) {
    reply = 'we are very sorry, the ai will be coming soon';
  }
  
  logDebug('getLocalStubReply - Input: "' + t + '" -> Reply: "' + reply + '"');
  return reply;
}

// ========== Button Handlers ==========
if (generateNotesButton) {
  generateNotesButton.addEventListener('click', () => {
    logDebug('Generate Notes button clicked');
    const content = getEditorText();
    if (!content) {
      addChatMessage('assistant', 'Paste your chapter or type your notes first. Then I can generate a study-friendly version for you.');
      return;
    }
    addChatMessage('assistant', 'Generated Notes: Use this as a study outline and expand it with your own examples.');
    addChatMessage('assistant', `• ${content.slice(0, 120)}${content.length > 120 ? '…' : ''}`);
  });
} else {
  logError('generateNotesButton not found');
}

if (summarizeNotesButton) {
  summarizeNotesButton.addEventListener('click', () => {
    logDebug('Summarize button clicked');
    const content = getEditorText();
    if (!content) {
      addChatMessage('assistant', 'No notes found. Add some text on the left side and try again.');
      return;
    }
    addChatMessage('assistant', `Quick Summary: ${content.slice(0, 220)}${content.length > 220 ? '…' : ''}`);
  });
} else {
  logError('summarizeNotesButton not found');
}

if (clearWorkspaceButton) {
  clearWorkspaceButton.addEventListener('click', () => {
    logDebug('Clear workspace button clicked');
    if (noteEditor) {
      noteEditor.innerHTML = '';
      logDebug('Note editor cleared');
    }
    if (chatWindow) {
      chatWindow.innerHTML = '';
      logDebug('Chat window cleared');
      addChatMessage('assistant', 'Workspace reset. Start a new study session anytime.');
    }
  });
} else {
  logError('clearWorkspaceButton not found');
}

// ========== Splitter Handler ==========
function initSplitter() {
  if (!splitter) {
    logError('splitter element not found - cannot initialize resizer');
    return;
  }

  let isResizing = false;
  let startX = 0;
  let startWidth = leftPanel ? leftPanel.getBoundingClientRect().width : 400;

  splitter.addEventListener('mousedown', (event) => {
    isResizing = true;
    startX = event.clientX;
    startWidth = leftPanel ? leftPanel.getBoundingClientRect().width : 400;
    document.body.style.cursor = 'col-resize';
  });

  window.addEventListener('mousemove', (event) => {
    if (!isResizing || !leftPanel) return;
    const delta = event.clientX - startX;
    const newWidth = Math.max(280, Math.min(startWidth + delta, window.innerWidth - 360));
    leftPanel.style.width = `${newWidth}px`;
  });

  window.addEventListener('mouseup', () => {
    if (!isResizing) return;
    isResizing = false;
    document.body.style.cursor = '';
  });
}

initSplitter();

if (noteEditor) {
  noteEditor.dataset.placeholder = 'Start typing your study notes here. Use headings, highlight key ideas, and paste chapters for fast review.';
}

// Final validation on page load
window.addEventListener('load', () => {
  logDebug('Page fully loaded. Final validation:');
  logDebug('- chatWindow visible: ' + (chatWindow && chatWindow.offsetHeight > 0));
  logDebug('- chatForm attached: ' + (chatForm && chatForm.parentElement !== null));
  logDebug('- chatInput accessible: ' + (chatInput && chatInput.offsetHeight > 0));
  if (chatWindow && chatWindow.children.length > 0) {
    logDebug('- Initial messages in chat: ' + chatWindow.children.length);
  }
});
