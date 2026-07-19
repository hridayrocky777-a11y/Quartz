(function () {
  // Initialize the shared onboarding modal for Quartz entry pages.
  const academicProfileButton = document.getElementById('academicProfileButton');
  const academicProfileButtonLabel = document.getElementById('academicProfileButtonLabel');
  const academicProfileModal = document.getElementById('academicProfileModal');
  const academicProfileCloseButton = academicProfileModal?.querySelector('.modal-close');
  const academicProfileBackdrop = academicProfileModal?.querySelector('.modal-backdrop');
  const classOptionsContainer = document.getElementById('classOptions');
  const boardOptionsContainer = document.getElementById('boardOptions');
  const saveAcademicProfileButton = document.getElementById('saveAcademicProfile');
  const academicToast = document.getElementById('academicToast');
  const state = { selectedClass: null, selectedBoard: null };

  function getStoredProfile() {
    return AcademicProfile.readProfile(window.localStorage);
  }

  function renderProfileButton(profile) {
    if (academicProfileButtonLabel) {
      academicProfileButtonLabel.textContent = AcademicProfile.getButtonLabel(profile);
    }
  }

  function showToast(message) {
    if (!academicToast) return;
    academicToast.textContent = message;
    academicToast.classList.add('is-visible');
    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
      academicToast.classList.remove('is-visible');
    }, 2200);
  }

  function canDismissModal() {
    const storedProfile = getStoredProfile();
    const hasSavedProfile = Boolean(storedProfile.class && storedProfile.board);
    const selectionComplete = Boolean(state.selectedClass && state.selectedBoard);
    return hasSavedProfile || selectionComplete;
  }

  function closeModal() {
    if (!academicProfileModal) return;
    if (!canDismissModal()) {
      showToast('Please choose your class and board to continue.');
      return;
    }
    academicProfileModal.classList.remove('is-open');
    academicProfileModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  function openModal(force = false) {
    if (!academicProfileModal) return;
    const profile = getStoredProfile();
    if (!force && profile.class && profile.board) {
      state.selectedClass = profile.class;
      state.selectedBoard = profile.board;
    }
    populateOptions(profile);
    academicProfileModal.classList.add('is-open');
    academicProfileModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function populateOptions(profile = getStoredProfile()) {
    const normalizedProfile = AcademicProfile.normalizeProfile(profile);
    state.selectedClass = normalizedProfile.class || state.selectedClass;
    state.selectedBoard = normalizedProfile.board || state.selectedBoard;

    if (classOptionsContainer) {
      classOptionsContainer.innerHTML = AcademicProfile.CLASSES.map((value) => {
        const selected = state.selectedClass === value ? 'is-selected' : '';
        return `<button class="option-chip ${selected}" type="button" data-class="${value}">${AcademicProfile.getClassLabel(value)}</button>`;
      }).join('');
    }

    if (boardOptionsContainer) {
      boardOptionsContainer.innerHTML = AcademicProfile.BOARDS.map((value) => {
        const selected = state.selectedBoard === value ? 'is-selected' : '';
        return `<button class="board-card ${selected}" type="button" data-board="${value}">${value}</button>`;
      }).join('');
    }
  }

  function attachEvents() {
    academicProfileButton?.addEventListener('click', () => openModal(true));
    academicProfileCloseButton?.addEventListener('click', closeModal);
    academicProfileBackdrop?.addEventListener('click', closeModal);

    classOptionsContainer?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-class]');
      if (!button) return;
      state.selectedClass = button.getAttribute('data-class');
      populateOptions({ class: state.selectedClass, board: state.selectedBoard });
    });

    boardOptionsContainer?.addEventListener('click', (event) => {
      const button = event.target.closest('[data-board]');
      if (!button) return;
      state.selectedBoard = button.getAttribute('data-board');
      populateOptions({ class: state.selectedClass, board: state.selectedBoard });
    });

    saveAcademicProfileButton?.addEventListener('click', () => {
      const profile = { class: state.selectedClass, board: state.selectedBoard };
      if (!profile.class || !profile.board) {
        showToast('Please choose your class and board before saving.');
        return;
      }
      AcademicProfile.writeProfile(profile);
      renderProfileButton(profile);
      closeModal();
      showToast('Academic profile updated successfully.');
    });
  }

  function init() {
    const profile = getStoredProfile();
    renderProfileButton(profile);
    attachEvents();
    if (!profile.class || !profile.board) {
      openModal(true);
    }
  }

  init();
})();
