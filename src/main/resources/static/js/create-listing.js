<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Create Listing — Cosnima</title>
  <link rel="stylesheet" href="../css/variables.css">
  <link rel="stylesheet" href="../css/global.css">
  <link rel="stylesheet" href="../css/home.css">
  <script>(function(){var t=localStorage.getItem('cosnimaTheme')||'light';document.documentElement.setAttribute('data-theme',t);})();</script>
  <style>
    /* Additional styles for create listing page (v2 look with custom tag support) */
    .create-listing-page {
      padding-top: calc(var(--nav-h) + var(--space-xl));
      padding-bottom: var(--space-3xl);
    }

    /* Multi-step progress */
    .step-progress {
      max-width: 600px;
      margin: 0 auto var(--space-xl);
    }
    .step-track {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-sm);
      margin-bottom: var(--space-md);
    }
    .step-indicator {
      flex: 1;
      text-align: center;
      font-size: 0.75rem;
      font-weight: 800;
      padding: 0.5rem 0;
      background: var(--bg-alt);
      border-radius: var(--radius-pill);
      color: var(--ink-muted);
      transition: all var(--t-base);
      border: 1.5px solid var(--border);
    }
    .step-indicator.active {
      background: var(--accent);
      color: white;
      border-color: var(--accent);
    }
    .step-indicator.completed {
      background: var(--beaver);
      color: white;
      border-color: var(--beaver);
    }
    .progress-bar {
      height: 4px;
      background: var(--border);
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      width: 0%;
      height: 100%;
      background: var(--accent);
      transition: width 0.3s ease;
    }

    /* Form steps */
    .form-step {
      display: none;
      animation: fadeIn 0.3s ease;
    }
    .form-step.active { display: block; }
    @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }

    .form-group {
      margin-bottom: var(--space-lg);
    }
    .form-group label {
      display: block;
      font-size: 0.75rem;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--ink-faint);
      margin-bottom: var(--space-xs);
    }
    .form-group input,
    .form-group textarea,
    .form-group select {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid var(--border);
      border-radius: var(--radius);
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--ink);
      background: var(--bg);
      transition: all var(--t-base);
    }
    .form-group input:focus,
    .form-group textarea:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(240,98,146,0.1);
    }
    .form-group.has-error input,
    .form-group.has-error textarea,
    .form-group.has-error select {
      border-color: var(--error);
    }
    .field-error {
      font-size: 0.7rem;
      color: var(--error);
      margin-top: 4px;
      font-weight: 600;
    }
    .char-counter {
      font-size: 0.7rem;
      text-align: right;
      margin-top: 4px;
      color: var(--ink-faint);
    }

    /* Tags: simple checkboxes + custom input */
    .tag-checkbox-group {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-sm);
      margin-bottom: var(--space-md);
      max-height: 160px;
      overflow-y: auto;
      padding: var(--space-xs);
      background: var(--bg-alt);
      border-radius: var(--radius);
      border: 1px solid var(--border);
    }
    .tag-checkbox-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 0.3rem 0.9rem;
      background: var(--card);
      border: 1.5px solid var(--border);
      border-radius: var(--radius-pill);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--t-fast);
    }
    .tag-checkbox-label:hover {
      border-color: var(--accent);
      background: rgba(240,98,146,0.05);
    }
    .tag-checkbox-label input {
      width: auto;
      margin: 0;
      transform: scale(1.1);
      accent-color: var(--accent);
    }
    .custom-tag-input {
      display: flex;
      gap: var(--space-sm);
      margin: var(--space-md) 0 var(--space-sm);
    }
    .custom-tag-input input {
      flex: 1;
    }
    .selected-tags-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-xs);
      margin-top: var(--space-sm);
    }
    .tag-chip {
      background: var(--accent);
      color: white;
      padding: 0.25rem 0.7rem;
      border-radius: var(--radius-pill);
      font-size: 0.75rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .tag-chip-remove {
      cursor: pointer;
      font-weight: 900;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
    .tag-chip-remove:hover { opacity: 1; }

    /* Image upload */
    .image-dropzone {
      border: 2px dashed var(--border-dark);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      text-align: center;
      cursor: pointer;
      transition: all var(--t-base);
      background: var(--bg);
      margin-bottom: var(--space-md);
    }
    .image-dropzone.drag-over {
      border-color: var(--accent);
      background: rgba(240,98,146,0.05);
    }
    .image-dropzone input { display: none; }
    .image-preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: var(--space-sm);
      margin-top: var(--space-md);
    }
    .img-preview-item {
      position: relative;
      aspect-ratio: 1;
      border-radius: var(--radius);
      overflow: hidden;
      border: 2px solid var(--border);
    }
    .img-preview-item img {
      width: 100%; height: 100%;
      object-fit: cover;
    }
    .img-preview-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
    }
    .img-preview-item:hover .img-preview-overlay {
      opacity: 1;
    }
    .img-remove-btn {
      background: var(--error);
      border: none;
      width: 28px; height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: white;
    }
    .img-primary-badge {
      position: absolute;
      top: 6px; left: 6px;
      background: var(--accent);
      color: white;
      font-size: 0.65rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: var(--radius-pill);
    }

    /* Buttons */
    .step-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: var(--space-xl);
      gap: var(--space-md);
    }
    .error-banner {
      background: rgba(192,57,43,0.1);
      border-left: 4px solid var(--error);
      padding: var(--space-md);
      border-radius: var(--radius);
      margin-bottom: var(--space-lg);
      display: none;
      color: var(--error);
      font-weight: 600;
    }

    /* Review step */
    .review-grid {
      display: grid;
      gap: var(--space-md);
      background: var(--bg-alt);
      padding: var(--space-lg);
      border-radius: var(--radius-lg);
    }
    .review-row {
      display: flex;
      border-bottom: 1px solid var(--border);
      padding: var(--space-sm) 0;
    }
    .review-label {
      width: 130px;
      font-weight: 800;
      color: var(--ink-muted);
      font-size: 0.78rem;
    }
    .review-value {
      flex: 1;
      color: var(--ink);
      font-weight: 600;
    }
    .review-images {
      display: flex;
      gap: var(--space-sm);
      flex-wrap: wrap;
    }
  </style>
