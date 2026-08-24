const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendButton');
const messageList = document.getElementById('messageList');
const conversation = document.getElementById('conversation');
const welcomeState = document.getElementById('welcomeState');
const newChatButton = document.getElementById('newChatButton');
const recentChats = document.getElementById('recentChats');
const suggestionButtons = document.querySelectorAll('[data-prompt]');
const chatApiUrl = window.location.port === '3000'
    ? '/api/chat'
    : 'http://localhost:3000/api/chat';

const state = {
    messages: [],
    recentTitles: JSON.parse(sessionStorage.getItem('quartz-chat-titles') || '[]'),
    loading: false,
};

function addMessage(role, text, isError = false) {
    const message = document.createElement('article');
    message.className = `message ${role}${isError ? ' error' : ''}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = role === 'user' ? 'ME' : 'QZ';
    avatar.setAttribute('aria-hidden', 'true');

    const content = document.createElement('div');
    const meta = document.createElement('p');
    meta.className = 'message-meta';
    meta.textContent = role === 'user' ? 'You' : 'Quartz AI';
    const messageText = document.createElement(role === 'assistant' ? 'div' : 'p');
    messageText.className = 'message-text';
    if (role === 'assistant') {
        messageText.innerHTML = renderAssistantMarkdown(text);
    } else {
        messageText.textContent = text;
    }

    content.append(meta, messageText);
    message.append(avatar, content);
    messageList.appendChild(message);
    conversation.scrollTop = conversation.scrollHeight;
}

function renderAssistantMarkdown(text) {
    if (typeof marked === 'undefined' || typeof DOMPurify === 'undefined') {
        const fallback = document.createElement('p');
        fallback.textContent = text;
        return fallback.outerHTML;
    }

    const markdownHtml = marked.parse(text, { breaks: true, gfm: true });
    const safeHtml = DOMPurify.sanitize(markdownHtml);
    const rendered = document.createElement('div');
    rendered.innerHTML = safeHtml;

    if (typeof renderMathInElement === 'function') {
        renderMathInElement(rendered, {
            delimiters: [
                { left: '$$', right: '$$', display: true },
                { left: '\\[', right: '\\]', display: true },
                { left: '$', right: '$', display: false },
                { left: '\\(', right: '\\)', display: false },
            ],
            throwOnError: false,
        });
    }

    return rendered.innerHTML;
}

function showTyping() {
    const typing = document.createElement('article');
    typing.className = 'message';
    typing.id = 'typingMessage';
    typing.innerHTML = '<div class="message-avatar" aria-hidden="true">QZ</div><div><p class="message-meta">Quartz AI</p><div class="typing" aria-label="Quartz AI is thinking"><span></span><span></span><span></span></div></div>';
    messageList.appendChild(typing);
    conversation.scrollTop = conversation.scrollHeight;
}

function removeTyping() {
    document.getElementById('typingMessage')?.remove();
}

function setLoading(loading) {
    state.loading = loading;
    sendButton.disabled = loading;
    chatInput.disabled = loading;
    sendButton.setAttribute('aria-busy', String(loading));
    if (loading) showTyping(); else removeTyping();
}

function renderRecentChats() {
    recentChats.replaceChildren();
    if (!state.recentTitles.length) {
        const empty = document.createElement('p');
        empty.className = 'recent-chat empty';
        empty.textContent = 'No chats yet';
        recentChats.appendChild(empty);
        return;
    }
    state.recentTitles.slice(0, 5).forEach((title) => {
        const item = document.createElement('button');
        item.className = 'recent-chat';
        item.type = 'button';
        item.textContent = title;
        item.title = title;
        item.addEventListener('click', () => chatInput.focus());
        recentChats.appendChild(item);
    });
}

function rememberChat(title) {
    state.recentTitles = [title, ...state.recentTitles.filter((item) => item !== title)].slice(0, 5);
    sessionStorage.setItem('quartz-chat-titles', JSON.stringify(state.recentTitles));
    renderRecentChats();
}

async function requestReply(userMessage) {
    const response = await fetch(chatApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage }),
    });

    let data;
    try {
        data = await response.json();
    } catch (error) {
        throw new Error('The server returned an invalid response.');
    }

    if (!response.ok) {
        throw new Error(typeof data?.error === 'string' ? data.error : 'Quartz could not answer right now.');
    }
    if (typeof data?.message !== 'string' || !data.message.trim()) {
        throw new Error('The AI returned an invalid response.');
    }
    return data.message.trim();
}

async function sendMessage(text) {
    const userMessage = text.trim();
    if (!userMessage || state.loading) return;

    welcomeState.hidden = true;
    addMessage('user', userMessage);
    state.messages.push({ role: 'user', text: userMessage });
    rememberChat(userMessage);
    chatInput.value = '';
    chatInput.style.height = 'auto';
    setLoading(true);

    try {
        const reply = await requestReply(userMessage);
        addMessage('assistant', reply);
        state.messages.push({ role: 'assistant', text: reply });
    } catch (error) {
        const message = error instanceof TypeError
            ? 'I could not reach the Quartz server. Please make sure the backend is running.'
            : error.message || 'Something went wrong. Please try again.';
        addMessage('assistant', message, true);
    } finally {
        setLoading(false);
        chatInput.focus();
    }
}

function resetChat() {
    state.messages = [];
    messageList.replaceChildren();
    welcomeState.hidden = false;
    chatInput.value = '';
    chatInput.style.height = 'auto';
    chatInput.focus();
}

chatForm.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage(chatInput.value);
});

chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        chatForm.requestSubmit();
    }
});

chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = `${Math.min(chatInput.scrollHeight, 160)}px`;
});

suggestionButtons.forEach((button) => {
    button.addEventListener('click', () => sendMessage(button.dataset.prompt));
});

newChatButton.addEventListener('click', resetChat);
renderRecentChats();
chatInput.focus();
