// Simple child-friendly mock chatbot UI with safety filters (client-side only)
(function () {
  const root = document.getElementById('chatbot-root');
  if (!root) return;

  const settings = (window.AppStore?.all('settings')) || {};
  const state = { enabled: settings.botEnabled ?? JSON.parse(localStorage.getItem('botEnabled') || 'true') };

  const panel = document.createElement('div');
  panel.className = 'chatbot';
  panel.innerHTML = `
    <div class="chatbot__panel" role="dialog" aria-label="محادثة البوت الودود">
      <div class="chatbot__header">
        <strong>المساعدة الذكية</strong>
        <div style="display:flex;gap:.25rem;align-items:center">
          <button class="btn" id="bot-hide" title="إظهار/إخفاء الشات">إخفاء</button>
          <button class="btn btn--ghost" id="bot-toggle" title="تشغيل/إيقاف">${state.enabled ? 'إيقاف' : 'تشغيل'}</button>
        </div>
      </div>
      <div class="chatbot__log" id="bot-log" aria-live="polite"></div>
      <form class="chatbot__input" id="bot-form">
        <input id="bot-input" type="text" placeholder="اكتب سؤالك بلطف..." aria-label="رسالة" ${state.enabled ? '' : 'disabled'} />
        <button class="btn btn--primary" ${state.enabled ? '' : 'disabled'}>إرسال</button>
      </form>
    </div>`;

  root.appendChild(panel);
  const log = panel.querySelector('#bot-log');
  const form = panel.querySelector('#bot-form');
  const input = panel.querySelector('#bot-input');
  const toggle = panel.querySelector('#bot-toggle');
  const hideBtn = panel.querySelector('#bot-hide');

  function addMsg(text, who) {
    const div = document.createElement('div');
    div.className = `chatbot__msg chatbot__msg--${who}`;
    div.textContent = text;
    log.appendChild(div);
    log.scrollTop = log.scrollHeight;
  }
  // Apply default hidden from settings if user has no preference stored
  try {
    const prefExists = localStorage.getItem('botHidden') != null;
    if (!prefExists) {
      const s = window.AppStore?.all('settings') || {};
      const hidden = !!(s.site && s.site.botHiddenDefault);
      localStorage.setItem('botHidden', hidden ? '1' : '0');
    }
  } catch {}

  function safetyFilter(text) {
    const bad = /(عنف|سلاح|كحول|مخدر|جنس|غير مناسب|قتل)/i;
    if (bad.test(text)) return { ok: false, reason: 'هذا الموضوع غير مناسب للأطفال. لننتقل إلى شيء مفيد وآمن.' };
    return { ok: true };
  }

  let canned = [
    'مرحبًا! أنا صديقك الذكي. كيف أساعدك اليوم؟',
    'تذكّر: خصوصيتك مهمة. لا تشارك معلوماتك الشخصية مع أي أحد.',
    'هل تريد تمرينًا قصيرًا في الحساب أم القراءة؟'
  ];
  // load extra phrases if available
  fetch('/pages/about/bot-phrases.json').then(r=>r.ok?r.json():null).then(j=>{ if(j){ canned = [...(j.greetings||[]), ...(j.help||[]), ...(j.privacy||[])]; } }).catch(()=>{});

  addMsg('مرحبًا بك! أنا هنا لمساعدتك بإجابات قصيرة وواضحة.', 'bot');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!state.enabled) return;
    const text = (input.value || '').trim();
    if (!text) return;
    const safe = safetyFilter(text);
    addMsg(text, 'user');
    input.value = '';
    if (!safe.ok) {
      addMsg(safe.reason + ' إن احتجت، اضغط زر الطوارئ لرسالة موجهة للوالدين.', 'bot');
      return;
    }
    // Simple intent-based reply + site-wide search
    const t = text.toLowerCase();
    let reply = canned[Math.floor(Math.random() * canned.length)];
    // site search across lessons, questions, pages
    function searchSite(q){
      try{
        const lessons = (window.AppStore?.all('lessons'))||[];
        const lres = lessons.filter(l => [l.title,l.topic,l.desc].some(v=> (v||'').toLowerCase().includes(q)));
        const questions = (window.AppStore?.all('questions'))||[];
        const qres = questions.filter(x => [x.prompt,x.skill].some(v=> (v||'').toLowerCase().includes(q)));
        const pages = [
          {title:'التعلّم', href:'/pages/learning/index.html'},
          {title:'الأنشطة والألعاب', href:'/pages/activities/index.html'},
          {title:'عنّي', href:'/pages/about/index.html'},
          {title:'التواصل', href:'/pages/contact/index.html'}
        ].filter(p => p.title.toLowerCase().includes(q));
        const lines = [];
        if (lres.length) lines.push(`دروس: ${lres.slice(0,3).map(x=>`"${x.title}"`).join('، ')}...`);
        if (qres.length) lines.push(`أسئلة: ${qres.slice(0,3).map(x=>`"${x.prompt}"`).join('، ')}...`);
        if (pages.length) lines.push(`صفحات: ${pages.map(p=>p.title).join('، ')}`);
        return lines.join('\n');
      }catch{ return ''; }
    }
    const intentMap = [
      [/حساب|جمع|طرح/, 'لنجرّب مسألة بسيطة: 2 + 3 = ؟ جربها في قسم الاختبارات!'],
      [/قراءة|حروف|لغة/, 'يمكنك زيارة قسم التعلّم لمشاهدة فيديو الحروف والكلمات.'],
      [/سلوك|سلوكية|نصيحة/, 'تذكّر: نستخدم كلمات لطيفة ونستأذن قبل أخذ شيء ليس لنا.'],
      [/عمر|سن|فئة/, 'اختر فئتك من البطاقات على الرئيسية لعرض محتوى مناسب.']
    ];
    for (const [re, ans] of intentMap){ if (re.test(text)) { reply = ans; break; } }
    // fallback to search summary
    const found = searchSite(t);
    if (!intentMap.some(([re])=>re.test(text)) && found) reply = `بحثت لك ووجدت نتائج:\n${found}`;
    setTimeout(() => addMsg(reply, 'bot'), 400);
  });

  toggle.addEventListener('click', () => {
    state.enabled = !state.enabled;
    localStorage.setItem('botEnabled', JSON.stringify(state.enabled));
    // sync to settings store if available
    try { const s = window.AppStore?.all('settings') || {}; s.botEnabled = state.enabled; window.AppStore?.set('settings', s); } catch {}
    toggle.textContent = state.enabled ? 'إيقاف' : 'تشغيل';
    input.disabled = !state.enabled;
    form.querySelector('button').disabled = !state.enabled;
  });

  // Hide/Show per user preference
  const HIDE_KEY = 'botHidden';
  function applyHide(){ const hidden = localStorage.getItem(HIDE_KEY)==='1'; panel.style.display = hidden ? 'none' : 'block'; hideBtn.textContent = hidden ? 'إظهار' : 'إخفاء'; }
  hideBtn.addEventListener('click', ()=>{ const hidden = localStorage.getItem(HIDE_KEY)==='1'; localStorage.setItem(HIDE_KEY, hidden?'0':'1'); applyHide(); });
  applyHide();

  // Emergency button (parental redirect)
  const emergencyBtn = document.createElement('button');
  emergencyBtn.textContent = '⚠️ زر الطوارئ';
  emergencyBtn.className = 'btn btn--ghost';
  emergencyBtn.style.margin = '8px';
  emergencyBtn.addEventListener('click', () => {
    addMsg('رسالة للوالدين: يُنصح بمراجعة نشاط الطفل والتوجيه بلطف. لمزيد من النصائح راسلونا عبر صفحة التواصل.', 'bot');
  });
  panel.querySelector('.chatbot__header').appendChild(emergencyBtn);
})();