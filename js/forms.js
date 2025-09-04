// Forms handling: quick subscribe, contact, booking
const Storage = {
  save(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
  load(key, fallback = []) { const v = localStorage.getItem(key); try { return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
};

function useStore() { return window.AppStore || { push: (k, v) => { const arr = Storage.load(k); arr.push(v); Storage.save(k, arr); }, _load: Storage.load, _save: Storage.save, all: Storage.load }; }

(function quickSubscribe() {
  const form = document.getElementById('quick-subscribe-form');
  if (!form) return;
  const store = useStore();
  const success = document.getElementById('quick-subscribe-success');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const uid = localStorage.getItem('currentUserId') || null;
    store.push('subscriptions', { id: `sub_${Date.now()}`, userId: uid, email: data.email || null, ...data, createdAt: new Date().toISOString(), status: 'بانتظار التفعيل' });
    form.reset();
    success.hidden = false;
    setTimeout(() => success.hidden = true, 4000);
  });
})();

(function contactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const store = useStore();
  const success = document.getElementById('contact-success');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    store.push('contacts', { id: Date.now(), ...data, createdAt: new Date().toISOString() });
    form.reset();
    success.hidden = false;
    setTimeout(() => success.hidden = true, 4000);
  });
})();

(function bookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;
  const store = useStore();
  const success = document.getElementById('booking-success');
  // attach current user
  const uid = localStorage.getItem('currentUserId');
  const idField = document.getElementById('booking-userId'); if (idField) idField.value = uid || '';
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    store.push('bookings', { id: `bk_${Date.now()}`, ...data, createdAt: new Date().toISOString(), status: 'بانتظار المراجعة' });
    form.reset();
    success.hidden = false;
    setTimeout(() => success.hidden = true, 4000);
  });
})();

// Export helpers
window.DataExport = {
  toCSV(key) {
    const rows = Storage.load(key);
    if (!rows.length) return '';
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(',')].concat(rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))).join('\n');
    return csv;
  },
  toJSON(key) { return JSON.stringify(Storage.load(key), null, 2); }
};