const STORAGE_LIMIT = 250;
const INITIAL_BOOKS = [
    {
        id: 1,
        title: 'Quantum Mechanics Notes',
        subject: 'Physics',
        lastOpened: '2h ago',
        size: '3.4 MB',
        highlights: 24,
        bookmarks: 6,
        cover: '⚛️'
    },
    {
        id: 2,
        title: 'The Great Gatsby',
        subject: 'Literature',
        lastOpened: 'Yesterday',
        size: '1.8 MB',
        highlights: 12,
        bookmarks: 4,
        cover: '📘'
    }
];

const state = {
    books: JSON.parse(localStorage.getItem('quartz-backpack-books') || 'null') || INITIAL_BOOKS,
    selectedBook: null,
    pendingFile: null,
    pendingProgress: 0
};

const elements = {
    storageSummary: document.getElementById('storageSummary'),
    storageFill: document.getElementById('storageFill'),
    storageMessage: document.getElementById('storageMessage'),
    libraryGrid: document.getElementById('libraryGrid'),
    emptyState: document.getElementById('emptyState'),
    addBookBtn: document.getElementById('addBookBtn'),
    emptyUploadBtn: document.getElementById('emptyUploadBtn'),
    uploadModal: document.getElementById('uploadModal'),
    uploadDropzone: document.getElementById('uploadDropzone'),
    fileInput: document.getElementById('fileInput'),
    browseBtn: document.getElementById('browseBtn'),
    previewPanel: document.getElementById('previewPanel'),
    previewCover: document.getElementById('previewCover'),
    previewName: document.getElementById('previewName'),
    previewMeta: document.getElementById('previewMeta'),
    progressBar: document.getElementById('progressBar'),
    progressText: document.getElementById('progressText'),
    uploadBookBtn: document.getElementById('uploadBookBtn'),
    readerModal: document.getElementById('readerModal'),
    readerTitle: document.getElementById('readerTitle'),
    readerExcerpt: document.getElementById('readerExcerpt'),
    themeToggle: document.getElementById('themeToggleBtn')
};

function applyTheme(theme) {
    document.body.classList.toggle('light-theme', theme === 'light');
    if (elements.themeToggle) {
        elements.themeToggle.textContent = theme === 'light' ? '☀️' : '🌙';
        elements.themeToggle.setAttribute('aria-label', theme === 'light' ? 'Switch to normal mode' : 'Switch to light mode');
        elements.themeToggle.title = theme === 'light' ? 'Switch to normal mode' : 'Switch to light mode';
    }
}

function render() {
    const used = state.books.length;
    const percent = Math.min((used / STORAGE_LIMIT) * 100, 100);
    elements.storageSummary.textContent = `${used} / ${STORAGE_LIMIT} Books`;
    elements.storageFill.style.width = `${percent}%`;
    elements.storageMessage.textContent = `Books Used ${used} / ${STORAGE_LIMIT}`;

    if (used === 0) {
        elements.emptyState.hidden = false;
        elements.libraryGrid.innerHTML = '';
        return;
    }

    elements.emptyState.hidden = true;
    elements.libraryGrid.innerHTML = state.books.map((book) => `
        <article class="book-card" data-book-id="${book.id}">
            <button class="menu-btn" type="button" data-action="menu" aria-label="Open book menu">⋯</button>
            <div class="menu" data-menu="${book.id}">
                <button type="button" data-action="open">Open</button>
                <button type="button" data-action="rename">Rename</button>
                <button type="button" data-action="duplicate">Duplicate</button>
                <button type="button" data-action="move">Move</button>
                <button type="button" data-action="download">Download</button>
                <button type="button" data-action="delete">Delete</button>
            </div>
            <div class="book-cover">${book.cover}</div>
            <h3 class="book-title">${book.title}</h3>
            <div class="book-meta">
                <span>${book.subject}</span>
                <span>•</span>
                <span>${book.lastOpened}</span>
            </div>
            <div class="book-stats">
                <span>📄 ${book.size}</span>
                <span>✨ ${book.highlights}</span>
                <span>🔖 ${book.bookmarks}</span>
            </div>
        </article>
    `).join('');
}

function openModal() {
    if (state.books.length >= STORAGE_LIMIT) {
        alert('Backpack storage is full. Upgrade your plan to add more books.');
        return;
    }
    elements.uploadModal.classList.remove('hidden');
    elements.uploadModal.setAttribute('aria-hidden', 'false');
}

function closeModal() {
    elements.uploadModal.classList.add('hidden');
    elements.uploadModal.setAttribute('aria-hidden', 'true');
    elements.previewPanel.classList.add('hidden');
    elements.fileInput.value = '';
    state.pendingFile = null;
    state.pendingProgress = 0;
    elements.progressBar.style.width = '0%';
    elements.progressText.textContent = '0%';
}

function openReader(bookId) {
    const book = state.books.find((entry) => entry.id === bookId);
    if (!book) return;
    state.selectedBook = book;
    elements.readerTitle.textContent = book.title;
    elements.readerExcerpt.textContent = `You are now reading ${book.title}. This reader is ready for future AI highlights, notes, flashcards, and smart summaries.`;
    elements.readerModal.classList.remove('hidden');
    elements.readerModal.setAttribute('aria-hidden', 'false');
}