</head>
<body>

<div id="toast-container" aria-live="polite"></div>

<!-- ── NAVBAR ── -->
<nav class="navbar" role="navigation" aria-label="Main navigation">
  <div class="nav-inner">
    <a href="../index.html" class="nav-logo" aria-label="Cosnima home">
      <svg class="nav-logo-beaver" viewBox="0 0 36 36" fill="none">
        <ellipse cx="18" cy="21" rx="9" ry="8" fill="#c87a50"/>
        <ellipse cx="18" cy="22.5" rx="5.5" ry="5" fill="#e8a878"/>
        <ellipse cx="18" cy="13" rx="7.5" ry="6.5" fill="#c87a50"/>
        <ellipse cx="14.5" cy="14.5" rx="2.5" ry="2" fill="#e8a878"/>
        <ellipse cx="21.5" cy="14.5" rx="2.5" ry="2" fill="#e8a878"/>
        <circle cx="15.5" cy="12" r="1.8" fill="#2a1a1f"/>
        <circle cx="20.5" cy="12" r="1.8" fill="#2a1a1f"/>
        <circle cx="16" cy="11.5" r="0.7" fill="white"/>
        <circle cx="21" cy="11.5" r="0.7" fill="white"/>
        <ellipse cx="12.5" cy="7.5" rx="2.5" ry="3" fill="#c87a50"/>
        <ellipse cx="23.5" cy="7.5" rx="2.5" ry="3" fill="#c87a50"/>
        <rect x="16" y="15.5" width="2" height="2.5" rx="0.5" fill="#f8f0e0"/>
        <rect x="18.5" y="15.5" width="2" height="2.5" rx="0.5" fill="#f8f0e0"/>
        <ellipse cx="18" cy="31" rx="7" ry="3.5" fill="#8b4c30"/>
        <path d="M17.5 9 C17.5 8 16 7 15 8 C14 9 15 10.5 17.5 12 C20 10.5 21 9 20 8 C19 7 17.5 8 17.5 9Z" fill="#f06292"/>
      </svg>
      <span class="nav-logo-name">COS<span>NIMA</span></span>
    </a>
    <div class="nav-links">
      <a href="../index.html">Home</a>
      <a href="listings.html">Browse</a>
      <a href="../index.html#how">How it works</a>
      <a href="create-listing.html" id="sell-link" style="display:none;">+ Sell / Rent</a>
    </div>
    <div class="nav-right">
      <button class="theme-btn" id="theme-btn" aria-label="Toggle dark mode">
        <svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
        <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="5"/><path stroke-linecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
      </button>
      <div id="nav-auth"></div>
      <button class="nav-hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>
