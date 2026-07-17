// Chat page behavior for Notes Maker and Quartz AI
const notesEditor = document.getElementById('notesEditor');
const toolbarButtons = document.querySelectorAll('.toolbar-btn');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const newChatButtons = document.querySelectorAll('.new-chat-btn');

// Color picker for text color
const colorPicker = document.createElement('input');
colorPicker.type = 'color';
colorPicker.style.position = 'absolute';
colorPicker.style.left = '-9999px';
document.body.appendChild(colorPicker);

function initEditor() {
  const stored = localStorage.getItem('quartz-note-v1');
  if (stored) notesEditor.innerHTML = stored;

  notesEditor.addEventListener('input', () => {
    localStorage.setItem('quartz-note-v1', notesEditor.innerHTML);
  });

  toolbarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.command;
      const action = btn.dataset.action;
      const val = btn.dataset.value || null;

      if (action === 'highlight') {
        document.execCommand('hiliteColor', false, '#fff176');
      } else if (action === 'text-color') {
        colorPicker.click();
        colorPicker.onchange = () => {
          document.execCommand('foreColor', false, colorPicker.value);
          notesEditor.focus();
          localStorage.setItem('quartz-note-v1', notesEditor.innerHTML);
        };
      } else if (cmd === 'formatBlock' && val) {
        document.execCommand(cmd, false, `<${val}>`);
      } else {
        document.execCommand(cmd, false, null);
      }

      notesEditor.focus();
    });
  });
}

// Simple markdown renderer for display in chat bubbles
function escapeHtml(text){
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderMarkdown(text){
  const html = escapeHtml(text)
    .replace(/```([\w-]*)\n([\s\S]*?)```/g, (_,lang,code)=>`<pre><code class="language-${lang||'txt'}">${escapeHtml(code)}</code></pre>`)
    .replace(/`([^`]+)`/g,'<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g,'<em>$1</em>');

  return html.split(/\n{2,}/).map(block=>{
    if (block.startsWith('- ')){
      const items = block.split('\n').map(i=>`<li>${i.replace('- ','')}</li>`).join('');
      return `<ul>${items}</ul>`;
    }
    if (/^\d+\. /.test(block)){
      const items = block.split('\n').map(i=>`<li>${i.replace(/^\d+\. /,'')}</li>`).join('');
      return `<ol>${items}</ol>`;
    }
    return `<p>${block.replace(/\n/g,'<br>')}</p>`;
  }).join('');
}

function appendMessage(role, content){
  const row = document.createElement('div');
  row.className = `message-row ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';

  const meta = document.createElement('div');
  meta.className = 'message-meta';
  meta.innerHTML = `<span>${role==='user'?'You':'Quartz AI'}</span>`;

  if (role==='ai'){
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copy';
    copyBtn.addEventListener('click', ()=>{
      navigator.clipboard.writeText(content).then(()=>{
        alert('Copied');
      });
    });
    meta.appendChild(copyBtn);
  }

  bubble.appendChild(meta);
  bubble.insertAdjacentHTML('beforeend', renderMarkdown(content));
  row.appendChild(bubble);
  chatMessages.appendChild(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage(){
  const v = chatInput.value.trim();
  if (!v) return;

  appendMessage('user', v);
  chatInput.value = '';
  chatInput.style.height = 'auto';
  typingIndicator.hidden = false;
  chatMessages.scrollTop = chatMessages.scrollHeight;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: v })
    });

    const data = await response.json();
    typingIndicator.hidden = true;

    if (!response.ok) {
      appendMessage('ai', `Error: ${data.error || 'Request failed.'}`);
      return;
    }

    appendMessage('ai', data.reply || 'No response received.');
  } catch (error) {
    typingIndicator.hidden = true;
    appendMessage('ai', `Error: ${error.message || 'Unable to contact the AI service.'}`);
  }
}

function resetConversation(){
  chatMessages.innerHTML = '';
  appendMessage('ai', 'Welcome to Quartz AI — try asking for a summary or study plan.');
}

function initChat(){
  resetConversation();

  chatInput.addEventListener('keydown', (e)=>{
    if (e.key==='Enter' && !e.shiftKey){
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener('click', sendMessage);

  newChatButtons.forEach(b=>b.addEventListener('click', ()=>{
    resetConversation();
  }));

  // auto-expand input
  chatInput.addEventListener('input', ()=>{
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight,180)+'px';
  });
}

// Initialize
initEditor();
initChat();
