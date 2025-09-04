// App bootstrap: header/footer, navigation, theme, SW
(function () {
  const header = document.getElementById('site-header');
  const footer = document.getElementById('site-footer');

  function currentUser(){ try{ const id = localStorage.getItem('currentUserId'); return (window.AppStore?.all('users')||[]).find(u=>u.id===id)||null; }catch{ return null; } }

  function buildNav(){
    const u = currentUser();
    const items = [
      { href: '/', label: 'الرئيسية' },
      { href: '/pages/learning/kids.html', label: 'تعلم رياض الأطفال' },
      { href: '/pages/activities/index.html', label: 'الأنشطة والألعاب' },
      { href: '/pages/about/index.html', label: 'عنّي' },
      { href: '/pages/contact/index.html', label: 'التواصل' },
      { href: '/pages/booking/index.html', label: 'الاشتراك' }
    ];
    if (u) items.push({ href: '/pages/account/index.html', label: 'حسابي' });
    else items.push({ href: '/pages/auth/login.html', label: 'تسجيل الدخول' });
    if (u && u.role === 'admin') items.push({ href: '/pages/admin/index.html', label: 'لوحة المدير' });
    return items;
  }

  const makeHeader = () => `
    <div class="header">
      <div class="container nav">
        <a class="brand" href="/">
          <img id="site-logo" class="brand__logo-img" alt="شعار" />
          <span>ألعابي مع الأخصائية ميرنا السيد</span>
        </a>
        <nav class="menu" aria-label="التنقّل الرئيسي">
          ${buildNav().map(i => `<a href="${i.href}" ${isActive(i.href) ? 'class=\"active\"' : ''}>${i.label}</a>`).join('')}
        </nav>
      </div>
      <div class="container" style="padding:.4rem 0;display:flex;gap:.5rem;justify-content:flex-end;flex-wrap:wrap">
        <div class="header__contacts" style="display:flex;gap:.4rem;align-items:center">
          <a id="link-wa" class="wa" href="https://wa.me/201000000000" target="_blank" rel="noopener" title="واتساب"><svg class="icon-svg"><use href="#i-wa"></use></svg></a>
          <a id="link-fb" class="fb" href="https://facebook.com" target="_blank" rel="noopener" title="فيسبوك"><svg class="icon-svg"><use href="#i-fb"></use></svg></a>
          <a id="link-mail" class="mail" href="mailto:info@example.com" title="البريد"><svg class="icon-svg"><use href="#i-mail"></use></svg></a>
          <a id="link-call" class="call" href="tel:+201000000000" title="اتصال"><svg class="icon-svg"><use href="#i-call"></use></svg></a>
        </div>
        ${ currentUser() ? '<a id="btn-logout" class="btn btn--ghost" href="#"><svg class="icon-svg" aria-hidden="true"><use href="#i-logout"></use></svg> خروج</a>' : '' }
      </div>
    </div>`;

  const makeFooter = () => `
    <div class="footer">
      <div class="container footer__grid">
        <div>
          <b>عن المنصّة</b>
          <p>منصّة عربية ممتعة وآمنة للأطفال للتعلّم باللعب والاختبارات وبرامج تعديل السلوك.</p>
        </div>
        <div>
          <b>روابط</b>
          <ul>
            <li><a href="/pages/privacy/index.html">سياسة الخصوصية</a></li>
            <li><a href="/pages/contact/index.html">تواصل معنا</a></li>
          </ul>
        </div>
        <div>
          <b>تواصل سريع</b>
          <p>
            <a href="https://wa.me/201000000000" target="_blank" rel="noopener">واتساب</a> ·
            <a href="tel:+201000000000">اتصال</a> ·
            <a href="https://facebook.com" target="_blank" rel="noopener">فيسبوك</a>
          </p>
        </div>
      </div>
    </div>`;

  function isActive(href) {
    try {
      const here = location.pathname.replace(/\\/g, '/');
      if (href === '/') return here === '/' || here.endsWith('/index.html');
      return here.startsWith(href);
    } catch { return false; }
  }

  if (header) header.innerHTML = makeHeader();
  if (footer) footer.innerHTML = makeFooter();

  // Access control: lock activities/games for premium only and block admin page for non-admin
  (function accessControl(){
    const path = location.pathname.replace(/\\/g,'/');
    const uid = localStorage.getItem('currentUserId');
    const users = (window.AppStore?.all('users')) || [];
    const subs = (window.AppStore?.all('subscriptions')) || [];
    const u = users.find(x => x.id === uid);

    // Premium lock: skills فقط. الأنشطة مسموحة للعرض دون تفاعل
    const restricted = ['/pages/skills/'];
    const isRestricted = restricted.some(p => path.startsWith(p));
    if (isRestricted){
      const hasActiveSub = !!(u && subs.some(s => (s.userId===u?.id || s.email===u?.email) && s.status==='مقبول'));
      const now = Date.now();
      const trialOk = !!u?.trialEndsAt && now < Number(u.trialEndsAt);
      const premium = !!(u && (u.active && hasActiveSub || trialOk));
      if (!premium){
        alert('هذه الصفحة للأعضاء المميزين فقط. اشترك أو استخدم التجربة المجانية (يومين للمستخدمين الجدد).');
        location.href = '/pages/booking/index.html';
        return;
      }
    }

    // Admin lock
    if (path.startsWith('/pages/admin/')){
      if (!(u && u.role === 'admin')){
        alert('غير مصرح لك بدخول لوحة الإدارة.');
        location.href = '/';
        return;
      }
    }
  })();

  // Apply site links and theme from settings
  try {
    const s = (window.AppStore?.all('settings')) || {};
    const site = s.site || {};
    const wa = document.getElementById('link-wa'); if (wa && site.whatsapp) wa.href = site.whatsapp;
    const fb = document.getElementById('link-fb'); if (fb && site.facebook) fb.href = site.facebook;
    const call = document.getElementById('link-call'); if (call && site.phone) call.href = `tel:${site.phone}`;
    const mail = document.getElementById('link-mail'); if (mail && site.email) { mail.href = `mailto:${site.email}`; mail.title = `البريد: ${site.email}`; }
    if (site.siteName) document.title = site.siteName;
    if (site.siteLogo){ const img = document.getElementById('site-logo'); if (img) img.src = site.siteLogo; }
    const about = document.getElementById('about-photo'); if (about && site.aboutPhoto) about.src = site.aboutPhoto;
    const contact = document.getElementById('contact-photo'); if (contact && site.contactPhoto) contact.src = site.contactPhoto;
    // Hero video (homepage)
    try {
      const heroVid = document.getElementById('hero-video');
      const heroWrap = document.getElementById('hero-video-wrap');
      if (heroWrap && heroVid){
        if (site.heroVideo){
          // Try to embed known platforms else fallback to <video>
          const src = site.heroVideo;
          const yt = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/i);
          const vimeo = src.match(/vimeo\.com\/(\d+)/i);
          const dm = src.match(/dailymotion\.com\/video\/([\w-]+)/i);
          heroWrap.innerHTML = '';
          if (yt){ heroWrap.innerHTML = `<div style="position:relative;padding-top:56%"><iframe src="https://www.youtube.com/embed/${yt[1]}" title="Intro" style="position:absolute;inset:0;width:100%;height:100%" allowfullscreen loading="lazy"></iframe></div>`; }
          else if (vimeo){ heroWrap.innerHTML = `<div style="position:relative;padding-top:56%"><iframe src="https://player.vimeo.com/video/${vimeo[1]}" title="Intro" style="position:absolute;inset:0;width:100%;height:100%" allowfullscreen loading="lazy"></iframe></div>`; }
          else if (dm){ heroWrap.innerHTML = `<div style="position:relative;padding-top:56%"><iframe src="https://www.dailymotion.com/embed/video/${dm[1]}" title="Intro" style="position:absolute;inset:0;width:100%;height:100%" allowfullscreen loading="lazy"></iframe></div>`; }
          else {
            heroWrap.innerHTML = `<video id="hero-video" controls preload="none" ${site.heroPoster?`poster=\"${site.heroPoster}\"`:''} class="video"><source src="${src}" type="video/mp4" />متصفحك لا يدعم تشغيل الفيديو.</video>`;
          }
        } else if (site.heroPoster) {
          heroVid?.setAttribute('poster', site.heroPoster);
        }
      }
    } catch {}
    // CSS theme variables
    if (site.primaryColor) document.documentElement.style.setProperty('--c-primary', site.primaryColor);
    if (site.accentColor) document.documentElement.style.setProperty('--c-accent', site.accentColor);
    if (site.radius != null) document.documentElement.style.setProperty('--radius', site.radius + 'px');
  } catch {}

  // Register Service Worker if available
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  // Inject SVG sprite once
  (function injectSprite(){
    if (document.getElementById('svg-sprite')) return;
    const div = document.createElement('div'); div.style.position='absolute'; div.style.width='0'; div.style.height='0'; div.style.overflow='hidden';
    div.innerHTML = `
    <svg id="svg-sprite" xmlns="http://www.w3.org/2000/svg" style="display:none">
      <symbol id="i-controller" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12l3-3h3l3-3 3 3h3l3 3"/><circle cx="8" cy="15" r="1"/><circle cx="16" cy="15" r="1"/></symbol>
      <symbol id="i-puzzle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 8a2 2 0 11-4 0 2 2 0 014 0z"/><path d="M20 8h-4v4h4v-1a2 2 0 110-2V8zM8 12V8H4v4h1a2 2 0 110 2H4v4h4v-1a2 2 0 114 0v1h4v-4h-1a2 2 0 110-2h1V8h-4v1a2 2 0 11-4 0V8z"/></symbol>
      <symbol id="i-star" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9 12 2"/></symbol>
      <symbol id="i-logout" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></symbol>
      <symbol id="i-wa" viewBox="0 0 24 24" fill="currentColor"><path d="M20.52 3.48A11.94 11.94 0 0012 0C5.37 0 .06 5.31.06 11.86c0 2.09.54 4.15 1.56 5.97L0 24l6.35-1.66a11.83 11.83 0 005.65 1.44h.01c6.63 0 11.94-5.31 11.94-11.86 0-3.18-1.24-6.17-3.43-8.44z"/></symbol>
      <symbol id="i-fb" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.1 3-3.1.9 0 1.8.16 1.8.16v2h-1c-1 0-1.3.62-1.3 1.26V12h2.2l-.35 3h-1.85v7A10 10 0 0022 12z"/></symbol>
      <symbol id="i-call" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.86 19.86 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.86 19.86 0 012 4.18 2 2 0 014 2h3a2 2 0 012 1.72c.12.9.3 1.77.57 2.61a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.47-1.47a2 2 0 012.11-.45c.84.27 1.71.45 2.61.57A2 2 0 0122 16.92z"/></symbol>
      <symbol id="i-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z"/><path d="M22 6l-10 7L2 6"/></symbol>
    </svg>`;
    document.body.appendChild(div);
  })();

  // Real-time UI refresh hooks
  (function realtimeUI(){
    function refreshQuick(){
      // re-apply site links/theme, and simple re-renderers if needed
      try {
        const s = (window.AppStore?.all('settings')) || {}; const site = s.site || {};
        const wa = document.getElementById('link-wa'); if (wa && site.whatsapp) wa.href = site.whatsapp;
        const fb = document.getElementById('link-fb'); if (fb && site.facebook) fb.href = site.facebook;
        const call = document.getElementById('link-call'); if (call && site.phone) call.href = `tel:${site.phone}`;
      } catch {}
    }
    // logout action
    document.getElementById('btn-logout')?.addEventListener('click', (e)=>{
      e.preventDefault();
      localStorage.removeItem('currentUserId');
      alert('تم تسجيل الخروج.');
      location.href = '/';
    });
    window.addEventListener('store:changed', refreshQuick);
    try { const ch = new BroadcastChannel('app-sync'); ch.onmessage = refreshQuick; } catch {}
  })();

  // Floating contact buttons
  (function floatingContact(){
    const wrap = document.createElement('div'); wrap.className='fab';
    wrap.innerHTML = `
      <a id="fab-wa" class="fab__wa" href="#" target="_blank" rel="noopener" title="واتساب"><svg class="icon-svg"><use href="#i-wa"></use></svg></a>
      <a id="fab-fb" class="fab__fb" href="#" target="_blank" rel="noopener" title="فيسبوك"><svg class="icon-svg"><use href="#i-fb"></use></svg></a>
      <a id="fab-call" class="fab__call" href="#" title="اتصال"><svg class="icon-svg"><use href="#i-call"></use></svg></a>
      <a id="fab-admin" class="fab__admin" href="/pages/admin/index.html" title="لوحة المدير" aria-label="لوحة المدير">⚙️</a>
    `;
    document.body.appendChild(wrap);
    try {
      const s = (window.AppStore?.all('settings')) || {}; const site = s.site || {};
      const w = document.getElementById('fab-wa'); const f = document.getElementById('fab-fb'); const c = document.getElementById('fab-call'); const a = document.getElementById('fab-admin');
      if (site.whatsapp) w.href = site.whatsapp; if (site.facebook) f.href = site.facebook; if (site.phone) c.href = `tel:${site.phone}`;
      const u = (function(){ try{ const id = localStorage.getItem('currentUserId'); return (window.AppStore?.all('users')||[]).find(u=>u.id===id)||null; }catch{ return null; } })();
      if (!(u && u.role==='admin')) a.style.display = 'none';
    } catch {}
  })();

  // Welcome toast on first visit per session
  (function welcomeToast(){
    if (sessionStorage.getItem('welcomed')) return;
    const t = document.createElement('div'); t.className='toast'; t.innerHTML = `<svg class="icon-svg"><use href="#i-star"></use></svg><span>مرحبًا بك في منصّة ألعابي! نتمنى لك تجربة ممتعة.</span> <button class='toast__close' aria-label='إغلاق'>&times;</button>`;
    document.body.appendChild(t);
    t.querySelector('.toast__close')?.addEventListener('click', ()=> t.remove());
    setTimeout(()=>{ try{ t.remove(); }catch{} }, 6000);
    sessionStorage.setItem('welcomed','1');
  })();

})();