
/* =========================================================
   1. SUPABASE SETUP — paste your project values here
   Find these in Supabase Dashboard > Project Settings > API
========================================================= */
const SUPABASE_URL = "https://gawibgxqkwlmkgdekoeg.supabase.co"; // e.g. "https://xxxxxxxx.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_7vk7zrHnFqDuHoNL8_pz7w_t6RDV0Dl";

let supabaseClient = null;
try {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (err) {
  console.error("Supabase failed to initialize:", err);
}
const TABLE = "submissions";
const BUCKET = "submission-photos";

/* =========================================================
   2. SET YOUR DEADLINE HERE
   Format: "YYYY-MM-DDTHH:MM:SS"
========================================================= */
const DEADLINE = new Date("2026-08-15T23:59:59");

/* =========================================================
   3. PAYMENT DETAILS — edit to match your Till/Paybill
========================================================= */
const PAYMENT_INFO = {
  method: "BANK TRANSFER",
  till: "329329",
  account: "01000423503300",
  amount: "KES 10000",
  instructions:
    "Make a Bank Transfer\nBusiness Number: 329329\nAccount Number: 01000423503300\nAmount: KES 10000\nThen paste the confirmation message/receipt below.",
};

/* =========================================================
   4. INSTITUTIONS DROPDOWN — edit this list to match your students
========================================================= */
const INSTITUTIONS = [
  "Kiambu Institute of Science and Technology",
  "Railways Training Institute",
  "Kenya Institute of Highways and Building Technology",
  "The Nairobi National Polytechnic",
  "Kenya Medical Training College (KMTC)",
  "Nairobi Technical Training Institute",
   "Kabete National Polytechnic",
    "Jeremiah Nyagah National Polytechnic",
    "Kisumu National Polytechnic",
     "Other",
];

/* =========================================================
   5. YEAR COMPLETED DROPDOWN — auto-generated range
   Change YEAR_RANGE_START/END to widen or narrow the list
========================================================= */
const YEAR_RANGE_START = 2015;
const YEAR_RANGE_END = new Date().getFullYear();

/* =========================================================
   2. SHOWCASE PHOTOS (the slider at the top of the page)
   Replace these with your own image paths/URLs whenever you like.
   Just add file paths like "images/photo1.jpg" once you upload
   your own pics alongside index.html, css, js.
========================================================= */
const SHOWCASE_IMAGES = [
   "images/photo1.jpg",
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
let selectedFiles = []; // actual File objects, uploaded to Supabase Storage on submit

function setupPhotoPreview() {
  const input = document.getElementById("photos");
  const preview = document.getElementById("uploadPreview");

  input.addEventListener("change", () => {
    selectedFiles = Array.from(input.files);
    preview.innerHTML = "";

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.src = e.target.result;
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    });
  });
}

/* =========================================================
   PAYMENT INFO DISPLAY
========================================================= */
function renderPaymentInfo() {
  const line = document.getElementById("paymentLine");
  line.textContent = PAYMENT_INFO.instructions;
}

/* =========================================================
   POPULATE DROPDOWNS
========================================================= */
function populateDropdowns() {
  const institutionSelect = document.getElementById("institution");
  INSTITUTIONS.forEach((name) => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    institutionSelect.appendChild(opt);
  });

  const yearSelect = document.getElementById("year");
  for (let y = YEAR_RANGE_END; y >= YEAR_RANGE_START; y--) {
    const opt = document.createElement("option");
    opt.value = y;
    opt.textContent = y;
    yearSelect.appendChild(opt);
  }
}

