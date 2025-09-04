// Tests engine: draw randomized non-repeating questions per session
(function(){
  const $ = sel => document.querySelector(sel);
  const play = $('#test-play');
  const setup = $('#test-setup');
  const result = $('#test-result');
  const qPrompt = $('#q-prompt');
  const qOptions = $('#q-options');
  const qMeta = $('#q-meta');
  const qTimer = $('#q-timer');
  const qFeedback = $('#q-feedback');

  let session = null; // {id, ageRange, skill, timer, questions, index, score}
  let timerH = null; let timeLeft = 0; let selected = null;

  function pickQuestions(ageRange, skill, count){
    const all = (window.AppStore?.all('questions')) || [];
    let pool = all.filter(q => q.ageRange === ageRange);
    if (skill && skill !== 'any') pool = pool.filter(q => q.skill === skill);
    if (!pool.length) return [];
    // shuffle
    pool = pool.sort(() => Math.random() - 0.5);
    const chosen = [];
    const seen = new Set();
    for (const q of pool){
      if (seen.has(q.id)) continue;
      seen.add(q.id);
      chosen.push(q);
      if (chosen.length >= count) break;
    }
    return chosen;
  }

  function renderQuestion(){
    const q = session.questions[session.index];
    if (!q){ return finish(); }
    selected = null; qFeedback.hidden = true; qFeedback.textContent='';
    qPrompt.innerHTML = '';
    // Prompt + media
    const p = document.createElement('div'); p.textContent = q.prompt; qPrompt.appendChild(p);
    if (q.image) { const img = document.createElement('img'); img.src = q.image; img.alt = 'صورة السؤال'; img.style.maxHeight='220px'; img.style.borderRadius='12px'; qPrompt.appendChild(img); }
    if (q.audio) { const aud = document.createElement('audio'); aud.controls = true; const src = document.createElement('source'); src.src = q.audio; aud.appendChild(src); qPrompt.appendChild(aud); }
    if (q.video) {
      const wrap = document.createElement('div'); wrap.style.position='relative'; wrap.style.paddingTop='56%';
      if (/youtube|vimeo/.test(q.video)) { const ifr = document.createElement('iframe'); ifr.src = q.video; ifr.title='فيديو السؤال'; ifr.loading='lazy'; ifr.style.position='absolute'; ifr.style.inset='0'; ifr.style.width='100%'; ifr.style.height='100%'; ifr.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'; ifr.allowFullscreen = true; wrap.appendChild(ifr); }
      else { const vid = document.createElement('video'); vid.controls=true; const src = document.createElement('source'); src.src=q.video; vid.appendChild(src); vid.style.position='absolute'; vid.style.inset='0'; vid.style.width='100%'; vid.style.height='100%'; wrap.appendChild(vid); }
      qPrompt.appendChild(wrap);
    }
    qMeta.textContent = `سؤال ${session.index+1} من ${session.questions.length} — نوع: ${q.type}`;
    qOptions.innerHTML = '';
    if (q.type === 'mcq'){
      q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'btn'; btn.type='button'; btn.textContent = opt;
        btn.addEventListener('click', () => { selected = i; highlight(i); });
        qOptions.appendChild(btn);
      });
    } else if (q.type === 'tf'){
      ['صح','خطأ'].forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'btn'; btn.type='button'; btn.textContent = opt;
        btn.addEventListener('click', () => { selected = (i===0); highlight(i); });
        qOptions.appendChild(btn);
      });
    }
    startTimer();
  }

  function highlight(i){
    [...qOptions.children].forEach((b, idx) => b.style.outline = idx===i ? '3px solid var(--c-primary-dark)' : 'none');
  }

  function startTimer(){
    clearInterval(timerH); qTimer.textContent = '';
    if (!session.timer || session.timer <= 0) return;
    timeLeft = session.timer; qTimer.textContent = `الوقت: ${timeLeft}s`;
    timerH = setInterval(() => {
      timeLeft--; qTimer.textContent = `الوقت: ${timeLeft}s`;
      if (timeLeft <= 0){ clearInterval(timerH); submit(); }
    }, 1000);
  }

  function submit(){
    const q = session.questions[session.index];
    let correct = false;
    if (q.type === 'mcq') correct = (selected === q.answer);
    else if (q.type === 'tf') correct = (!!selected === !!q.answer);
    if (correct) session.score++;
    qFeedback.hidden = false;
    qFeedback.textContent = correct ? 'أحسنت! إجابة صحيحة.' : `إجابة غير صحيحة. التفسير: ${q.explain || '—'}`;
    setTimeout(() => { next(); }, 800);
  }

  function next(){
    session.index++;
    if (session.index >= session.questions.length) return finish();
    renderQuestion();
  }

  function finish(){
    clearInterval(timerH);
    play.classList.add('hide');
    result.classList.remove('hide');
    const scoreText = `حصلت على ${session.score} من ${session.questions.length}.`;
    $('#result-text').textContent = scoreText;
    const uid = localStorage.getItem('currentUserId');
    const entry = { id: AppStore.nextId('sess'), userId: uid || null, startedAt: session.startedAt, finishedAt: new Date().toISOString(), score: Math.round((session.score/session.questions.length)*100), answers: [] };
    AppStore.push('sessions', entry);
    // badge
    if (session.score === session.questions.length && session.questions.length >= 3){
      AppStore.push('badges', { id: AppStore.nextId('badge'), userId: uid || null, name: 'نجم الإجابات', reason: 'إجابات كاملة في اختبار قصير', date: new Date().toISOString() });
    }
  }

  $('#submit-answer')?.addEventListener('click', () => submit());
  $('#restart')?.addEventListener('click', () => { location.reload(); });

  $('#start-test')?.addEventListener('click', () => {
    const ageRange = document.getElementById('ageRange').value;
    const skill = document.getElementById('skill').value;
    const count = Math.max(1, Math.min(30, parseInt(document.getElementById('count').value || '30', 10)));
    const timer = Math.max(0, Math.min(90, parseInt(document.getElementById('timer').value || '0', 10)));
    const qs = pickQuestions(ageRange, skill, count);
    if (!qs.length){ alert('لا توجد أسئلة كافية لهذه الإعدادات.'); return; }
    session = { id: AppStore.nextId('session'), ageRange, skill, timer, questions: qs, index: 0, score: 0, startedAt: new Date().toISOString() };
    setup.classList.add('hide'); play.classList.remove('hide');
    renderQuestion();
  });
})();