// Simple LocalStorage-backed store with schema and export/import helpers
(function (global) {
  const KEYS = {
    users: 'users', // {id, role, name, email, passwordHash (plain for demo), active}
    lessons: 'lessons', // {id, title, ageRange, topic, type: 'video'|'article', src}
    questions: 'questions', // {id, ageRange, skill, level, type, prompt, options, answer, explain}
    sessions: 'sessions', // test sessions per user {id, userId|null, startedAt, finishedAt, score, answers:[{qid, correct}]}
    subscriptions: 'subscriptions',
    contacts: 'contacts',
    bookings: 'bookings',
    badges: 'badges', // awarded badges {id, userId|null, name, reason, date}
    settings: 'settings' // {botEnabled:boolean, motion:boolean, site:{siteName,siteDesc,whatsapp,facebook,phone}}
  };

  const channel = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('app-sync') : null;
  function emitChange(key){
    try { const value = JSON.parse(localStorage.getItem(key)); channel?.postMessage({ key, value }); } catch {}
    try { window.dispatchEvent(new CustomEvent('store:changed', { detail: { key, value: JSON.parse(localStorage.getItem(key)) } })); } catch {}
  }

  const Store = {
    keys: KEYS,
    _load(key, fallback = []) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
    _save(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
    all(key) { return this._load(key); },
    set(key, val) { this._save(key, val); emitChange(key); },
    push(key, item) { const arr = this._load(key); arr.push(item); this._save(key, arr); emitChange(key); return item; },
    upsert(key, item) { const arr = this._load(key); const i = arr.findIndex(x => x.id === item.id); if (i>=0) arr[i]=item; else arr.push(item); this._save(key, arr); emitChange(key); return item; },
    remove(key, id) { const arr = this._load(key); const next = arr.filter(x => x.id !== id); this._save(key, next); emitChange(key); },
    getById(key, id) { return this._load(key).find(x => x.id === id) || null; },
    nextId(prefix='id'){ return `${prefix}_${Date.now()}_${Math.floor(Math.random()*1e4)}`; },

    exportJSON() {
      const snapshot = {};
      Object.values(KEYS).forEach(k => snapshot[k] = Store._load(k, []));
      return JSON.stringify(snapshot, null, 2);
    },
    importJSON(json, merge=true) {
      let data; try { data = JSON.parse(json); } catch { throw new Error('JSON غير صالح'); }
      Object.entries(KEYS).forEach(([name, key]) => {
        const existing = Store._load(key, []);
        const incoming = data[key];
        if (!incoming) return;
        if (merge && Array.isArray(existing)) {
          // merge by id when possible
          const map = new Map(existing.map(x => [x.id, x]));
          for (const item of incoming) map.set(item.id ?? Store.nextId(key), { ...map.get(item.id), ...item });
          Store._save(key, Array.from(map.values()));
        } else {
          Store._save(key, incoming);
        }
        emitChange(key);
      });
    }
  };

  global.AppStore = Store;
})(window);