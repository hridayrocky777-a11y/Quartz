(function () {
  const STORAGE_KEY = 'quartz-academic-profile';
  const classes = [
    { value: 'class-1', label: 'Class 1', detail: 'Early learning' },
    { value: 'class-2', label: 'Class 2', detail: 'Building basics' },
    { value: 'class-3', label: 'Class 3', detail: 'Growing confidence' },
    { value: 'class-4', label: 'Class 4', detail: 'Core concepts' },
    { value: 'class-5', label: 'Class 5', detail: 'Stronger foundations' },
    { value: 'class-6', label: 'Class 6', detail: 'New challenges' },
    { value: 'class-7', label: 'Class 7', detail: 'Academic growth' },
    { value: 'class-8', label: 'Class 8', detail: 'Skill building' },
    { value: 'class-9', label: 'Class 9', detail: 'Foundation year' },
    { value: 'class-10', label: 'Class 10', detail: 'Board exams prep' },
    { value: 'class-11', label: 'Class 11', detail: 'Science / Commerce / Arts' },
    { value: 'class-12', label: 'Class 12', detail: 'Career-focused preparation' }
  ];

  const boards = [
    { value: 'cbse', label: 'CBSE', detail: 'Structured curriculum' },
    { value: 'icse', label: 'ICSE', detail: 'English-heavy learning' },
    { value: 'state', label: 'State Board', detail: 'Regional syllabus' },
    { value: 'neet-jee', label: 'JEE / NEET Prep', detail: 'Competitive edge' }
  ];

  const state = {
    selectedClass: null,
    selectedBoard: null
  };

  function init() {
    if (window.AcademicProfileInitialized) return;
    window.AcademicProfileInitialized = true;

    const trigger = document.getElementById('academicProfileButton');
    const modal = document.getElementById('academicProfileModal');
    const closeBtn = modal?.querySelector('.modal-close');
    const backdrop = modal?.querySelector('.modal-backdrop');
    const saveBtn = document.getElementById('saveAcademicProfile');
    const classOptions = document.getElementById('classOptions');
    const boardOptions = document.getElementById('boardOptions');
    const toast = document.getElementById('academicToast');

    if (!trigger || !modal || !classOptions || !boardOptions || !saveBtn || !toast) return;

    renderOptions(classOptions, classes, 'class');
    renderOptions(boardOptions, boards, 'board');
    hydrateSelection();

    trigger.addEventListener('click', () => openModal(modal));
    closeBtn?.addEventListener('click', () => closeModal(modal));
    backdrop?.addEventListener('click', () => closeModal(modal));

    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeModal(modal);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeModal(modal);
    });

    saveBtn.addEventListener('click', () => {
      if (!state.selectedClass || !state.selectedBoard) {
        showToast(toast, 'Choose both your class and board to continue.');
        return;
      }

      const profile = {
        selectedClass: state.selectedClass,
        selectedBoard: state.selectedBoard
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      updateTriggerLabel(trigger, profile);
      showToast(toast, 'Academic profile saved successfully.');
      closeModal(modal);
    });

    const savedProfile = loadProfile();
    if (savedProfile) {
      state.selectedClass = savedProfile.selectedClass;
      state.selectedBoard = savedProfile.selectedBoard;
      updateTriggerLabel(trigger, savedProfile);
      setActiveSelection(classOptions, state.selectedClass, 'class');
      setActiveSelection(boardOptions, state.selectedBoard, 'board');
    } else {
      setTimeout(() => openModal(modal), 250);
    }
  }

  function renderOptions(container, options, type) {
    container.innerHTML = options.map((option) => `
      <button
        class="option-chip"
        type="button"
        data-type="${type}"
        data-value="${option.value}"
      >
        <strong>${option.label}</strong>
        <span>${option.detail}</span>
      </button>
    `).join('');

    container.querySelectorAll('.option-chip').forEach((button) => {
      button.addEventListener('click', () => {
        const { type, value } = button.dataset;
        if (type === 'class') {
          state.selectedClass = value;
        } else {
          state.selectedBoard = value;
        }
        setActiveSelection(container, value, type);
        if (type === 'class') {
          const boardContainer = document.getElementById('boardOptions');
          setActiveSelection(boardContainer, state.selectedBoard, 'board');
        } else {
          const classContainer = document.getElementById('classOptions');
          setActiveSelection(classContainer, state.selectedClass, 'class');
        }
      });
    });
  }

  function setActiveSelection(container, value, type) {
    if (!container) return;
    container.querySelectorAll('.option-chip').forEach((button) => {
      const isSelected = button.dataset.value === value;
      button.classList.toggle('is-selected', isSelected);
      button.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
    });
  }

  function hydrateSelection() {
    const profile = loadProfile();
    if (!profile) return;
    state.selectedClass = profile.selectedClass;
    state.selectedBoard = profile.selectedBoard;
  }

  function loadProfile() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Could not load academic profile', error);
      return null;
    }
  }

  function openModal(modal) {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    const firstButton = modal.querySelector('.option-chip');
    firstButton?.focus();
  }

  function closeModal(modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
  }

  function updateTriggerLabel(trigger, profile) {
    const classLabel = getLabel(profile.selectedClass, classes);
    const boardLabel = getLabel(profile.selectedBoard, boards);
    trigger.innerHTML = `<span class="trigger-icon">📚</span><span id="academicProfileButtonLabel">${classLabel} • ${boardLabel}</span>`;
  }

  function getLabel(value, items) {
    const match = items.find((item) => item.value === value);
    return match ? match.label : 'Select Class';
  }

  function showToast(toast, message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(showToast.timeoutId);
    showToast.timeoutId = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, 2200);
  }

  window.AcademicProfile = { init };
  document.addEventListener('DOMContentLoaded', init);
})();