function closeReader() {
    elements.readerModal.classList.add('hidden');
    elements.readerModal.setAttribute('aria-hidden', 'true');
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function handleFileSelection(file) {
    if (!file) return;
    state.pendingFile = file;

    const fileName = file.name || 'Untitled Book';
    const fileExtension = fileName.split('.').pop()?.toUpperCase() || 'FILE';
    const coverSymbol = fileExtension === 'PDF' ? '📄' : fileExtension === 'EPUB' ? '📘' : fileExtension === 'DOCX' ? '📝' : '📚';
    const pages = file.size ? Math.max(12, Math.round(file.size / 250000)) : 12;

    elements.previewCover.textContent = coverSymbol;
    elements.previewName.textContent = fileName;
    elements.previewMeta.textContent = `${formatBytes(file.size)} • ${pages} pages`;
    elements.previewPanel.classList.remove('hidden');

    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
            clearInterval(interval);
            progress = 100;
        }
        state.pendingProgress = progress;
        elements.progressBar.style.width = `${progress}%`;
        elements.progressText.textContent = `${progress}%`;
    }, 120);
}

function formatBytes(size) {
    if (!size) return '0 KB';
    if (size < 1024) return `${size} B`;
    const kb = size / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
}

function addBook() {
    if (!state.pendingFile) return;
    const newBook = {
        id: Date.now(),
        title: state.pendingFile.name.replace(/\.[^/.]+$/, ''),
        subject: 'New Upload',
        lastOpened: 'Just added',
        size: formatBytes(state.pendingFile.size),
        highlights: 0,
        bookmarks: 0,
        cover: '📖'
    };
    state.books = [newBook, ...state.books];
    localStorage.setItem('quartz-backpack-books', JSON.stringify(state.books));
    closeModal();
    render();
}

function removeBook(bookId) {
    const book = state.books.find((entry) => entry.id === bookId);
    if (!book) return;
    const confirmed = window.confirm(`Delete ${book.title}?`);
    if (!confirmed) return;
    state.books = state.books.filter((entry) => entry.id !== bookId);
    localStorage.setItem('quartz-backpack-books', JSON.stringify(state.books));
    render();
}

function duplicateBook(bookId) {
    const book = state.books.find((entry) => entry.id === bookId);
    if (!book) return;
    const duplicate = { ...book, id: Date.now(), title: `${book.title} Copy` };
    state.books = [duplicate, ...state.books];
    localStorage.setItem('quartz-backpack-books', JSON.stringify(state.books));
    render();
}

function renameBook(bookId) {
    const book = state.books.find((entry) => entry.id === bookId);
    if (!book) return;
    const next = window.prompt('Rename this book', book.title);
    if (!next) return;
    book.title = next.trim() || book.title;
    localStorage.setItem('quartz-backpack-books', JSON.stringify(state.books));
    render();
}

function handleCardClick(event) {
    const card = event.target.closest('.book-card');
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!card) return;

    if (action === 'delete') {
        removeBook(Number(card.dataset.bookId));
        return;
    }

    if (action === 'duplicate') {
        duplicateBook(Number(card.dataset.bookId));
        return;
    }

    if (action === 'rename') {
        renameBook(Number(card.dataset.bookId));
        return;
    }

    if (action === 'menu') {
        const menu = card.querySelector('.menu');
        document.querySelectorAll('.menu.show').forEach((entry) => entry.classList.remove('show'));
        menu.classList.toggle('show');
        return;
    }

    if (action === 'open') {
        openReader(Number(card.dataset.bookId));
        return;
    }

    openReader(Number(card.dataset.bookId));
}

function bindEvents() {
    elements.themeToggle?.addEventListener('click', () => {
        const nextTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
        applyTheme(nextTheme);
        localStorage.setItem('quartz-theme', nextTheme);
    });

    const savedTheme = localStorage.getItem('quartz-theme');
    if (savedTheme === 'light') {
        applyTheme('light');
    } else {
        applyTheme('dark');
    }

    elements.addBookBtn.addEventListener('click', openModal);
    elements.emptyUploadBtn.addEventListener('click', openModal);
    document.querySelectorAll('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModal));
    elements.browseBtn.addEventListener('click', () => elements.fileInput.click());
    elements.fileInput.addEventListener('change', (event) => handleFileSelection(event.target.files[0]));

    elements.uploadDropzone.addEventListener('dragover', (event) => {
        event.preventDefault();
        elements.uploadDropzone.classList.add('dragover');
    });
    elements.uploadDropzone.addEventListener('dragleave', () => elements.uploadDropzone.classList.remove('dragover'));
    elements.uploadDropzone.addEventListener('drop', (event) => {
        event.preventDefault();
        elements.uploadDropzone.classList.remove('dragover');
        handleFileSelection(event.dataTransfer.files[0]);
    });
    elements.uploadBookBtn.addEventListener('click', addBook);

    elements.libraryGrid.addEventListener('click', handleCardClick);
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.menu') && !event.target.closest('.menu-btn')) {
            document.querySelectorAll('.menu.show').forEach((entry) => entry.classList.remove('show'));
        }
    });

    document.querySelectorAll('[data-close-reader]').forEach((button) => button.addEventListener('click', closeReader));
    document.querySelectorAll('[data-reader-action]').forEach((button) => {
        button.addEventListener('click', () => {
            const action = button.dataset.readerAction;
            if (action === 'bookmark') {
                window.alert('Bookmark saved for your next study session.');
            }
        });
    });
}

bindEvents();
render();
