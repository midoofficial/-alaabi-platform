// Admin panel logic: tabs + CRUD for users/lessons/questions + JSON import/export
(function(){
  const $ = s => document.querySelector(s);
  // Logout inside admin
  document.getElementById('admin-logout')?.addEventListener('click', (e)=>{
    e.preventDefault();
    localStorage.removeItem('currentUserId');
    alert('تم تسجيل الخروج من لوحة الإدارة.');
    location.href = '/';
  });
  // Tabs
  document.querySelectorAll('nav.menu a[data-tab]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('nav.menu a').forEach(x=>x.classList.remove('active'));
      a.classList.add('active');
      const tab = a.getAttribute('data-tab');
      document.querySelectorAll('main section.card').forEach(sec => sec.classList.add('hide'));
      $('#tab-' + tab).classList.remove('hide');
    });
  });

  // Users list + create
  const userForm = document.getElementById('user-form');
  userForm?.addEventListener('submit', (e)=>{
    e.preventDefault(); const data = Object.fromEntries(new FormData(userForm).entries());
    const u = { id: data.id || AppStore.nextId('u'), name: data.name, email: data.email, role: data.role||'user', active: data.active==='true', passwordHash: '123456' };
    AppStore.upsert('users', u); userForm.reset(); renderUsers(); alert('تم حفظ المستخدم');
  });
  function renderUsers(){
    const users = AppStore.all('users');
    const wrap = document.getElementById('users-list');
    wrap.innerHTML = `<table style="width:100%"><thead><tr><th>الاسم</th><th>الدور</th><th>البريد</th><th>مفعّل</th><th>تحكم</th></tr></thead><tbody>
      ${users.map(u=>`<tr><td>${u.name}</td><td>${u.role}</td><td>${u.email}</td><td>${u.active?'نعم':'لا'}</td><td>
        <button class="btn" data-act="toggle" data-id="${u.id}">${u.active?'تعطيل':'تفعيل'}</button>
        <button class="btn" data-act="reset" data-id="${u.id}">إعادة كلمة السر</button>
      </td></tr>`).join('')}
    </tbody></table>`;
    wrap.querySelectorAll('button[data-act]').forEach(b => b.addEventListener('click', () => {
      const id = b.getAttribute('data-id');
      const u = AppStore.getById('users', id); if (!u) return;
      const act = b.getAttribute('data-act');
      if (act==='toggle'){ u.active = !u.active; AppStore.upsert('users', u); renderUsers(); }
      if (act==='reset'){ u.passwordHash = '123456'; AppStore.upsert('users', u); alert('تمت إعادة التعيين إلى 123456'); }
    }));
  }

  // Lessons CRUD
  const lessonForm = document.getElementById('lesson-form');
  function renderLessons(){
    const list = AppStore.all('lessons');
    const wrap = document.getElementById('lessons-list');
    wrap.innerHTML = list.map(l=>`<div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:.5rem">
      <div style="display:flex;align-items:center;gap:.5rem">
        ${l.thumb ? `<img src="${l.thumb}" alt="thumb" style="width:56px;height:56px;border-radius:8px;object-fit:cover">` : ''}
        <div><b>${l.title}</b> <span class="badge">${l.ageRange}</span> · ${l.type} ${l.topic? '· '+l.topic:''}</div>
      </div>
      <div>
        <button class="btn" data-edit="${l.id}">تعديل</button>
        <button class="btn" data-del="${l.id}">حذف</button>
      </div>
    </div>`).join('');
    wrap.querySelectorAll('button[data-edit]').forEach(b => b.addEventListener('click', ()=>{
      const l = AppStore.getById('lessons', b.getAttribute('data-edit'));
      if (!l) return;
      lessonForm.id.value = l.id; lessonForm.title.value = l.title; lessonForm.ageRange.value = l.ageRange; lessonForm.topic.value = l.topic||''; lessonForm.type.value = l.type; lessonForm.src.value = l.src || ''; lessonForm.desc.value = l.desc||''; lessonForm.thumb.value = l.thumb||''; lessonForm.content.value = l.content||'';
      window.scrollTo({ top: lessonForm.getBoundingClientRect().top + window.scrollY - 80, behavior:'smooth' });
    }));
    wrap.querySelectorAll('button[data-del]').forEach(b => b.addEventListener('click', ()=>{
      AppStore.remove('lessons', b.getAttribute('data-del')); renderLessons();
    }));
  }
  lessonForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(lessonForm);
    const data = Object.fromEntries(fd.entries());
    const item = { id: data.id || AppStore.nextId('l'), title: data.title, ageRange: data.ageRange, topic: data.topic, type: data.type, src: data.src, desc: data.desc||'', content: data.content||'' };
    const thumbFile = fd.get('thumbFile');
    const srcFile = fd.get('srcFile');
    function toDataUrl(file){ return new Promise((res)=>{ const r = new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(file); }); }
    (async ()=>{
      if (thumbFile && thumbFile.size) item.thumb = await toDataUrl(thumbFile); else if (data.thumb) item.thumb = data.thumb;
      if (srcFile && srcFile.size && data.type==='video') item.src = await toDataUrl(srcFile);
      AppStore.upsert('lessons', item);
      lessonForm.reset(); renderLessons();
    })();
  });

  // Questions CRUD
  const qForm = document.getElementById('question-form');
  function renderQuestions(){
    const list = AppStore.all('questions');
    const wrap = document.getElementById('questions-list');
    wrap.innerHTML = list.map(q=>`<div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:.5rem">
      <div><span class="badge">${q.ageRange}</span> <b>${q.prompt}</b> · ${q.type} · ${q.skill}</div>
      <div>
        <button class="btn" data-edit="${q.id}">تعديل</button>
        <button class="btn" data-del="${q.id}">حذف</button>
      </div>
    </div>`).join('');
    wrap.querySelectorAll('button[data-edit]').forEach(b => b.addEventListener('click', ()=>{
      const q = AppStore.getById('questions', b.getAttribute('data-edit'));
      if (!q) return;
      qForm.id.value = q.id; qForm.ageRange.value = q.ageRange; qForm.skill.value = q.skill; qForm.level.value = q.level; qForm.prompt.value = q.prompt; qForm.type.value = q.type; qForm.options.value = (q.options||[]).join(','); qForm.answer.value = q.type==='tf' ? String(!!q.answer) : String(q.answer); qForm.explain.value = q.explain || '';
      window.scrollTo({ top: qForm.getBoundingClientRect().top + window.scrollY - 80, behavior:'smooth' });
    }));
    wrap.querySelectorAll('button[data-del]').forEach(b => b.addEventListener('click', ()=>{ AppStore.remove('questions', b.getAttribute('data-del')); renderQuestions(); }));
  }
  qForm?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(qForm);
    const data = Object.fromEntries(fd.entries());
    // Handle media: if file provided, read as data URL
    function toDataUrl(file){ return new Promise((res)=>{ const r = new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(file); }); }
    (async ()=>{
      const item = { id: data.id || AppStore.nextId('q'), ageRange: data.ageRange, skill: data.skill, level: Number(data.level||1), type: data.type, prompt: data.prompt, options: data.type==='mcq' ? (data.options||'').split(',').map(s=>s.trim()).filter(Boolean) : undefined, answer: data.type==='tf' ? (String(data.answer).toLowerCase()==='true') : Number(data.answer), explain: data.explain };
      // image
      const imgFile = fd.get('imageFile'); if (imgFile && imgFile.size) { item.image = await toDataUrl(imgFile); } else if (data.imageUrl) { item.image = data.imageUrl; }
      // audio
      const audioFile = fd.get('audioFile'); if (audioFile && audioFile.size) { item.audio = await toDataUrl(audioFile); } else if (data.audioUrl) { item.audio = data.audioUrl; }
      // video
      if (data.videoUrl) item.video = data.videoUrl;
      AppStore.upsert('questions', item);
      qForm.reset(); renderQuestions();
    })();
  });

  // Data import/export
  $('#btn-export')?.addEventListener('click', ()=>{ $('#data-json').value = AppStore.exportJSON(); });
  $('#btn-import')?.addEventListener('click', ()=>{ try { AppStore.importJSON($('#data-json').value, true); alert('تم الاستيراد'); rerender(); } catch(e){ alert(e.message||'فشل الاستيراد'); } });
  $('#btn-export-csv')?.addEventListener('click', ()=>{ const key = document.getElementById('csv-key').value; const rows = AppStore.all(key); if (!rows.length) { alert('لا توجد بيانات'); return; } const headers = Object.keys(rows[0]); const csv = [headers.join(',')].concat(rows.map(r=>headers.map(h=>JSON.stringify(r[h]??'')).join(','))).join('\n'); document.getElementById('data-csv').value = csv; });

  // Settings
  const setBot = document.getElementById('set-bot');
  const setMotion = document.getElementById('set-motion');
  function toDataUrl(file){ return new Promise((res)=>{ const r = new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(file); }); }
  function loadSettings(){ const s = AppStore.all('settings')||{}; setBot.checked = !!s.botEnabled; setMotion.checked = !s.motion ? false : true; const f = document.getElementById('site-settings'); if (f){ const site = s.site||{}; f.siteName.value = site.siteName||''; f.siteDesc.value = site.siteDesc||''; f.whatsapp.value = site.whatsapp||''; f.facebook.value = site.facebook||''; f.phone.value = site.phone||''; f.email.value = site.email||''; f.siteLogo.value = site.siteLogo||''; f.primaryColor.value = site.primaryColor||'#6d28d9'; f.accentColor.value = site.accentColor||'#ef4444'; f.radius.value = site.radius||12; if(f.botHiddenDefault) f.botHiddenDefault.value = String(!!site.botHiddenDefault); f.heroVideo.value = site.heroVideo||''; f.heroPoster.value = site.heroPoster||''; } }
  function applySiteImages(){ try{ const s = AppStore.all('settings')||{}; const site = s.site||{}; const about = document.getElementById('about-photo'); if (about && site.aboutPhoto) about.src = site.aboutPhoto; const contact = document.getElementById('contact-photo'); if (contact && site.contactPhoto) contact.src = site.contactPhoto; }catch{} }
  function saveSettings(){ const s = AppStore.all('settings')||{}; s.botEnabled = setBot.checked; s.motion = setMotion.checked; const f = document.getElementById('site-settings'); if (f){ const fd = new FormData(f); s.site = { siteName: f.siteName.value, siteDesc: f.siteDesc.value, whatsapp: f.whatsapp.value, facebook: f.facebook.value, phone: f.phone.value, email: f.email.value, siteLogo: f.siteLogo.value, heroVideo: f.heroVideo.value, heroPoster: f.heroPoster.value, aboutPhoto: f.aboutPhoto.value, contactPhoto: f.contactPhoto.value, primaryColor: f.primaryColor.value, accentColor: f.accentColor.value, radius: Number(f.radius.value||12), botHiddenDefault: (f.botHiddenDefault?.value==='true') }; const logoFile = fd.get('siteLogoFile'); const aboutFile = fd.get('aboutPhotoFile'); const contactFile = fd.get('contactPhotoFile'); const heroPosterFile = fd.get('heroPosterFile'); const ops=[]; if (logoFile && logoFile.size) ops.push(toDataUrl(logoFile).then(data=>{ s.site.siteLogo = data; })); if (aboutFile && aboutFile.size) ops.push(toDataUrl(aboutFile).then(data=>{ s.site.aboutPhoto = data; })); if (contactFile && contactFile.size) ops.push(toDataUrl(contactFile).then(data=>{ s.site.contactPhoto = data; })); if (heroPosterFile && heroPosterFile.size) ops.push(toDataUrl(heroPosterFile).then(data=>{ s.site.heroPoster = data; })); Promise.all(ops).then(()=>{ AppStore.set('settings', s); applyTheme(); applySiteImages(); }); } }
  setBot?.addEventListener('change', saveSettings);
  setMotion?.addEventListener('change', saveSettings);
  document.getElementById('site-settings')?.addEventListener('submit', (e)=>{ e.preventDefault(); saveSettings(); alert('تم الحفظ'); });

  // Subscriptions create + moderation
  const subForm = document.getElementById('sub-form');
  function fillSubUsers(){ const sel = document.getElementById('sub-user'); if (!sel) return; const users = AppStore.all('users'); sel.innerHTML = users.map(u=>`<option value="${u.id}">${u.name} (${u.email})</option>`).join(''); }
  subForm?.addEventListener('submit', (e)=>{
    e.preventDefault(); const data = Object.fromEntries(new FormData(subForm).entries());
    const item = { id: data.id || AppStore.nextId('sub'), userId: data.userId||null, email: data.email||'', status: data.status||'مقبول' };
    AppStore.upsert('subscriptions', item); subForm.reset(); renderSubs(); alert('تم حفظ الاشتراك');
  });
  function renderSubs(){
    fillSubUsers();
    const list = AppStore.all('subscriptions');
    const wrap = document.getElementById('subs-list');
    wrap.innerHTML = list.length ? list.map(s=>`<div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:.5rem">
      <div><b>${s.email||s.userId||'غير محدد'}</b> · الحالة: <span class="badge">${s.status||'بانتظار التفعيل'}</span></div>
      <div>
        <button class="btn" data-approve="${s.id}">موافقة</button>
        <button class="btn" data-reject="${s.id}">رفض</button>
        <button class="btn" data-delete="${s.id}">حذف</button>
      </div>
    </div>`).join('') : '<p>لا توجد طلبات.</p>';
    wrap.querySelectorAll('button[data-approve]').forEach(b=>b.addEventListener('click',()=>{ const raw=b.getAttribute('data-approve'); const s = AppStore.getById('subscriptions', raw) || AppStore.getById('subscriptions', Number(raw)); if(s){ s.status='مقبول'; AppStore.upsert('subscriptions', s); renderSubs(); }}));
    wrap.querySelectorAll('button[data-reject]').forEach(b=>b.addEventListener('click',()=>{ const raw=b.getAttribute('data-reject'); const s = AppStore.getById('subscriptions', raw) || AppStore.getById('subscriptions', Number(raw)); if(s){ s.status='مرفوض'; AppStore.upsert('subscriptions', s); renderSubs(); }}));
    wrap.querySelectorAll('button[data-delete]').forEach(b=>b.addEventListener('click',()=>{ const raw=b.getAttribute('data-delete'); const s = AppStore.getById('subscriptions', raw) || AppStore.getById('subscriptions', Number(raw)); if(s){ AppStore.remove('subscriptions', s.id); renderSubs(); } }));
  }

  // Bookings moderation
  function renderBookings(){
    const list = AppStore.all('bookings');
    const wrap = document.getElementById('bookings-list');
    wrap.innerHTML = list.length ? list.map(s=>`<div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:.5rem">
      <div><b>${s.childName||'بدون اسم'}</b> (${s.age||'?'}) · ${s.preferredTime||''} · الحالة: <span class="badge">${s.status||'بانتظار المراجعة'}</span></div>
      <div>
        <button class="btn" data-approve="${s.id}">موافقة</button>
        <button class="btn" data-reject="${s.id}">رفض</button>
        <button class="btn" data-delete="${s.id}">حذف</button>
      </div>
    </div>`).join('') : '<p>لا توجد طلبات.</p>';
    wrap.querySelectorAll('button[data-approve]').forEach(b=>b.addEventListener('click',()=>{ const raw=b.getAttribute('data-approve'); const s = AppStore.getById('bookings', raw) || AppStore.getById('bookings', Number(raw)); if(s){ s.status='مقبول'; AppStore.upsert('bookings', s); renderBookings(); }}));
    wrap.querySelectorAll('button[data-reject]').forEach(b=>b.addEventListener('click',()=>{ const raw=b.getAttribute('data-reject'); const s = AppStore.getById('bookings', raw) || AppStore.getById('bookings', Number(raw)); if(s){ s.status='مرفوض'; AppStore.upsert('bookings', s); renderBookings(); }}));
    wrap.querySelectorAll('button[data-delete]').forEach(b=>b.addEventListener('click',()=>{ const raw=b.getAttribute('data-delete'); const s = AppStore.getById('bookings', raw) || AppStore.getById('bookings', Number(raw)); if(s){ AppStore.remove('bookings', s.id); renderBookings(); } }));
  }

  function rerender(){ renderUsers(); renderLessons(); renderQuestions(); renderSubs(); renderBookings(); loadSettings(); }
  rerender();
})();