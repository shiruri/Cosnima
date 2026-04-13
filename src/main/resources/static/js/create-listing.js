/* ============================================
   COSNIMA — Create Listing v2
   Multi-step form: Step 1 Details · Step 2 Images · Step 3 Review & Publish
   ============================================ */

let currentStep  = 1;
let totalSteps   = 3;
let uploadedFiles = [];  // File objects from input
let allTags      = [];

const MAX_IMAGES = 8;
const MAX_FILE_MB = 5;

document.addEventListener('DOMContentLoaded', async () => {
  if (!API.isLoggedIn()) {
    redirectTo('../login/login.html');
    return;
  }

  // Load tags for checkboxes
  try {
    allTags = await API.get('/api/tags', true) || [];
    buildTagCheckboxes(allTags);
  } catch {}

  initStepButtons();
  initImageUpload();
  initFormValidation();
  updateStepUI(1);
});

/* ── Tags ── */
function buildTagCheckboxes(tags) {
  const container = document.getElementById('tag-checkboxes');
  if (!container) return;
  container.innerHTML = tags.map(tag => `
    <label class="tag-checkbox-label">
      <input type="checkbox" name="tag" value="${escapeHtml(tag.name)}" onchange="updateReviewTags()">
      <span>${escapeHtml(tag.name)}</span>
    </label>
  `).join('');
}

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
  // Panel visibility
  document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
  document.getElementById(`step-${step}`)?.classList.add('active');

  // Step indicators
  document.querySelectorAll('.step-indicator').forEach((el, i) => {
    const n = i + 1;
    el.classList.remove('active', 'completed');
    if (n < step)   el.classList.add('completed');
    if (n === step) el.classList.add('active');
  });

  // Progress bar
  const pct = ((step - 1) / (totalSteps - 1)) * 100;
  const bar = document.getElementById('step-progress-bar');
  if (bar) bar.style.width = `${pct}%`;
}

/* ── Validation ── */
function validateStep(step) {
  const errors = [];

  if (step === 1) {
    const title       = document.getElementById('title')?.value?.trim();
    const description = document.getElementById('description')?.value?.trim();
    const price       = document.getElementById('price')?.value;
    const type        = document.getElementById('type')?.value;

    if (!title || title.length < 3)       errors.push({ field: 'title',       msg: 'Title must be at least 3 characters.' });
    if (title && title.length > 200)      errors.push({ field: 'title',       msg: 'Title must be under 200 characters.' });
    if (!description || description.length < 10) errors.push({ field: 'description', msg: 'Description must be at least 10 characters.' });
    if (!price || isNaN(Number(price)))   errors.push({ field: 'price',       msg: 'Please enter a valid price.' });
    if (Number(price) <= 0)               errors.push({ field: 'price',       msg: 'Price must be greater than ₱0.' });
    if (Number(price) > 999999)           errors.push({ field: 'price',       msg: 'Price seems too high. Max ₱999,999.' });
    if (!type)                            errors.push({ field: 'type',        msg: 'Please select a listing type.' });
  }

  if (step === 2) {
    if (uploadedFiles.length === 0) {
      errors.push({ field: 'images', msg: 'Please upload at least one image.' });
    }
  }

  return errors;
}

function showStepErrors(errors) {
  clearStepErrors();
  errors.forEach(({ field, msg }) => {
    // Field-level
    const fieldEl  = document.getElementById(field);
    const groupEl  = fieldEl?.closest('.form-group');
    const errorEl  = groupEl?.querySelector('.field-error');
    if (groupEl)  groupEl.classList.add('has-error');
    if (errorEl)  errorEl.textContent = msg;
    if (fieldEl)  fieldEl.focus();

    // Global banner
    const banner = document.getElementById('step-error-banner');
    if (banner) {
      banner.style.display = 'block';
      banner.textContent   = errors[0].msg;
    }
  });
}

function clearStepErrors() {
  document.querySelectorAll('.form-group.has-error').forEach(g => {
    g.classList.remove('has-error');
    const e = g.querySelector('.field-error');
    if (e) e.textContent = '';
  });
  const banner = document.getElementById('step-error-banner');
  if (banner) banner.style.display = 'none';
}

