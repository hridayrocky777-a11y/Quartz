(function (global) {
  // Shared academic profile helpers for Quartz onboarding and persistence.
  const STORAGE_KEY = 'quartz-academic-profile';
  const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const BOARDS = ['CBSE', 'ICSE'];

  function createDefaultProfile() {
    return { class: null, board: null };
  }

  function normalizeProfile(profile) {
    const base = createDefaultProfile();
    const candidate = profile && typeof profile === 'object' ? profile : {};
    return {
      class: CLASSES.includes(candidate.class) ? candidate.class : base.class,
      board: BOARDS.includes(candidate.board) ? candidate.board : base.board,
    };
  }

  function readProfile(storage = global.localStorage) {
    if (!storage) return createDefaultProfile();

    try {
      const raw = storage.getItem(STORAGE_KEY);
      if (!raw) return createDefaultProfile();
      return normalizeProfile(JSON.parse(raw));
    } catch (error) {
      console.warn('Unable to read academic profile:', error);
      return createDefaultProfile();
    }
  }

  function writeProfile(profile, storage = global.localStorage) {
    if (!storage) return;
    storage.setItem(STORAGE_KEY, JSON.stringify(normalizeProfile(profile)));
  }

  function getButtonLabel(profile) {
    const normalized = normalizeProfile(profile);
    if (!normalized.class || !normalized.board) {
      return '📚 Select Class';
    }
    return `📚 Class ${normalized.class} • ${normalized.board}`;
  }

  function getClassLabel(classValue) {
    return `Class ${classValue}`;
  }

  const api = {
    STORAGE_KEY,
    CLASSES,
    BOARDS,
    createDefaultProfile,
    normalizeProfile,
    readProfile,
    writeProfile,
    getButtonLabel,
    getClassLabel,
  };

  global.AcademicProfile = api;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
