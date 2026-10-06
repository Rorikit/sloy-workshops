const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const themeLabel = document.querySelector('.theme-label');
const savedTheme = localStorage.getItem('sloy-theme');

if (savedTheme === 'light' || savedTheme === 'dark') root.dataset.theme = savedTheme;

function syncThemeButton() {
  const isDark = root.dataset.theme === 'dark' ||
    (root.dataset.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  themeButton.setAttribute('aria-pressed', String(isDark));
  themeButton.setAttribute('aria-label', isDark ? 'Включить светлую тему' : 'Включить тёмную тему');
  themeLabel.textContent = isDark ? 'Светлая' : 'Тёмная';
}

themeButton.addEventListener('click', () => {
  const nowDark = root.dataset.theme === 'dark' ||
    (root.dataset.theme === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  root.dataset.theme = nowDark ? 'light' : 'dark';
  localStorage.setItem('sloy-theme', root.dataset.theme);
  syncThemeButton();
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncThemeButton);
syncThemeButton();

const cards = [...document.querySelectorAll('.workshop-card')];
const search = document.querySelector('#search');
const chips = [...document.querySelectorAll('.filter-chip')];
const count = document.querySelector('#result-count');
const emptyState = document.querySelector('.empty-state');
let activeFilter = 'all';

function applyFilters() {
  const query = search.value.trim().toLocaleLowerCase('ru');
  let visible = 0;
  cards.forEach((card) => {
    const categoryMatch = activeFilter === 'all' || card.dataset.category === activeFilter;
    const searchMatch = !query || card.dataset.search.includes(query) || card.textContent.toLocaleLowerCase('ru').includes(query);
    card.hidden = !(categoryMatch && searchMatch);
    if (!card.hidden) visible += 1;
  });
  count.textContent = visible;
  emptyState.hidden = visible !== 0;
}

search.addEventListener('input', applyFilters);
chips.forEach((chip) => chip.addEventListener('click', () => {
  activeFilter = chip.dataset.filter;
  chips.forEach((item) => {
    const selected = item === chip;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-pressed', String(selected));
  });
  applyFilters();
}));

document.querySelector('#reset-filters').addEventListener('click', () => {
  search.value = '';
  chips[0].click();
  search.focus();
});

document.querySelectorAll('.favorite').forEach((button, index) => {
  const key = `sloy-favorite-${index}`;
  if (localStorage.getItem(key) === 'true') button.setAttribute('aria-pressed', 'true');
  button.addEventListener('click', () => {
    const next = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', String(next));
    button.setAttribute('aria-label', button.getAttribute('aria-label').replace(next ? 'Добавить' : 'Убрать', next ? 'Убрать' : 'Добавить'));
    localStorage.setItem(key, String(next));
  });
});

const dialog = document.querySelector('#booking-dialog');
const bookingForm = document.querySelector('#booking-form');
const subtitle = document.querySelector('#booking-subtitle');
let previousFocus;

document.querySelectorAll('[data-book]').forEach((button) => button.addEventListener('click', () => {
  previousFocus = button;
  subtitle.textContent = `Вы выбрали «${button.dataset.book}». Подтвердим место и пришлём детали в течение дня.`;
  bookingForm.reset();
  bookingForm.querySelector('.form-status').textContent = '';
  dialog.showModal();
  requestAnimationFrame(() => bookingForm.elements.name.focus());
}));

dialog.addEventListener('click', (event) => {
  const rect = dialog.getBoundingClientRect();
  const outside = event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom;
  if (outside) dialog.close();
});
document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());

dialog.addEventListener('close', () => previousFocus?.focus());

bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!bookingForm.reportValidity()) return;
  bookingForm.querySelector('.form-status').textContent = 'Готово! Заявка сохранена для демонстрации.';
  bookingForm.querySelector('.button-primary').disabled = true;
  setTimeout(() => {
    dialog.close();
    bookingForm.querySelector('.button-primary').disabled = false;
  }, 1200);
});

const mediaPlayer = document.querySelector('[data-media-player]');
if (mediaPlayer) {
  const video = mediaPlayer.querySelector('video');
  const ambience = mediaPlayer.querySelector('audio');
  const playButton = mediaPlayer.querySelector('.video-play');
  const soundButton = mediaPlayer.querySelector('.video-sound');
  const timeLabel = mediaPlayer.querySelector('.video-time');
  const playIcon = playButton.querySelector('[aria-hidden]');
  const playLabel = playButton.querySelector('.control-label');
  const soundLabel = soundButton.querySelector('.control-label');
  let soundEnabled = true;

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  };

  const updatePlayState = () => {
    const isPlaying = !video.paused && !video.ended;
    playIcon.textContent = isPlaying ? 'Ⅱ' : '▶';
    playLabel.textContent = isPlaying ? 'Пауза' : 'Смотреть';
    playButton.setAttribute('aria-label', isPlaying ? 'Приостановить видео' : 'Воспроизвести видео');
  };

  const syncAmbience = () => {
    if (!ambience.duration) return;
    const target = video.currentTime % ambience.duration;
    if (Math.abs(ambience.currentTime - target) > .45) ambience.currentTime = target;
  };

  const playMedia = async () => {
    await video.play();
    if (soundEnabled) {
      syncAmbience();
      try { await ambience.play(); } catch { /* Audio remains user-controllable. */ }
    }
  };

  const pauseMedia = () => {
    video.pause();
    ambience.pause();
  };

  playButton.addEventListener('click', () => video.paused ? playMedia() : pauseMedia());
  video.addEventListener('click', () => video.paused ? playMedia() : pauseMedia());
  video.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      video.paused ? playMedia() : pauseMedia();
    }
  });
  video.addEventListener('play', updatePlayState);
  video.addEventListener('pause', updatePlayState);
  video.addEventListener('ended', () => { ambience.pause(); updatePlayState(); });
  video.addEventListener('loadedmetadata', () => { timeLabel.textContent = `0:00 / ${formatTime(video.duration)}`; });
  video.addEventListener('timeupdate', () => {
    timeLabel.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
    if (soundEnabled && !video.paused) syncAmbience();
  });

  soundButton.addEventListener('click', async () => {
    soundEnabled = !soundEnabled;
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.setAttribute('aria-label', soundEnabled ? 'Выключить звук' : 'Включить звук');
    soundLabel.textContent = soundEnabled ? 'Звук включён' : 'Звук выключен';
    if (soundEnabled && !video.paused) {
      syncAmbience();
      try { await ambience.play(); } catch { /* A later click can retry playback. */ }
    } else {
      ambience.pause();
    }
  });
}
