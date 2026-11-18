
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const sendButton = document.getElementById("sendButton");
const messageList = document.getElementById("messageList");
const conversation = document.getElementById("conversation");
const welcomeState = document.getElementById("welcomeState");
const newChatButton = document.getElementById("newChatButton");
const recentChats = document.getElementById("recentChats");
const suggestionButtons = document.querySelectorAll("[data-prompt]");

const chatApiUrl = "https://quartz-1.onrender.com/api/chat";

let messages = [];
let isLoading = false;

const STORAGE_KEY = "quartz_recent_chats";

function getSavedChats() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveChats(chats) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

function escapeHTML(text) {
    return String(text).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}

function renderMarkdown(text) {
    if (window.marked && window.DOMPurify) {
        const html = window.marked.parse(text);
        return window.DOMPurify.sanitize(html);
    }

    return escapeHTML(text).replace(/\n/g, "<br>");
}

function addMessage(role, content) {
    const message = document.createElement("div");

    message.className = `message ${role}-message`;

    const label = document.createElement("div");
    label.className = "message-label";
    label.textContent = role === "user" ? "You" : "Quartz AI";

    const body = document.createElement("div");
    body.className = "message-content";
    body.innerHTML = renderMarkdown(content);

    message.appendChild(label);
    message.appendChild(body);

    messageList.appendChild(message);

    if (window.renderMathInElement) {
        renderMathInElement(body, {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "$", right: "$", display: false },
                { left: "\\(", right: "\\)", display: false },
                { left: "\\[", right: "\\]", display: true }
            ],
            throwOnError: false
        });
    }

    conversation.scrollTop = conversation.scrollHeight;
}

function showTyping() {
    const typing = document.createElement("div");

    typing.id = "typingIndicator";
    typing.className = "message assistant-message";
    typing.textContent = "Quartz AI is thinking...";

    messageList.appendChild(typing);
    conversation.scrollTop = conversation.scrollHeight;
}

function removeTyping() {
    document.getElementById("typingIndicator")?.remove();
}

function renderRecentChats() {
    const chats = getSavedChats();

    recentChats.innerHTML = "";

    chats.slice(0, 10).forEach((chat, index) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "recent-chat-item";
        button.textContent = chat.title || "New conversation";

        button.addEventListener("click", () => {
            loadChat(index);
        });

        recentChats.appendChild(button);
    });
}

function saveCurrentChat() {
    if (messages.length === 0) return;

    const chats = getSavedChats();

    const title = messages[0].content.slice(0, 35);

    const currentChat = {
        title,
        messages,
        updatedAt: Date.now()
    };

    chats.unshift(currentChat);

    saveChats(chats.slice(0, 10));
    renderRecentChats();
}

function loadChat(index) {
    const chats = getSavedChats();
    const selectedChat = chats[index];

    if (!selectedChat) return;

    messages = selectedChat.messages || [];

    messageList.innerHTML = "";
    welcomeState.style.display = "none";

    messages.forEach(message => {
        addMessage(message.role, message.content);
    });
}

function startNewChat() {
    if (messages.length > 0) {
        saveCurrentChat();
    }

    messages = [];
    messageList.innerHTML = "";
    welcomeState.style.display = "";

    chatInput.value = "";
    chatInput.focus();
}

async function requestReply(userMessage) {
    const response = await fetch(chatApiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message: userMessage
        })
    });

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
        throw new Error(
            data.error || data.message || `Server error: ${response.status}`
        );
    }

    if (typeof data.reply !== "string" || !data.reply.trim()) {
        throw new Error("Quartz received an empty reply.");
    }

    return data.reply.trim();
}

async function sendMessage(text) {
    const userMessage = text.trim();

    if (!userMessage || isLoading) return;

    isLoading = true;
    sendButton.disabled = true;

    welcomeState.style.display = "none";

    messages.push({
        role: "user",
        content: userMessage
    });

    addMessage("user", userMessage);

    chatInput.value = "";
    showTyping();

    try {
        const reply = await requestReply(userMessage);

        removeTyping();

        messages.push({
            role: "assistant",
            content: reply
        });

        addMessage("assistant", reply);

        saveCurrentChat();

    } catch (error) {
        removeTyping();

        console.error("Quartz chat error:", error);

        addMessage(
            "assistant",
            `Sorry, I couldn't connect to Quartz AI.\n\n${error.message}\n\nPlease try again.`
        );

    } finally {
        isLoading = false;
        sendButton.disabled = false;
        chatInput.focus();
    }
}

chatForm.addEventListener("submit", event => {
    event.preventDefault();
    sendMessage(chatInput.value);
});

chatInput.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        chatForm.requestSubmit();
    }
});

newChatButton.addEventListener("click", startNewChat);

suggestionButtons.forEach(button => {
    button.addEventListener("click", () => {
        sendMessage(button.dataset.prompt);
    });
});

renderRecentChats();
chatInput.focus();
