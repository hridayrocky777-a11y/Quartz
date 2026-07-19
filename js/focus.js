/*
  Quartz Focus
  Premium, modular focus experience with a flip clock, progress ring, notes,
  ambient audio controls, and session completion rewards.
*/

const state = {
  duration: 25 * 60,
  remaining: 25 * 60,
  running: false,
  completed: false,
  focusMode: false,
  selectedSound: 'rain',
  volume: 0.6,
  muted: false,
  points: 0,
  completedSessions: 4,
  longestSession: 60,
  streak: 7,
  notes: '',
  sessionName: 'Physics',
  sessionTopic: 'Chapter 6 - Light',
  weeklyHours: [80, 120, 45, 180, 130, 60, 40],
  timerInterval: null,
  audio: null,
};

const clockEl = document.getElementById('flipClock');
const progressRing = document.getElementById('progressRing');
const progressBarFill = document.getElementById('progressBarFill');
const statusPill = document.getElementById('statusPill');
const subjectInput = document.getElementById('subjectInput');
const topicInput = document.getElementById('topicInput');
const sessionSummary = document.getElementById('sessionSummary');
const completionOverlay = document.getElementById('completionOverlay');
const rewardPopup = document.getElementById('rewardPopup');
const notesInput = document.getElementById('notesInput');
const pointsDisplay = document.getElementById('pointsDisplay');
const todayHours = document.getElementById('todayHours');
const completedSessionsEl = document.getElementById('completedSessions');
const longestSessionEl = document.getElementById('longestSession');
const streakDisplay = document.getElementById('streakDisplay');
const weekBars = document.getElementById('weekBars');
const soundGrid = document.getElementById('soundGrid');
const volumeSlider = document.getElementById('volumeSlider');
const muteButton = document.getElementById('muteButton');
const durationButtons = Array.from(document.querySelectorAll('.duration-btn'));
const controlButtons = Array.from(document.querySelectorAll('.control-btn'));
const soundChoices = [
  { id: 'rain', label: '🌧 Rain', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: 'ocean', label: '🌊 Ocean', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { id: 'library', label: '📚 Library', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { id: 'fireplace', label: '🔥 Fireplace', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { id: 'night', label: '🌙 Night', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { id: 'noise', label: '🎵 White Noise', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
];

function initialize() {
  renderWeeklyBars();
  renderSoundChoices();
  attachEvents();
  syncDisplay();
  restoreNotes();
  updateProgressUI();
  updateStats();
}

function attachEvents() {
  durationButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      durationButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      if (btn.dataset.duration === 'custom') {
        const customMinutes = Number(prompt('Enter a custom duration in minutes', '25'));
        if (!Number.isNaN(customMinutes) && customMinutes > 0) {
          state.duration = customMinutes * 60;
          state.remaining = customMinutes * 60;
        }
      } else {
        state.duration = Number(btn.dataset.duration) * 60;
        state.remaining = state.duration;
      }
      state.running = false;
      state.completed = false;
      completionOverlay.hidden = true;
      document.body.classList.remove('focus-mode');
      syncDisplay();
      updateStatus('Ready');
    });
  });

  controlButtons.forEach((btn) => {
    btn.addEventListener('click', () => handleControl(btn.dataset.action));
  });

  subjectInput.addEventListener('input', updateSessionSummary);
  topicInput.addEventListener('input', updateSessionSummary);

  notesInput.addEventListener('input', () => {
    state.notes = notesInput.value;
    localStorage.setItem('quartz-focus-notes', notesInput.value);
  });

  volumeSlider.addEventListener('input', (event) => {
    state.volume = Number(event.target.value) / 100;
    state.muted = false;
    if (state.audio) {
      state.audio.volume = state.volume;
    }
    updateMuteLabel();
  });

  muteButton.addEventListener('click', () => {
    state.muted = !state.muted;
    if (state.audio) {
      state.audio.muted = state.muted;
    }
    updateMuteLabel();
  });

  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      event.preventDefault();
      if (state.running) {
        pauseTimer();
      } else {
        startTimer();
      }
    }

    if (event.key.toLowerCase() === 'r') {
      resetTimer();
    }

    if (event.key === 'Escape') {
      state.focusMode = false;
      document.body.classList.remove('focus-mode');
      updateStatus('Focus mode exited');
    }
  });
}

function handleControl(action) {
  if (action === 'start') startTimer();
  if (action === 'pause') pauseTimer();
  if (action === 'end') endSession();
  if (action === 'reset') resetTimer();
  if (action === 'break') {
    completionOverlay.hidden = true;
    resetTimer();
  }
  if (action === 'restart') {
    completionOverlay.hidden = true;
    resetTimer();
    startTimer();
  }
}

function startTimer() {
  if (state.running) return;
  state.running = true;
  state.completed = false;
  state.focusMode = true;
  document.body.classList.add('focus-mode');
  updateStatus('In focus mode');
  state.timerInterval = window.setInterval(() => {
    state.remaining -= 1;
    if (state.remaining <= 0) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
      state.running = false;
      completeSession();
      return;
    }
    syncDisplay();
    updateProgressUI();
  }, 1000);
  playSound();
}

