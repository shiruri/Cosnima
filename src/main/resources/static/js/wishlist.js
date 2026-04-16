/* ============================================
   COSNIMA — Wishlist API Integration
   Syncs frontend wishlist state with WishlistController
   ============================================ */

(function attachWishlistApi(global) {
  const STORAGE_KEY = 'cosnimaWishlist';

  const state = {
    loaded: false,
    ids: new Set(),
  };

  function readLocal() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(raw) ? raw.map(String) : [];
    } catch {
      return [];
    }
  }

  function writeLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(state.ids)));
  }

  async function load() {
    if (state.loaded) return state.ids;

    if (!global.API?.isLoggedIn?.()) {
      state.ids = new Set(readLocal());
      state.loaded = true;
      return state.ids;
    }

    try {
      const rows = await global.API.get('/api/wishlists', true);
      const ids = Array.isArray(rows)
        ? rows.map(r => String(r?.listingId || r?.listing?.id || r?.id)).filter(Boolean)
        : [];
      state.ids = new Set(ids);
      writeLocal();
    } catch {
      state.ids = new Set(readLocal());
    }

    state.loaded = true;
    return state.ids;
  }

  function isIn(listingId) {
    return state.ids.has(String(listingId));
  }

  async function toggle(listingId, sellerId = null) {
    const id = String(listingId);

    if (!state.loaded) {
      await load();
    }

    const user = global.API?.getUser?.();
    if (sellerId && user?.id && String(user.id) === String(sellerId)) {
      const err = new Error("You can't wishlist your own listing");
      err.code = 'OWN_LISTING';
      throw err;
    }

    if (!global.API?.isLoggedIn?.()) {
      if (state.ids.has(id)) state.ids.delete(id);
      else state.ids.add(id);
      writeLocal();
      return state.ids.has(id);
    }

    if (state.ids.has(id)) {
      await global.API.delete(`/api/wishlists/${id}`, true);
      state.ids.delete(id);
    } else {
      await global.API.get(`/api/wishlists/${id}/wishlist`, true);
      state.ids.add(id);
    }

    writeLocal();
    return state.ids.has(id);
  }

  async function getCount(listingId) {
    const count = await global.API.get(`/api/wishlists/${listingId}/count`, true);
    return Number(count) || 0;
  }

  global.WishlistAPI = {
    load,
    isIn,
    toggle,
    getCount,
  };
})(window);