</nav>

<div class="mobile-nav" id="mobile-nav">
  <nav class="mobile-nav-links">
    <a href="../index.html">Home</a>
    <a href="listings.html">Browse</a>
    <a href="../index.html#how">How it works</a>
    <a href="create-listing.html" id="mobile-sell-link" style="display:none;">+ Sell / Rent</a>
  </nav>
  <div class="mobile-nav-actions" id="mobile-auth"></div>
</div>
<div class="mobile-overlay" id="mobile-overlay"></div>

<main class="create-listing-page">
  <div class="container">

    <div class="step-progress">
      <div class="step-track">
        <div class="step-indicator active">1. Details</div>
        <div class="step-indicator">2. Images</div>
        <div class="step-indicator">3. Review</div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" id="step-progress-bar"></div>
      </div>
    </div>

    <!-- Error banner -->
    <div class="error-banner" id="step-error-banner"></div>
    <div class="error-banner" id="submit-error" style="display:none;"></div>

    <!-- STEP 1: Details -->
    <div id="step-1" class="form-step active">
      <div class="form-group">
        <label>Title *</label>
        <input type="text" id="title" placeholder="e.g., Nezuko Kamado Full Cosplay Set" maxlength="200">
        <div class="char-counter" id="title-count">0 / 200</div>
        <div class="field-error"></div>
      </div>

      <div class="form-group">
        <label>Description *</label>
        <textarea id="description" rows="5" placeholder="Describe your cosplay, materials, sizing notes, etc." maxlength="2000"></textarea>
        <div class="char-counter" id="description-count">0 / 2000</div>
        <div class="field-error"></div>
      </div>

      <div class="form-group">
        <label>Price (₱) *</label>
        <input type="number" id="price" placeholder="0.00" min="0" step="0.01">
        <div class="field-error"></div>
      </div>

      <div class="form-group">
        <label>Listing Type *</label>
        <select id="type">
          <option value="">Select type</option>
          <option value="SELL">For Sale</option>
          <option value="RENT">For Rent</option>
        </select>
        <div class="field-error"></div>
      </div>

      <div class="form-group">
        <label>Condition</label>
        <select id="condition">
          <option value="">Not specified</option>
          <option value="NEW">New</option>
          <option value="LIKE_NEW">Like New</option>
          <option value="USED">Used</option>
          <option value="WORN">Worn</option>
        </select>
      </div>

      <div class="form-group">
        <label>Size</label>
        <select id="size">
          <option value="">Not specified</option>
          <option value="XS">XS</option><option value="S">S</option><option value="M">M</option>
          <option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option>
        </select>
      </div>

      <div class="form-group">
        <label>Character Name</label>
        <input type="text" id="characterName" placeholder="e.g., Nezuko Kamado">
      </div>

      <div class="form-group">
        <label>Series / Franchise</label>
        <input type="text" id="seriesName" placeholder="e.g., Demon Slayer">
      </div>

      <div class="form-group">
        <label>Location</label>
        <input type="text" id="location" placeholder="e.g., Quezon City, Manila">
      </div>

      <div class="form-group">
        <label>Convention Pickup</label>
        <div style="display:flex; align-items:center; gap:var(--space-sm); margin-top:6px;">
          <input type="checkbox" id="conventionPickup" style="width:auto;">
          <label for="conventionPickup" style="font-size:0.85rem; font-weight:500;">Yes, available for convention pickup</label>
        </div>
      </div>

      <!-- Tags section: checkboxes + custom tag input -->
      <div class="form-group">
        <label>Tags</label>
        <div class="tag-checkbox-group" id="tag-checkboxes">
          <!-- Loaded from backend -->
        </div>
        <div class="custom-tag-input">
          <input type="text" id="custom-tag-input" placeholder="Add custom tag (max 30 chars)" maxlength="30">
          <button type="button" class="btn btn-outline" id="add-custom-tag-btn">Add</button>
        </div>
        <div class="selected-tags-list" id="selected-tags-list"></div>
        <div class="field-error"></div>
      </div>

      <div class="step-buttons">
        <div></div>
        <button class="btn btn-primary" id="btn-next-1">Next →</button>
      </div>
    </div>

    <!-- STEP 2: Images -->
    <div id="step-2" class="form-step">
      <div class="form-group">
        <label>Upload Images * (max 8, up to 5MB each)</label>
        <div class="image-dropzone" id="image-dropzone">
          <input type="file" id="image-input" multiple accept="image/jpeg,image/png,image/webp">
          <div class="img-upload-icon">📸</div>
          <p class="img-upload-text">Drag & drop or <strong>browse</strong></p>
          <p class="img-upload-hint">First image will be the primary cover</p>
        </div>
        <div id="image-count" style="font-size:0.75rem; text-align:right;">0 / 8</div>
        <div class="image-preview-grid" id="image-preview-grid"></div>
        <div class="field-error" id="images-error"></div>
      </div>
      <div class="step-buttons">
        <button class="btn btn-ghost" id="btn-prev-2">← Back</button>
        <button class="btn btn-primary" id="btn-next-2">Review →</button>
      </div>
    </div>

    <!-- STEP 3: Review & Publish -->
    <div id="step-3" class="form-step">
      <div class="review-grid">
        <div class="review-row"><div class="review-label">Title</div><div class="review-value" id="review-title">—</div></div>
        <div class="review-row"><div class="review-label">Type</div><div class="review-value" id="review-type">—</div></div>
        <div class="review-row"><div class="review-label">Price</div><div class="review-value" id="review-price">—</div></div>
        <div class="review-row"><div class="review-label">Condition</div><div class="review-value" id="review-condition">—</div></div>
        <div class="review-row"><div class="review-label">Size</div><div class="review-value" id="review-size">—</div></div>
        <div class="review-row"><div class="review-label">Character</div><div class="review-value" id="review-character">—</div></div>
        <div class="review-row"><div class="review-label">Series</div><div class="review-value" id="review-series">—</div></div>
        <div class="review-row"><div class="review-label">Location</div><div class="review-value" id="review-location">—</div></div>
        <div class="review-row"><div class="review-label">Convention pickup</div><div class="review-value" id="review-convention">—</div></div>
        <div class="review-row"><div class="review-label">Description</div><div class="review-value" id="review-desc">—</div></div>
        <div class="review-row"><div class="review-label">Tags</div><div class="review-value" id="review-tags">—</div></div>
        <div class="review-row"><div class="review-label">Images</div><div class="review-value"><div class="review-images" id="review-images"></div></div></div>
      </div>
      <div class="step-buttons">
        <button class="btn btn-ghost" id="btn-prev-3">← Back</button>
        <button class="btn btn-primary" id="btn-submit">
          <span class="btn-text">Publish Listing</span>
          <span class="btn-loader" style="display:none;"></span>
        </button>
      </div>
    </div>

  </div>
