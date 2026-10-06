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