function pauseTimer() {
  if (!state.running) return;
  state.running = false;
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  updateStatus('Paused');
  document.body.classList.remove('focus-mode');
}

function resetTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  state.running = false;
  state.completed = false;
  state.remaining = state.duration;
  state.focusMode = false;
  document.body.classList.remove('focus-mode');
  syncDisplay();
  updateProgressUI();
  updateStatus('Reset');
}

function endSession() {
  clearInterval(state.timerInterval);
  state.timerInterval = null;
  state.running = false;
  state.completed = false;
  state.remaining = state.duration;
  state.focusMode = false;
  document.body.classList.remove('focus-mode');
  syncDisplay();
  updateProgressUI();
  updateStatus('Session ended');
}

function completeSession() {
  state.completed = true;
  state.focusMode = false;
  document.body.classList.remove('focus-mode');
  syncDisplay();
  updateProgressUI();
  updateStatus('Complete');
  showCompletionState();
  awardPoints();
  state.completedSessions += 1;
  if (state.duration >= 60 * 60) {
    state.longestSession = Math.max(state.longestSession, 60);
  } else {
    state.longestSession = Math.max(state.longestSession, state.duration / 60);
  }
  updateStats();
}

function syncDisplay() {
  const minutes = Math.floor(state.remaining / 60);
  const seconds = state.remaining % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  animateFlip(display);
  updateProgressUI();
}

function animateFlip(nextValue) {
  clockEl.classList.remove('is-flipping');
  void clockEl.offsetWidth;
  clockEl.classList.add('is-flipping');
  clockEl.textContent = nextValue;
}

function updateProgressUI() {
  const elapsed = state.duration - state.remaining;
  const ratio = Math.min(1, elapsed / state.duration);
  const circumference = 565.49;
  const offset = circumference * (1 - ratio);
  progressRing.style.strokeDashoffset = offset;
  progressBarFill.style.width = `${Math.max(0, ratio * 100)}%`;
}

function updateSessionSummary() {
  state.sessionName = subjectInput.value.trim() || 'Physics';
  state.sessionTopic = topicInput.value.trim() || 'Chapter 6 - Light';
  sessionSummary.textContent = `${state.sessionName} • ${state.sessionTopic}`;
}

function updateStatus(message) {
  statusPill.textContent = message;
}

function showCompletionState() {
  clockEl.textContent = '✔ Session Complete';
  clockEl.classList.add('is-flipping');
  completionOverlay.hidden = false;
  showRewardPopup();
}

function showRewardPopup() {
  const bonus = state.duration >= 3600 ? 15 : state.duration >= 2700 ? 10 : 5;
  rewardPopup.innerHTML = `<strong>+${bonus} Quartz Points</strong><br>${state.duration / 60} min session complete`;
  rewardPopup.classList.add('show');
  window.setTimeout(() => rewardPopup.classList.remove('show'), 2200);
}

function awardPoints() {
  const bonus = state.duration >= 3600 ? 15 : state.duration >= 2700 ? 10 : 5;
  state.points += bonus;
  pointsDisplay.textContent = `${state.points} Quartz`;
}

function updateStats() {
  todayHours.textContent = '2h 15m';
  completedSessionsEl.textContent = String(state.completedSessions);
  longestSessionEl.textContent = `${state.longestSession} min`;
  streakDisplay.textContent = `${state.streak} days 🔥`;
  pointsDisplay.textContent = `${state.points} Quartz`;
}

function renderWeeklyBars() {
  weekBars.innerHTML = '';
  state.weeklyHours.forEach((hours, index) => {
    const bar = document.createElement('div');
    bar.className = 'week-bar';
    bar.style.height = `${Math.max(24, (hours / 180) * 100)}%`;
    const label = document.createElement('span');
    label.textContent = `${Math.round(hours / 60)}h`;
    bar.appendChild(label);
    weekBars.appendChild(bar);
  });
}

function renderSoundChoices() {
  soundGrid.innerHTML = '';
  soundChoices.forEach((sound) => {
    const button = document.createElement('button');
    button.className = 'sound-card';
    button.dataset.sound = sound.id;
    button.textContent = sound.label;
    if (sound.id === state.selectedSound) button.classList.add('active');
    button.addEventListener('click', () => {
      state.selectedSound = sound.id;
      renderSoundChoices();
      playSound();
    });
    soundGrid.appendChild(button);
  });
}

function playSound() {
  if (state.audio) {
    state.audio.pause();
    state.audio.currentTime = 0;
  }
  if (state.muted) return;
  const sound = soundChoices.find((entry) => entry.id === state.selectedSound);
  if (!sound) return;
  const audio = new Audio(sound.src);
  audio.volume = state.volume;
  audio.loop = true;
  audio.play().catch(() => {});
  state.audio = audio;
}

function updateMuteLabel() {
  muteButton.textContent = state.muted ? 'Unmute' : 'Mute';
}

function restoreNotes() {
  const saved = localStorage.getItem('quartz-focus-notes');
  if (saved) {
    notesInput.value = saved;
    state.notes = saved;
  }
}

initialize();