</main>

<script src="../js/api.js"></script>
<script src="../js/nav.js"></script>
<script>
/* ============================================
   COSNIMA — Create Listing v2 + Custom Tags
   Multi-step form with predefined checkboxes + custom tag input
   ============================================ */

let currentStep  = 1;
let totalSteps   = 3;
let uploadedFiles = [];
let allTags = [];
let selectedTags = [];      // array of tag names (strings)

const MAX_IMAGES = 8;
const MAX_FILE_MB = 5;

document.addEventListener('DOMContentLoaded', async () => {
  if (!API.isLoggedIn()) {
    redirectTo('../login/login.html');
    return;
  }

  try {
    allTags = await API.get('/api/tags', true) || [];
    buildTagCheckboxes(allTags);
  } catch {}

  initStepButtons();
  initImageUpload();
  initCustomTagInput();
  initFormValidation();
  updateStepUI(1);
});

/* ── Build predefined tag checkboxes ── */
function buildTagCheckboxes(tags) {
  const container = document.getElementById('tag-checkboxes');
  if (!container) return;
  container.innerHTML = tags.map(tag => `
    <label class="tag-checkbox-label">
      <input type="checkbox" name="predefinedTag" value="${escapeHtml(tag.name)}" onchange="togglePredefinedTag(this, '${escapeHtml(tag.name)}')">
      <span>${escapeHtml(tag.name)}</span>
    </label>
  `).join('');
}

