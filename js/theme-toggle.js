(function () {
  const STORAGE_KEY = 'quartz-theme';
  const buttons = Array.from(document.querySelectorAll('.theme-toggle-btn'));

  function applyTheme(theme) {
    const isLight = theme === 'light';
    document.body.classList.toggle('light-theme', isLight);
    document.body.dataset.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;

    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      button.title = isLight ? 'Switch to dark mode' : 'Switch to light mode';

      const icon = button.querySelector('svg');
      if (!icon) return;

      if (isLight) {
        icon.innerHTML = `
          <path d="M12 3v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M12 19v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M4.22 4.22l1.42 1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M18.36 18.36l1.42 1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M3 12h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M19 12h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M4.22 19.78l1.42-1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          <circle cx="12" cy="12" r="4.5" fill="currentColor"/>
        `;
      } else {
        icon.innerHTML = `
          <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="1.8" fill="none"></circle>
          <path d="M12 1v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
          <path d="M12 21v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
          <path d="M4.22 4.22l1.42 1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
          <path d="M18.36 18.36l1.42 1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
          <path d="M1 12h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
          <path d="M21 12h2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
          <path d="M4.22 19.78l1.42-1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
          <path d="M18.36 5.64l1.42-1.42" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
        `;
      }
    });
  }

  function toggleTheme() {
    const nextTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
  }

  function init() {
    const savedTheme = localStorage.getItem(STORAGE_KEY) || 'dark';
    applyTheme(savedTheme);
    buttons.forEach((button) => button.addEventListener('click', toggleTheme));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
