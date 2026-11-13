let ytPlayer = null;
let isPlayerReady = false;
let shouldPlayOnReady = false;
let isPlaying = false;

const YOUTUBE_VIDEO_ID = 'BbzBAX_pHho';
const START_SECONDS = 2;
const END_SECONDS = 268;

function onYouTubeIframeAPIReady() {
  ytPlayer = new YT.Player('yt-player', {
    height: '1',
    width: '1',
    videoId: YOUTUBE_VIDEO_ID,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      playsinline: 1,
      rel: 0,
      start: START_SECONDS,
      end: END_SECONDS
    },
    events: {
      onReady: () => {
        isPlayerReady = true;
        ytPlayer.setVolume(80);
        if (shouldPlayOnReady) {
          startNasheed();
        }
      },
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.ENDED) {
          ytPlayer.seekTo(START_SECONDS, true);
          ytPlayer.playVideo();
        }
      }
    }
  });
}
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

function startNasheed() {
  if (ytPlayer && isPlayerReady) {
    ytPlayer.unMute();
    ytPlayer.setVolume(80);
    ytPlayer.playVideo();
    isPlaying = true;
    updateMusicUI();
  } else {
    shouldPlayOnReady = true;
  }
}

function updateMusicUI() {
  const eqBars = document.getElementById('eq-bars');
  const label = document.getElementById('music-label');
  if (isPlaying) {
    eqBars.classList.remove('paused');
    label.textContent = 'Playing';
  } else {
    eqBars.classList.add('paused');
    label.textContent = 'Muted';
  }
}

const openSealBtn = document.getElementById('open-seal-btn');
const envelopeCard = document.getElementById('envelope-card');
const envelopeOverlay = document.getElementById('envelope-overlay');
const musicToggle = document.getElementById('music-toggle');

openSealBtn.addEventListener('click', () => {
  startNasheed();

  envelopeCard.classList.add('opening');
  setTimeout(() => {
    envelopeOverlay.classList.add('opened');
    document.body.classList.remove('locked');
    musicToggle.classList.remove('hidden');
  }, 550);
});

musicToggle.addEventListener('click', () => {
  if (!ytPlayer || !isPlayerReady) return;
  if (isPlaying) {
    ytPlayer.pauseVideo();
    isPlaying = false;
  } else {
    ytPlayer.playVideo();
    isPlaying = true;
  }
  updateMusicUI();
});

const weddingTarget = new Date('2026-12-12T19:00:00+05:30').getTime();

function updateCountdown() {
  const now = Date.now();
  const diff = Math.max(0, weddingTarget - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  document.getElementById('days').textContent = String(days).padStart(2, '0');
  document.getElementById('hours').textContent = String(hours).padStart(2, '0');
  document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
  document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

document.getElementById('save-calendar-btn').addEventListener('click', () => {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fahad & Diya Wedding//EN',
    'BEGIN:VEVENT',
    'SUMMARY:Fahad & Diya — Wedding Ceremony',
    'DTSTART:20261212T133000Z',
    'DTEND:20261212T160000Z',
    'LOCATION:White Castle Auditorium\\, Kannanchery\\, Kozhikode',
    'DESCRIPTION:Your presence and heartfelt prayers will be a great honor and blessing to us! — Farshad\\, Hina\\, Aizal & Family',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'Fahad-Diya-Wedding.ics';
  link.click();
});

const DEFAULT_WISHES = [
  {
    name: 'Farshad, Hina & Aizal',
    message: 'Counting the days to celebrate this blessed union! May Allah bless Fahad & Diya with endless happiness and barakah.'
  }
];

try {
  localStorage.removeItem('fahad_diya_wedding_wishes_v1');
} catch (e) {}

const STORAGE_KEY = 'fahad_diya_wedding_wishes_v2';
const wishesListEl = document.getElementById('wishes-list');
const wishesForm = document.getElementById('wishes-form');
const guestNameInput = document.getElementById('guest-name');
const guestMessageInput = document.getElementById('guest-message');

function loadWishes() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length > 0) {
      return saved;
    }
  } catch (e) {}
  return [...DEFAULT_WISHES];
}

function saveWishes(wishes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
  } catch (e) {}
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderWishes() {
  const wishes = loadWishes();
  wishesListEl.innerHTML = wishes
    .map(
      (w) => `
      <article class="wish-card">
        <h4 class="wish-author">${escapeHtml(w.name)}</h4>
        <p class="wish-text">${escapeHtml(w.message)}</p>
      </article>
    `
    )
    .join('');
}

document.querySelectorAll('.dua-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    guestMessageInput.value = chip.getAttribute('data-dua');
    guestMessageInput.focus();
  });
});

wishesForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = guestNameInput.value.trim();
  const message = guestMessageInput.value.trim();
  if (!name || !message) return;

  const wishes = loadWishes();
  wishes.unshift({ name, message });
  saveWishes(wishes);
  renderWishes();

  guestNameInput.value = '';
  guestMessageInput.value = '';
});

renderWishes();