function togglePredefinedTag(checkbox, tagName) {
  if (checkbox.checked) {
    if (!selectedTags.includes(tagName)) {
      selectedTags.push(tagName);
    }
  } else {
    selectedTags = selectedTags.filter(t => t !== tagName);
  }
  renderSelectedTags();
  updateReviewTags();
}

/* ── Custom tag input ── */
function initCustomTagInput() {
  const input = document.getElementById('custom-tag-input');
  const addBtn = document.getElementById('add-custom-tag-btn');
  if (!input || !addBtn) return;

  const addCustomTag = () => {
    let val = input.value.trim();
    if (!val) return;
    if (val.length > 30) val = val.slice(0,30);
    // avoid duplicate
    if (selectedTags.some(t => t.toLowerCase() === val.toLowerCase())) {
      showToast('Tag already added', 'info');
      return;
    }
    selectedTags.push(val);
    renderSelectedTags();
    input.value = '';
    updateReviewTags();
  };

  addBtn.addEventListener('click', addCustomTag);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTag();
    }
  });
}

function renderSelectedTags() {
  const container = document.getElementById('selected-tags-list');
  if (!container) return;
  if (selectedTags.length === 0) {
    container.innerHTML = '<span style="font-size:0.75rem; color:var(--ink-faint);">No tags selected</span>';
    return;
  }
  container.innerHTML = selectedTags.map((tag, idx) => `
    <span class="tag-chip">
      ${escapeHtml(tag)}
      <span class="tag-chip-remove" onclick="removeTag(${idx})">✕</span>
    </span>
  `).join('');
}

window.removeTag = function(index) {
  const tagName = selectedTags[index];
  if (tagName) {
    // Uncheck predefined checkbox if it exists
    const checkbox = document.querySelector(`input[name="predefinedTag"][value="${escapeHtml(tagName)}"]`);
    if (checkbox) checkbox.checked = false;
  }
  selectedTags.splice(index, 1);
  renderSelectedTags();
  updateReviewTags();
};

/* ── Step navigation ── */
function initStepButtons() {
  document.getElementById('btn-next-1')?.addEventListener('click', () => tryAdvance(1));
  document.getElementById('btn-next-2')?.addEventListener('click', () => tryAdvance(2));
  document.getElementById('btn-prev-2')?.addEventListener('click', () => goTo(1));
  document.getElementById('btn-prev-3')?.addEventListener('click', () => goTo(2));
  document.getElementById('btn-submit')?.addEventListener('click', submitListing);
}

function tryAdvance(from) {
  const errors = validateStep(from);
  if (errors.length) {
    showStepErrors(errors);
    return;
  }
  clearStepErrors();
  if (from === 2) buildReviewStep();
  goTo(from + 1);
}

