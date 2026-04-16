/* ============================================
   COSNIMA — Report System
   Phase 2: Report Modal
   
   Usage:
     openReportModal({
       targetType: 'LISTING' | 'USER' | 'MESSAGE',
       targetId:   string,
       targetName: string,   // display name / title / preview
     });
   ============================================ */

let _reportConfig     = null;
let _selectedReason   = '';
let _isSubmittingReport = false;

const REPORT_REASONS = [
  { value: 'SCAM',          label: 'Scam',          icon: '💸' },
  { value: 'HARASSMENT',    label: 'Harassment',     icon: '🚫' },
  { value: 'FAKE_ITEM',     label: 'Fake Item',      icon: '🪤' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate',  icon: '⚠️' },
  { value: 'SPAM',          label: 'Spam',           icon: '📢' },
  { value: 'OTHER',         label: 'Other',          icon: '📋' },
];

const TARGET_TYPE_ICONS = {
  LISTING: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>`,
  USER:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>`,
  MESSAGE: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>`,
};

/* ────────────────────────────────────────────
   OPEN MODAL
   ──────────────────────────────────────────── */
function openReportModal(config) {
  if (!API.isLoggedIn()) {
    showToast('Please log in to report content.', 'info');
    return;
  }
  if (!config?.targetType || !config?.targetId) {
    console.warn('openReportModal: missing targetType or targetId');
    return;
  }

  _reportConfig   = config;
  _selectedReason = '';

  // Remove existing
  document.getElementById('report-modal-backdrop')?.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'report-modal-backdrop';
  backdrop.className = 'report-modal-backdrop';
  backdrop.innerHTML = buildReportModalHtml(config);

  document.body.appendChild(backdrop);
  requestAnimationFrame(() => backdrop.classList.add('open'));

  // Wire reason options
  wireReasonOptions();

  // Close on backdrop
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeReportModal();
  });

  document.addEventListener('keydown', reportEscHandler);
}

function buildReportModalHtml(config) {
  const typeLabel = { LISTING: 'Listing', USER: 'User', MESSAGE: 'Message' }[config.targetType] || config.targetType;
  const iconHtml  = TARGET_TYPE_ICONS[config.targetType] || TARGET_TYPE_ICONS.LISTING;

  return `
    <div class="report-modal" role="dialog" aria-modal="true" aria-label="Report ${typeLabel}">

      <!-- Header -->
      <div class="report-modal-header">
        <div class="report-modal-header-inner">
          <div class="report-modal-icon">${iconHtml}</div>
          <div>
            <h3 class="report-modal-title">Report ${typeLabel}</h3>
            <p class="report-modal-sub">Help us keep Cosnima safe</p>
          </div>
        </div>
        <button class="report-modal-close" onclick="closeReportModal()" aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="report-modal-body" id="report-modal-body">

        <!-- Status banner -->
        <div class="report-status-banner" id="report-status-banner" role="alert"></div>

        <!-- Target context -->
        <div class="report-target-banner">
          <div class="report-target-icon">${iconHtml}</div>
          <div>
            <div class="report-target-name">${escH(config.targetName || 'Content')}</div>
            <div class="report-target-type">${typeLabel}</div>
          </div>
        </div>

        <!-- Reason grid -->
        <div class="report-field">
          <label class="report-field-label">What's the issue?</label>
          <div class="report-reasons-grid" id="report-reasons-grid">
            ${REPORT_REASONS.map(r => `
              <label class="report-reason-option" data-value="${r.value}">
                <input type="radio" name="report-reason" value="${r.value}" style="display:none;">
                <span class="report-reason-icon">${r.icon}</span>
                <span>${r.label}</span>
              </label>`).join('')}
          </div>
        </div>

        <!-- Description -->
        <div class="report-field">
          <label class="report-field-label" for="report-description">
            Additional Details
            <span style="font-size:0.65rem;text-transform:none;letter-spacing:0;color:var(--ink-faint);margin-left:4px;">(optional)</span>
          </label>
          <textarea class="report-description-field" id="report-description"
                    placeholder="Describe the issue in more detail…"
                    maxlength="500" rows="3"></textarea>
        </div>

      </div>

      <!-- Footer -->
      <div class="report-modal-footer">
        <button class="btn btn-ghost" onclick="closeReportModal()">Cancel</button>
        <button class="btn btn-primary" id="report-submit-btn" onclick="submitReport()" disabled
                style="background:var(--error);border-color:var(--error);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
          <span class="btn-text">Submit Report</span>
          <span class="btn-loader" style="display:none;width:14px;height:14px;border:2px solid rgba(255,255,255,0.5);border-top-color:white;border-radius:50%;animation:spin 0.6s linear infinite;"></span>
        </button>
      </div>

    </div>`;
}

/* ────────────────────────────────────────────
   WIRE OPTIONS
   ──────────────────────────────────────────── */
function wireReasonOptions() {
  document.querySelectorAll('.report-reason-option').forEach(option => {
    option.addEventListener('click', () => {
      // Deselect all
      document.querySelectorAll('.report-reason-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      _selectedReason = option.dataset.value;

      // Enable submit
      const submitBtn = document.getElementById('report-submit-btn');
      if (submitBtn) submitBtn.disabled = false;
    });
  });
}

/* ────────────────────────────────────────────
   SUBMIT
   ──────────────────────────────────────────── */
async function submitReport() {
  if (!_reportConfig || !_selectedReason) {
    showReportBanner('Please select a reason before submitting.', 'error');
    return;
  }
  if (_isSubmittingReport) return;
  _isSubmittingReport = true;

  const btn = document.getElementById('report-submit-btn');
  const btnText = btn?.querySelector('.btn-text');
  const btnLoader = btn?.querySelector('.btn-loader');
  if (btn) btn.disabled = true;
  if (btnText) btnText.style.display = 'none';
  if (btnLoader) btnLoader.style.display = 'inline-block';

  const description = document.getElementById('report-description')?.value?.trim() || null;

  try {
    await API.post('/api/reports', {
      targetType:  _reportConfig.targetType,
      targetId:    String(_reportConfig.targetId),
      reason:      _selectedReason,
      description,
    }, true);

    // Success state
    const body   = document.getElementById('report-modal-body');
    const footer = document.querySelector('.report-modal-footer');

    if (body) {
      body.innerHTML = `
        <div class="report-success-state">
          <div class="report-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
          <div class="report-success-title">Report Received</div>
          <p class="report-success-desc">
            Thanks for reporting. Our team will review this
            ${_reportConfig.targetType.toLowerCase()} and take appropriate action.
          </p>
        </div>`;
    }
    if (footer) {
      footer.innerHTML = `
        <div style="margin:0 auto;">
          <button class="btn btn-outline" onclick="closeReportModal()" style="padding:0.5rem 1.5rem;">Close</button>
        </div>`;
    }

    if (typeof showToast === 'function') {
      showToast('Report submitted. Thank you!', 'success');
    }

  } catch (err) {
    handleApiError(err, { showToast: true });
    if (btn) btn.disabled = false;
    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
  } finally {
    _isSubmittingReport = false;
  }
}

/* ────────────────────────────────────────────
   HELPERS
   ──────────────────────────────────────────── */
function closeReportModal() {
  const backdrop = document.getElementById('report-modal-backdrop');
  if (!backdrop) return;
  backdrop.classList.remove('open');
  setTimeout(() => backdrop.remove(), 220);
  document.removeEventListener('keydown', reportEscHandler);
  _reportConfig   = null;
  _selectedReason = '';
}

function reportEscHandler(e) {
  if (e.key === 'Escape') closeReportModal();
}

function showReportBanner(msg, type) {
  const el = document.getElementById('report-status-banner');
  if (!el) return;
  el.textContent = msg;
  el.className = `report-status-banner show ${type}`;
}

function escH(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Expose globally
window.openReportModal  = openReportModal;
window.closeReportModal = closeReportModal;
window.submitReport     = submitReport;
