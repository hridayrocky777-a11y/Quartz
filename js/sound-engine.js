
(() => {
  if (window.QuartzSound) return;

  const STORAGE_KEY = "quartz-sound-settings";

  const defaults = {
    music: true,
    effects: true,
    musicVolume: 0.18,
    effectsVolume: 0.35
  };

  let settings = { ...defaults };

  try {
    settings = {
      ...defaults,
      ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
    };
  } catch {}

  let audioContext;
  let masterMusic;
  let masterEffects;
  let musicTimer;
  let musicStarted = false;

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }

  function setupAudio() {
    const AudioClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioClass) return false;

    if (!audioContext) {
      audioContext = new AudioClass();

      masterMusic = audioContext.createGain();
      masterEffects = audioContext.createGain();

      masterMusic.gain.value = settings.music ? settings.musicVolume : 0;
      masterEffects.gain.value = settings.effects ? settings.effectsVolume : 0;

      masterMusic.connect(audioContext.destination);
      masterEffects.connect(audioContext.destination);
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    return true;
  }

  function tone(frequency, duration, type = "sine", volume = 0.1, destination) {
    if (!setupAudio()) return;

    destination = destination || masterEffects;

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const now = audioContext.currentTime;

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    oscillator.connect(gain);
    gain.connect(destination);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.03);
  }

  function startMusic() {
    if (!settings.music || musicStarted || !setupAudio()) return;

    musicStarted = true;

    const notes = [
      130.81, 164.81, 196, 164.81,
      146.83, 174.61, 220, 174.61
    ];

    let index = 0;

    function playNote() {
      if (!settings.music || !musicStarted) return;

      const frequency = notes[index % notes.length];

      tone(frequency, 2.8, "sine", 0.045, masterMusic);
      tone(frequency * 2, 2.2, "sine", 0.012, masterMusic);

      index++;
      musicTimer = setTimeout(playNote, 2600);
    }

    playNote();
  }

  function stopMusic() {
    musicStarted = false;
    clearTimeout(musicTimer);
  }

  function setMusic(enabled) {
    settings.music = Boolean(enabled);
    save();

    if (setupAudio()) {
      masterMusic.gain.setTargetAtTime(
        settings.music ? settings.musicVolume : 0,
        audioContext.currentTime,
        0.3
      );
    }

    if (settings.music) startMusic();
    else stopMusic();
  }

  function setEffects(enabled) {
    settings.effects = Boolean(enabled);
    save();

    if (setupAudio()) {
      masterEffects.gain.setTargetAtTime(
        settings.effects ? settings.effectsVolume : 0,
        audioContext.currentTime,
        0.05
      );
    }
  }

  function setMusicVolume(value) {
    settings.musicVolume = Math.max(0, Math.min(1, Number(value)));
    save();

    if (setupAudio() && settings.music) {
      masterMusic.gain.setTargetAtTime(
        settings.musicVolume,
        audioContext.currentTime,
        0.1
      );
    }
  }

  function setEffectsVolume(value) {
    settings.effectsVolume = Math.max(0, Math.min(1, Number(value)));
    save();

    if (setupAudio() && settings.effects) {
      masterEffects.gain.setTargetAtTime(
        settings.effectsVolume,
        audioContext.currentTime,
        0.1
      );
    }
  }

  const sounds = {
    click() {
      if (settings.effects) tone(720, 0.07, "sine", 0.07);
    },

    send() {
      if (!settings.effects) return;
      tone(420, 0.12, "sine", 0.08);
      setTimeout(() => tone(680, 0.16, "sine", 0.07), 75);
    },

    success() {
      if (!settings.effects) return;
      tone(523.25, 0.16, "sine", 0.08);
      setTimeout(() => tone(659.25, 0.2, "sine", 0.08), 130);
      setTimeout(() => tone(783.99, 0.25, "sine", 0.08), 280);
    },

    error() {
      if (!settings.effects) return;
      tone(240, 0.18, "triangle", 0.07);
      setTimeout(() => tone(190, 0.2, "triangle", 0.06), 150);
    },

    toggle() {
      if (settings.effects) tone(880, 0.045, "sine", 0.05);
    }
  };

  window.QuartzSound = {
    settings,
    sounds,
    startMusic,
    stopMusic,
    setMusic,
    setEffects,
    setMusicVolume,
    setEffectsVolume,
    getSettings: () => ({ ...settings })
  };

  document.addEventListener("click", event => {
    const button = event.target.closest("button, [role='button']");

    if (!button || button.dataset.noSound === "true") return;

    sounds.click();
  });

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-quartz-music]").forEach(button => {
      button.addEventListener("click", () => {
        setMusic(!settings.music);
      });
    });

    document.querySelectorAll("[data-quartz-effects]").forEach(button => {
      button.addEventListener("click", () => {
        setEffects(!settings.effects);
      });
    });
  });

})();