function goTo(step) {
  currentStep = step;
  updateStepUI(step);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateStepUI(step) {
  document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
  document.getElementById(`step-${step}`)?.classList.add('active');

  document.querySelectorAll('.step-indicator').forEach((el, i) => {
    const n = i + 1;
    el.classList.remove('active', 'completed');
    if (n < step) el.classList.add('completed');
    if (n === step) el.classList.add('active');
  });

  const pct = ((step - 1) / (totalSteps - 1)) * 100;
  const bar = document.getElementById('step-progress-bar');
  if (bar) bar.style.width = `${pct}%`;
}

/* ── Validation ── */
function validateStep(step) {
  const errors = [];
  if (step === 1) {
    const title = document.getElementById('title')?.value?.trim();
    const desc = document.getElementById('description')?.value?.trim();
    const price = document.getElementById('price')?.value;
    const type = document.getElementById('type')?.value;
    if (!title || title.length < 3) errors.push({ field: 'title', msg: 'Title must be at least 3 characters.' });
    if (title && title.length > 200) errors.push({ field: 'title', msg: 'Title too long (max 200).' });
    if (!desc || desc.length < 10) errors.push({ field: 'description', msg: 'Description must be at least 10 characters.' });
    if (!price || isNaN(Number(price)) || Number(price) <= 0) errors.push({ field: 'price', msg: 'Enter a valid price (>0).' });
    if (!type) errors.push({ field: 'type', msg: 'Select listing type.' });
  }
  if (step === 2) {
    if (uploadedFiles.length === 0) errors.push({ field: 'images', msg: 'Upload at least one image.' });
  }
  return errors;
}

function showStepErrors(errors) {
  clearStepErrors();
  errors.forEach(({ field, msg }) => {
    const fieldEl = document.getElementById(field);
    const groupEl = fieldEl?.closest('.form-group');
    if (groupEl) groupEl.classList.add('has-error');
    const errEl = groupEl?.querySelector('.field-error');
    if (errEl) errEl.textContent = msg;
    const banner = document.getElementById('step-error-banner');
    if (banner) { banner.style.display = 'block'; banner.textContent = errors[0].msg; }
  });
}

function clearStepErrors() {
  document.querySelectorAll('.form-group.has-error').forEach(g => g.classList.remove('has-error'));
  document.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  const banner = document.getElementById('step-error-banner');
  if (banner) banner.style.display = 'none';
}

/* ── Real-time helpers ── */
function initFormValidation() {
  setupCounter('title', 200);
  setupCounter('description', 2000);
  const priceInput = document.getElementById('price');
  priceInput?.addEventListener('input', () => {
    let val = priceInput.value;
    if (val && !/^\d*\.?\d{0,2}$/.test(val)) priceInput.value = val.slice(0, -1);
    updateReviewPrice();
  });
  ['title','type'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', updateReviewTitle);
  });
}

function setupCounter(id, max) {
  const el = document.getElementById(id);
  const countEl = document.getElementById(`${id}-count`);
  if (!el || !countEl) return;
  const update = () => {
    const len = el.value.length;
    countEl.textContent = `${len} / ${max}`;
    countEl.style.color = len > max * 0.9 ? 'var(--error)' : 'var(--ink-faint)';
  };
  el.addEventListener('input', update);
  update();
}

/* ── Image upload ── */
function initImageUpload() {
  const input = document.getElementById('image-input');
  const dropzone = document.getElementById('image-dropzone');
  input?.addEventListener('change', e => handleFiles(Array.from(e.target.files)));
  dropzone?.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone?.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone?.addEventListener('drop', e => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    handleFiles(Array.from(e.dataTransfer.files));
  });
  dropzone?.addEventListener('click', () => input?.click());
}

function handleFiles(files) {
  const errors = [];
  for (let file of files) {
    if (!file.type.startsWith('image/')) { errors.push(`${file.name}: Not an image.`); continue; }
    if (file.size > MAX_FILE_MB * 1024 * 1024) { errors.push(`${file.name}: Max ${MAX_FILE_MB}MB.`); continue; }
    if (uploadedFiles.length >= MAX_IMAGES) { errors.push(`Max ${MAX_IMAGES} images.`); break; }
    uploadedFiles.push(file);
  }
  if (errors.length) showToast(errors[0], 'error');
  renderImagePreviews();
}

function renderImagePreviews() {
  const grid = document.getElementById('image-preview-grid');
  if (!grid) return;
  grid.innerHTML = uploadedFiles.map((file, i) => {
    const url = URL.createObjectURL(file);
    return `
      <div class="img-preview-item" data-index="${i}">
        <img src="${url}" alt="Preview ${i+1}">
        <div class="img-preview-overlay">
          <button class="img-remove-btn" onclick="removeImage(${i})">✕</button>
          ${i === 0 ? '<span class="img-primary-badge">Primary</span>' : ''}
        </div>
      </div>`;
  }).join('');
  document.getElementById('image-count').textContent = `${uploadedFiles.length} / ${MAX_IMAGES}`;
  const dropzone = document.getElementById('image-dropzone');
  if (dropzone) dropzone.style.display = uploadedFiles.length >= MAX_IMAGES ? 'none' : '';
}

