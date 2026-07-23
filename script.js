/* =========================================================
   1. SET YOUR DEADLINE HERE
   Format: "YYYY-MM-DDTHH:MM:SS"
========================================================= */
const DEADLINE = new Date("2026-08-15T23:59:59");

/* =========================================================
   2. SHOWCASE PHOTOS (the slider at the top of the page)
   Replace these with your own image paths/URLs whenever you like.
   Just add file paths like "images/photo1.jpg" once you upload
   your own pics alongside index.html, css, js.
========================================================= */
const SHOWCASE_IMAGES = [
  // "images/photo1.jpg",
  // "images/photo2.jpg",
  // "images/photo3.jpg"
];

/* =========================================================
   COUNTDOWN TIMER
========================================================= */
function startCountdown() {
  const timerCard = document.getElementById("timerCard");
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minsEl = document.getElementById("minutes");
  const secsEl = document.getElementById("seconds");
  const deadlineText = document.getElementById("deadlineText");

  deadlineText.textContent = "Deadline: " + DEADLINE.toLocaleString();

  function tick() {
    const now = new Date();
    const diff = DEADLINE - now;

    if (diff <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minsEl.textContent = "00";
      secsEl.textContent = "00";
      timerCard.classList.add("expired");
      deadlineText.textContent = "Submissions are now closed.";
      disableForm();
      clearInterval(interval);
      return;
    }

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    daysEl.textContent = String(d).padStart(2, "0");
    hoursEl.textContent = String(h).padStart(2, "0");
    minsEl.textContent = String(m).padStart(2, "0");
    secsEl.textContent = String(s).padStart(2, "0");
  }

  tick();
  const interval = setInterval(tick, 1000);
}

function disableForm() {
  const btn = document.getElementById("submitBtn");
  btn.disabled = true;
  btn.textContent = "Submissions Closed";
}

/* =========================================================
   SHOWCASE SLIDER
========================================================= */
function buildSlider() {
  const track = document.getElementById("sliderTrack");
  const dotsWrap = document.getElementById("sliderDots");

  if (SHOWCASE_IMAGES.length === 0) return; // keep placeholder slide

  track.innerHTML = "";
  dotsWrap.innerHTML = "";

  SHOWCASE_IMAGES.forEach((src, i) => {
    const slide = document.createElement("div");
    slide.className = "slide";
    const img = document.createElement("img");
    img.src = src;
    img.alt = "Showcase photo " + (i + 1);
    slide.appendChild(img);
    track.appendChild(slide);

    const dot = document.createElement("div");
    dot.className = "dot" + (i === 0 ? " active" : "");
    dot.addEventListener("click", () => goToSlide(i));
    dotsWrap.appendChild(dot);
  });

  let current = 0;
  function goToSlide(i) {
    current = i;
    track.style.transform = `translateX(-${i * 100}%)`;
    [...dotsWrap.children].forEach((d, idx) =>
      d.classList.toggle("active", idx === i)
    );
  }

  // auto-advance every 4s
  setInterval(() => {
    current = (current + 1) % SHOWCASE_IMAGES.length;
    goToSlide(current);
  }, 4000);
}

/* =========================================================
   FORM: photo preview on upload
========================================================= */
let selectedPhotos = []; // array of base64 strings for the current form fill

function setupPhotoPreview() {
  const input = document.getElementById("photos");
  const preview = document.getElementById("uploadPreview");

  input.addEventListener("change", () => {
    selectedPhotos = [];
    preview.innerHTML = "";
    const files = Array.from(input.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        selectedPhotos.push(e.target.result);
        const img = document.createElement("img");
        img.src = e.target.result;
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });
}

/* =========================================================
   SUBMISSIONS: save to localStorage, render list
========================================================= */
const STORAGE_KEY = "student_submissions";

function getSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveSubmissions(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function renderSubmissions() {
  const list = getSubmissions();
  const wrap = document.getElementById("submissionsList");
  const badge = document.getElementById("countBadge");
  badge.textContent = `(${list.length})`;

  if (list.length === 0) {
    wrap.innerHTML = '<p class="empty-note">No submissions yet.</p>';
    return;
  }

  wrap.innerHTML = "";
  list
    .slice()
    .reverse()
    .forEach((entry) => {
      const item = document.createElement("div");
      item.className = "submission-item";

      const photosHtml = (entry.photos || [])
        .map((p) => `<img src="${p}" alt="submitted photo">`)
        .join("");

      item.innerHTML = `
        <div class="s-top">
          <span class="s-name">${escapeHtml(entry.name)}</span>
          <span class="s-index">${escapeHtml(entry.index)}</span>
        </div>
        <p class="s-reason">${escapeHtml(entry.reason)}</p>
        <div class="s-photos">${photosHtml}</div>
        <p class="s-time">Submitted: ${new Date(entry.time).toLocaleString()}
          &nbsp;·&nbsp; <button class="s-del" data-id="${entry.id}">Delete</button>
        </p>
      `;
      wrap.appendChild(item);
    });

  // wire up delete buttons
  wrap.querySelectorAll(".s-del").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const updated = getSubmissions().filter((e) => String(e.id) !== id);
      saveSubmissions(updated);
      renderSubmissions();
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

/* =========================================================
   FORM SUBMIT
========================================================= */
function setupForm() {
  const form = document.getElementById("submitForm");
  const msg = document.getElementById("formMsg");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (new Date() > DEADLINE) {
      msg.textContent = "Submissions are closed.";
      msg.className = "form-msg error";
      return;
    }

    const name = document.getElementById("name").value.trim();
    const index = document.getElementById("index").value.trim();
    const reason = document.getElementById("reason").value.trim();

    if (!name || !index || !reason) {
      msg.textContent = "Please fill in all required fields.";
      msg.className = "form-msg error";
      return;
    }

    const entry = {
      id: Date.now(),
      name,
      index,
      reason,
      photos: selectedPhotos,
      time: new Date().toISOString(),
    };

    const list = getSubmissions();
    list.push(entry);
    saveSubmissions(list);
    renderSubmissions();

    form.reset();
    document.getElementById("uploadPreview").innerHTML = "";
    selectedPhotos = [];

    msg.textContent = "Submitted successfully. Thank you!";
    msg.className = "form-msg success";
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    if (confirm("Clear all submissions? This cannot be undone.")) {
      saveSubmissions([]);
      renderSubmissions();
    }
  });
}

/* =========================================================
   INIT
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  startCountdown();
  buildSlider();
  setupPhotoPreview();
  setupForm();
  renderSubmissions();
});
