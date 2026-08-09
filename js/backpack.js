const STORAGE_KEY = 'quartz-backpack-items';

const state = {
  items: [],
  filter: 'all',
  search: ''
};

const itemList = document.getElementById('itemList');
const form = document.getElementById('itemForm');
const searchInput = document.getElementById('searchInput');
const fileInput = document.getElementById('fileInput');
const filePreview = document.getElementById('filePreview');
const clearAllBtn = document.getElementById('clearAllBtn');
const addItemBtn = document.getElementById('addItemBtn');
const totalItems = document.getElementById('totalItems');
const notesCount = document.getElementById('notesCount');
const resourcesCount = document.getElementById('resourcesCount');
const filterChips = Array.from(document.querySelectorAll('.filter-chip'));

function loadItems() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    state.items = stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('Could not load backpack items', error);
    state.items = [];
  }
}

function saveItems() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
}

function renderItems() {
  const filteredItems = state.items.filter((item) => {
    const matchesFilter = state.filter === 'all' || item.category === state.filter;
    const query = state.search.toLowerCase();
    const matchesSearch = !query || [item.title, item.details, item.category, item.fileName || ''].join(' ').toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });

  if (!filteredItems.length) {
    itemList.innerHTML = '<div class="item-empty">No items yet. Add your first note or resource.</div>';
  } else {
    itemList.innerHTML = filteredItems.map((item) => `
      <article class="item-card">
        <h4>${item.title}</h4>
        <p>${item.details || 'No details added yet.'}</p>
        ${item.fileName ? `<p class="attachment-row"><strong>Attached:</strong> <button class="attachment-link" type="button" data-file-id="${item.id}">${item.fileName}</button></p>` : ''}
        <div class="item-meta">
          <span class="item-pill">${item.category}</span>
          <span>${new Date(item.createdAt).toLocaleDateString()}</span>
        </div>
      </article>
    `).join('');
  }

  itemList.querySelectorAll('.attachment-link').forEach((button) => {
    button.addEventListener('click', () => openAttachment(button.dataset.fileId));
  });

  totalItems.textContent = state.items.length;
  notesCount.textContent = state.items.filter((item) => item.category === 'notes').length;
  resourcesCount.textContent = state.items.filter((item) => item.category === 'resources').length;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Unable to read file'));
    reader.readAsDataURL(file);
  });
}

async function addItem(event) {
  event.preventDefault();
  const title = document.getElementById('titleInput').value.trim();
  const category = document.getElementById('categorySelect').value;
  const details = document.getElementById('detailsInput').value.trim();
  const selectedFile = fileInput?.files?.[0];

  if (!title) return;

  const newItem = {
    id: Date.now().toString(),
    title,
    category,
    details,
    createdAt: new Date().toISOString()
  };

  if (selectedFile) {
    try {
      const fileData = await readFileAsDataUrl(selectedFile);
      newItem.fileName = selectedFile.name;
      newItem.fileType = selectedFile.type;
      newItem.fileSize = selectedFile.size;
      newItem.fileData = fileData;
    } catch (error) {
      console.warn('Could not read selected file', error);
      newItem.fileName = selectedFile.name;
      newItem.fileType = selectedFile.type;
      newItem.fileSize = selectedFile.size;
    }
  }

  state.items.unshift(newItem);

  saveItems();
  form.reset();
  filePreview.textContent = '';
  renderItems();
}

function clearAll() {
  state.items = [];
  saveItems();
  renderItems();
}

function setFilter(filter) {
  state.filter = filter;
  filterChips.forEach((chip) => chip.classList.toggle('active', chip.dataset.filter === filter));
  renderItems();
}

function handleSearch(event) {
  state.search = event.target.value;
  renderItems();
}

function handleFileSelection() {
  const selectedFile = fileInput?.files?.[0];
  filePreview.textContent = selectedFile ? `Selected: ${selectedFile.name}` : '';
}

function openAttachment(fileId) {
  const item = state.items.find((entry) => entry.id === fileId);
  if (!item?.fileData) {
    filePreview.textContent = 'This file could not be opened.';
    return;
  }

  window.open(item.fileData, '_blank', 'noopener,noreferrer');
}

loadItems();
renderItems();

form?.addEventListener('submit', addItem);
clearAllBtn?.addEventListener('click', clearAll);
searchInput?.addEventListener('input', handleSearch);
fileInput?.addEventListener('change', handleFileSelection);
addItemBtn?.addEventListener('click', () => document.getElementById('titleInput')?.focus());
filterChips.forEach((chip) => chip.addEventListener('click', () => setFilter(chip.dataset.filter)));