/* =========================================================
   UPLOAD PHOTOS TO SUPABASE STORAGE
   Returns an array of public URLs
========================================================= */
async function uploadPhotosToStorage(files) {
  if (!supabaseClient) {
    console.error("Supabase is not connected — cannot upload photos.");
    return [];
  }

  const urls = [];
  for (const file of files) {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabaseClient.storage
      .from(BUCKET)
      .upload(path, file);

    if (uploadError) {
      console.error("Photo upload failed:", uploadError);
      continue; // skip this photo but keep going with the rest
    }

    const { data } = supabaseClient.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

/* =========================================================
   SUBMISSIONS: stored in Supabase table, shared across devices
========================================================= */
async function fetchSubmissions() {
  if (!supabaseClient) {
    console.error("Supabase is not connected — check SUPABASE_URL/SUPABASE_ANON_KEY.");
    return [];
  }

  const { data, error } = await supabaseClient
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch failed:", error);
    return [];
  }
  return data || [];
}

async function renderSubmissions() {
  const wrap = document.getElementById("submissionsList");
  const badge = document.getElementById("countBadge");
  const list = await fetchSubmissions();

  badge.textContent = `(${list.length})`;

  if (list.length === 0) {
    wrap.innerHTML = '<p class="empty-note">No submissions yet.</p>';
    return;
  }

  wrap.innerHTML = "";
  list.forEach((entry) => {
    const item = document.createElement("div");
    item.className = "submission-item";

    const photosHtml = (entry.photo_urls || [])
      .map((p) => `<img src="${p}" alt="submitted photo">`)
      .join("");

    const verifiedBadge = entry.verified
      ? '<span class="badge-verified">Verified ✓</span>'
      : '<span class="badge-unverified">Unverified</span>';

    const verifyBtn = entry.verified
      ? ""
      : `<button class="btn-verify" data-id="${entry.id}">Mark Verified</button>`;

    item.innerHTML = `
      <div class="s-top">
        <span class="s-name">${escapeHtml(entry.name)}</span>
        <span class="s-index">${escapeHtml(entry.index_number)}</span>
      </div>
      <p class="s-meta">${escapeHtml(entry.institution || "")} · ${escapeHtml(String(entry.year_completed || ""))}</p>
      <p class="s-reason">${escapeHtml(entry.reason)}</p>
      <div class="s-photos">${photosHtml}</div>
      <p class="s-payment">${escapeHtml(entry.payment_message || "(no payment message)")}</p>
      <div class="s-verify-row">
        ${verifiedBadge}
        ${verifyBtn}
      </div>
      <p class="s-time">Submitted: ${new Date(entry.created_at).toLocaleString()}
        &nbsp;·&nbsp; <button class="s-del" data-id="${entry.id}">Delete</button>
      </p>
    `;
    wrap.appendChild(item);
  });

  // wire up delete buttons
  wrap.querySelectorAll(".s-del").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await supabaseClient.from(TABLE).delete().eq("id", id);
      renderSubmissions();
    });
  });

  // wire up verify buttons
  wrap.querySelectorAll(".btn-verify").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      await supabaseClient.from(TABLE).update({ verified: true }).eq("id", id);
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
  const submitBtn = document.getElementById("submitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (new Date() > DEADLINE) {
      msg.textContent = "Submissions are closed.";
      msg.className = "form-msg error";
      return;
    }

    if (!supabaseClient) {
      msg.textContent = "The site can't connect right now. Please try again shortly.";
      msg.className = "form-msg error";
      return;
    }

    const name = document.getElementById("name").value.trim();
    const index_number = document.getElementById("index").value.trim();
    const institution = document.getElementById("institution").value;
    const year_completed = document.getElementById("year").value;
    const reason = document.getElementById("reason").value.trim();
    const payment_message = document.getElementById("paymentMsg").value.trim();

    if (!name || !index_number || !institution || !year_completed || !reason || !payment_message) {
      msg.textContent = "Please fill in all required fields, including the payment message.";
      msg.className = "form-msg error";
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    msg.textContent = "";
    msg.className = "form-msg";

    try {
      const photo_urls = await uploadPhotosToStorage(selectedFiles);

      const { error } = await supabaseClient.from(TABLE).insert([
        {
          name,
          index_number,
          institution,
          year_completed,
          reason,
          payment_message,
          photo_urls,
          verified: false,
        },
      ]);

      if (error) throw error;

      form.reset();
      document.getElementById("uploadPreview").innerHTML = "";
      selectedFiles = [];

      msg.textContent = "Submitted successfully. Thank you!";
      msg.className = "form-msg success";

      renderSubmissions();
    } catch (err) {
      console.error("Submit failed:", err);
      msg.textContent = "Something went wrong submitting. Please try again.";
      msg.className = "form-msg error";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit Entry";
    }
  });

  document.getElementById("refreshBtn").addEventListener("click", () => {
    renderSubmissions();
  });

  document.getElementById("clearBtn").addEventListener("click", async () => {
    if (confirm("Clear ALL submissions for everyone? This cannot be undone.")) {
      const list = await fetchSubmissions();
      const ids = list.map((e) => e.id);
      if (ids.length > 0) {
        await supabaseClient.from(TABLE).delete().in("id", ids);
      }
      renderSubmissions();
    }
  });
}

/* =========================================================
   INIT
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  safeRun(startCountdown, "countdown timer");
  safeRun(buildSlider, "photo slider");
  safeRun(setupPhotoPreview, "photo upload preview");
  safeRun(renderPaymentInfo, "payment info");
  safeRun(populateDropdowns, "institution/year dropdowns");
  safeRun(setupForm, "form submit handler");
  safeRun(renderSubmissions, "submissions list");
});

function safeRun(fn, label) {
  try {
    const result = fn();
    if (result && typeof result.catch === "function") {
      result.catch((err) => console.error(`Error in ${label}:`, err));
    }
  } catch (err) {
    console.error(`Error in ${label}:`, err);
  }
}



