const noteEditor = document.getElementById('noteEditor');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatWindow = document.getElementById('chatWindow');
const sendButton = document.getElementById('sendButton');
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


if (typeof supabaseClient === 'undefined' || !supabaseClient) {
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
  return noteEditor ? noteEditor.innerText.trim() : '';
}

async function callGeminiAPI(userMessage) {
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
    let errorMessage = `Request failed (${response.status}).`;
    try {
      const errorData = await response.json();
      if (typeof errorData?.error === 'string' && errorData.error.trim()) {
        errorMessage = errorData.error;
      }
    } catch (error) {
      // Keep the generic status message when the server response is not JSON.
    }
    throw new Error(errorMessage);
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error('The server returned an invalid response.');
  }

  if (typeof data?.message !== 'string' || !data.message.trim()) {
    throw new Error('The AI returned an invalid response.');
  }
  return data.message.trim();
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

if (chatForm) {
  chatForm.addEventListener('submit', async (event) => {
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

    if (sendButton) {
      sendButton.disabled = true;
      sendButton.textContent = 'Thinking...';
    }

    try {
      logDebug('Sending prompt to Gemini backend...');
      const reply = await callGeminiAPI(prompt);
      addChatMessage('assistant', reply);
    } catch (error) {
      logError('Error requesting AI reply:', error);
      const message = error instanceof TypeError
        ? 'Unable to reach the AI server. Make sure Quartz backend is running.'
        : error.message || 'The AI could not answer right now.';
      addChatMessage('assistant', message);
    } finally {
      if (sendButton) {
        sendButton.disabled = false;
        sendButton.textContent = 'Send';
      }
    }
  });
} else {
  logError('chatForm not found - cannot attach submit listener!');
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