/* ── Real-time validation ── */
function initFormValidation() {
  // Character counters
  setupCounter('title',       200);
  setupCounter('description', 2000);

  // Price formatting
  const priceInput = document.getElementById('price');
  priceInput?.addEventListener('input', () => {
    const val = priceInput.value;
    if (val && !/^\d*\.?\d{0,2}$/.test(val)) {
      priceInput.value = val.slice(0, -1);
    }
    updateReviewPrice();
  });

  // Live review update
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
  const input     = document.getElementById('image-input');
  const dropzone  = document.getElementById('image-dropzone');

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
  files.forEach(file => {
    if (!file.type.startsWith('image/')) { errors.push(`${file.name}: Not an image.`); return; }
    if (file.size > MAX_FILE_MB * 1024 * 1024) { errors.push(`${file.name}: Too large (max ${MAX_FILE_MB}MB).`); return; }
    if (uploadedFiles.length >= MAX_IMAGES) { errors.push(`Max ${MAX_IMAGES} images allowed.`); return; }
    uploadedFiles.push(file);
  });

  if (errors.length) showToast(errors[0], 'error');
  renderImagePreviews();
  updateImageError();
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
          <button class="img-remove-btn" onclick="removeImage(${i})" aria-label="Remove image">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          ${i === 0 ? '<span class="img-primary-badge">Primary</span>' : ''}
        </div>
      </div>`;
  }).join('');

  // Update count display
  const countEl = document.getElementById('image-count');
  if (countEl) countEl.textContent = `${uploadedFiles.length} / ${MAX_IMAGES}`;

  const dropzone = document.getElementById('image-dropzone');
  if (dropzone) dropzone.style.display = uploadedFiles.length >= MAX_IMAGES ? 'none' : '';
}

window.removeImage = function(index) {
  uploadedFiles.splice(index, 1);
  renderImagePreviews();
  updateImageError();
};

function updateImageError() {
  const errEl = document.getElementById('images-error');
  if (!errEl) return;
  errEl.style.display = uploadedFiles.length === 0 ? 'none' : 'none'; // only on submit attempt
}

/* ── Review step builder ── */
function buildReviewStep() {
  const get = id => document.getElementById(id)?.value?.trim() || '';
  const price = get('price') ? `₱${Number(get('price')).toLocaleString('en-PH')}` : '—';
  const type  = get('type')  === 'RENT' ? 'Rent' : 'Sale';

  setReview('review-title',     get('title') || '—');
  setReview('review-type',      type);
  setReview('review-price',     price);
  setReview('review-condition', get('condition') || 'Not specified');
  setReview('review-size',      get('size')      || 'Not specified');
  setReview('review-character', get('characterName') || 'Not specified');
  setReview('review-series',    get('seriesName')    || 'Not specified');
  setReview('review-location',  get('location')      || 'Not specified');
  setReview('review-desc',      get('description')   || '—');
  setReview('review-convention', document.getElementById('conventionPickup')?.checked ? 'Yes' : 'No');

  // Images
  const imgGrid = document.getElementById('review-images');
  if (imgGrid) {
    if (uploadedFiles.length) {
      imgGrid.innerHTML = uploadedFiles.map(f =>
        `<img src="${URL.createObjectURL(f)}" alt="Preview" style="width:72px;height:72px;object-fit:cover;border-radius:var(--radius);border:2px solid var(--border);">`
      ).join('');
    } else {
      imgGrid.innerHTML = '<span style="color:var(--ink-faint);font-size:0.85rem;">No images uploaded</span>';
    }
  }

  // Tags
  const selectedTags = Array.from(document.querySelectorAll('input[name="tag"]:checked')).map(c => c.value);
  const tagsEl = document.getElementById('review-tags');
  if (tagsEl) {
    tagsEl.innerHTML = selectedTags.length
      ? selectedTags.map(t => `<span class="listing-tag">${escapeHtml(t)}</span>`).join('')
      : '<span style="color:var(--ink-faint);font-size:0.85rem;">None</span>';
  }
}

function setReview(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function updateReviewTitle() {
  setReview('review-title', document.getElementById('title')?.value?.trim() || '—');
}
function updateReviewPrice() {
  const price = document.getElementById('price')?.value;
  setReview('review-price', price ? `₱${Number(price).toLocaleString('en-PH')}` : '—');
}
function updateReviewTags() {}

/* ── Submit ── */
async function submitListing() {
  const btn     = document.getElementById('btn-submit');
  const btnText = btn?.querySelector('.btn-text');
  const loader  = btn?.querySelector('.btn-loader');

  if (!btn) return;

  btn.disabled = true;
  if (btnText) btnText.style.display = 'none';
  if (loader)  loader.style.display  = 'flex';

  const get     = id => document.getElementById(id)?.value?.trim() || '';
  const checked = id => document.getElementById(id)?.checked;

  const selectedTags = Array.from(document.querySelectorAll('input[name="tag"]:checked')).map(c => c.value);

  const listingJson = {
    title:           get('title'),
    description:     get('description'),
    price:           Number(get('price')),
    type:            get('type'),
    condition:       get('condition') || null,
    size:            get('size') || null,
    characterName:   get('characterName') || null,
    seriesName:      get('seriesName') || null,
    location:        get('location') || null,
    conventionPickup: checked('conventionPickup') || false,
    tags:            selectedTags,
  };

  const formData = new FormData();
  formData.append('value', new Blob([JSON.stringify(listingJson)], { type: 'application/json' }));
  uploadedFiles.forEach(file => formData.append('images', file));

  try {
    const result = await API.postForm('/api/listings/post', formData);
    const id = result?.id || result;
    showToast('Listing published! 🎉', 'success');
    setTimeout(() => redirectTo(`view-listing.html?id=${id}`), 1000);
  } catch (err) {
    const msg = err?.data?.message || err?.message || 'Failed to publish. Please try again.';
    const banner = document.getElementById('submit-error');
    if (banner) { banner.textContent = msg; banner.style.display = 'block'; }
    showToast(msg, 'error');
    btn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (loader)  loader.style.display  = 'none';
  }
}

/* ── Shared ── */
function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}