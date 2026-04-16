/* ============================================
   COSNIMA — Shared Utilities
   - Escape HTML (sanitization)
   - Format price & relative time
   - Toast notifications
   ============================================ */

const UTILS = (() => {
  function escapeHtml(str) {
    if (str == null) return '';
    const s = String(str);
    return s.replace(/&/g, '&amp;')
             .replace(/</g, '&lt;')
             .replace(/>/g, '&gt;')
             .replace(/"/g, '&quot;')
             .replace(/'/g, '&#39;');
  }

  function formatPrice(p) {
    if (p == null || p === '') return '₩0';
    const n = parseFloat(p);
    return isNaN(n) ? '₩0' : `₩${n.toLocaleString('ko-KR')}`;
  }

  function formatRelativeTime(dateStr) {
    if (!dateStr) return 'just now';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'just now';
    
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    if (diffWeek < 4) return `${diffWeek}w ago`;
    if (diffMonth < 12) return `${diffMonth}mo ago`;
    return `${Math.floor(diffDay / 365)}y ago`;
  }

  function showToast(message, type = 'info', duration = 3500) {
    if (typeof showToast !== 'function') {
      console.warn('showToast not available, falling back to alert');
      alert(message);
      return;
    }
    showToast(message, type, duration);
  }

  return {
    escapeHtml,
    formatPrice,
    formatRelativeTime,
    showToast
  };
})();