window.removeImage = function(index) {
  uploadedFiles.splice(index, 1);
  renderImagePreviews();
};

/* ── Review builder ── */
function buildReviewStep() {
  const get = id => document.getElementById(id)?.value?.trim() || '';
  const price = get('price') ? `₱${Number(get('price')).toLocaleString('en-PH')}` : '—';
  const type = get('type') === 'RENT' ? 'Rent' : 'Sale';
  setReview('review-title', get('title') || '—');
  setReview('review-type', type);
  setReview('review-price', price);
  setReview('review-condition', get('condition') || 'Not specified');
  setReview('review-size', get('size') || 'Not specified');
  setReview('review-character', get('characterName') || 'Not specified');
  setReview('review-series', get('seriesName') || 'Not specified');
  setReview('review-location', get('location') || 'Not specified');
  setReview('review-desc', get('description') || '—');
  setReview('review-convention', document.getElementById('conventionPickup')?.checked ? 'Yes' : 'No');
  // Tags
  const tagsHtml = selectedTags.length ? selectedTags.map(t => `<span class="listing-tag">${escapeHtml(t)}</span>`).join('') : '<span style="color:var(--ink-faint);">None</span>';
  document.getElementById('review-tags').innerHTML = tagsHtml;
  // Images
  const imgGrid = document.getElementById('review-images');
  if (imgGrid) {
    if (uploadedFiles.length) {
      imgGrid.innerHTML = uploadedFiles.map(f => `<img src="${URL.createObjectURL(f)}" alt="Preview" style="width:72px;height:72px;object-fit:cover;border-radius:var(--radius);border:2px solid var(--border);">`).join('');
    } else {
      imgGrid.innerHTML = '<span style="color:var(--ink-faint);">No images</span>';
    }
  }
}

function setReview(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; }
function updateReviewTitle() { setReview('review-title', document.getElementById('title')?.value?.trim() || '—'); }
function updateReviewPrice() { const price = document.getElementById('price')?.value; setReview('review-price', price ? `₱${Number(price).toLocaleString('en-PH')}` : '—'); }
function updateReviewTags() { buildReviewStep(); }

/* ── Submit ── */
async function submitListing() {
  const btn = document.getElementById('btn-submit');
  const btnText = btn?.querySelector('.btn-text');
  const loader = btn?.querySelector('.btn-loader');
  btn.disabled = true;
  if (btnText) btnText.style.display = 'none';
  if (loader) loader.style.display = 'flex';

  const get = id => document.getElementById(id)?.value?.trim() || '';
  const checked = id => document.getElementById(id)?.checked;

  const listingJson = {
    title: get('title'),
    description: get('description'),
    price: Number(get('price')),
    type: get('type'),
    condition: get('condition') || null,
    size: get('size') || null,
    characterName: get('characterName') || null,
    seriesName: get('seriesName') || null,
    location: get('location') || null,
    conventionPickup: checked('conventionPickup') || false,
    tags: selectedTags,   // send all selected tags (predefined + custom)
  };

  const formData = new FormData();
  formData.append('value', new Blob([JSON.stringify(listingJson)], { type: 'application/json' }));
  uploadedFiles.forEach(file => formData.append('images', file));

  try {
    const result = await API.postForm('/api/listings/post', formData);
    const id = result?.id || result;
    showToast('Listing published!', 'success');
    setTimeout(() => redirectTo(`view-listing.html?id=${id}`), 1000);
  } catch (err) {
    const msg = err?.data?.message || err?.message || 'Failed to publish.';
    const banner = document.getElementById('submit-error');
    if (banner) { banner.textContent = msg; banner.style.display = 'block'; }
    showToast(msg, 'error');
    btn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (loader) loader.style.display = 'none';
  }
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function showToast(msg, type, duration=3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}
function redirectTo(url) { window.location.href = url; }
</script>
</body>
</html>