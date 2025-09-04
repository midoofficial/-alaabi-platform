// Skills & IQ exercises (expanded): MCQ/TF + Drag-Drop + Matching Cards
(function(){
  const grid = document.getElementById('skills-grid'); if (!grid) return;

  // Utility to build SVG placeholders
  function svg(label, bg='#e0f2fe'){ return 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='360' height='200'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='42'>${label}</text></svg>`); }

  // 24 exercises: 6 per age group (3–5, 6–8, 9–12, 13–15)
  // Types: mcq, tf, drag (drag & drop), match (memory matching)
  const exercises = [
    // 3–5: language & recognition
    { id:'a35_mcq_img_1', age:'3-5', title:'تسمية الصور', type:'mcq', icon:'🗣️', prompt:'ما اسم هذه الصورة؟', image: svg('🍎','#fee2e2'), options:['موز','تفاح','برتقال','كمثرى'], answer:1 },
    { id:'a35_tf_shape', age:'3-5', title:'أشكال بسيطة', type:'tf', icon:'🔷', prompt:'هذا شكل دائرة: ●', answer:false },
    { id:'a35_drag_colors', age:'3-5', title:'الألوان', type:'drag', icon:'🎨', prompt:'اسحب اللون الصحيح إلى الكلمة.', pairs:[{label:'أحمر',color:'#ef4444'},{label:'أصفر',color:'#f59e0b'},{label:'أخضر',color:'#10b981'}] },
    { id:'a35_mcq_animals', age:'3-5', title:'تمييز الحيوانات', type:'mcq', icon:'🐾', prompt:'أي صورة تدل على قطة؟', image: svg('🐱','#e0f2fe'), options:['🐶','🐱','🐰','🐭'], answer:1 },
    { id:'a35_match_pairs', age:'3-5', title:'مطابقة الصور', type:'match', icon:'🧩', prompt:'طابق الرموز المتشابهة.', cards:['🍎','🍌','🍎','🍌'] },
    { id:'a35_tf_bigsmall', age:'3-5', title:'كبير/صغير', type:'tf', icon:'↕️', prompt:'🍎 أكبر من 🐘', answer:false },

    // 6–8: patterns & simple math/logic
    { id:'a68_mcq_add', age:'6-8', title:'عملية جمع', type:'mcq', icon:'➕', prompt:'3 + 5 = ؟', options:['7','8','9','6'], answer:1 },
    { id:'a68_tf_compare', age:'6-8', title:'مقارنة أعداد', type:'tf', icon:'⚖️', prompt:'10 أكبر من 12', answer:false },
    { id:'a68_drag_seq', age:'6-8', title:'تسلسل', type:'drag', icon:'🔢', prompt:'رتّب الأرقام تصاعديًا.', order:[3,1,4,2] },
    { id:'a68_mcq_pattern', age:'6-8', title:'نمط', type:'mcq', icon:'🧩', prompt:'2, 4, 6, ؟', options:['7','8','9','10'], answer:1 },
    { id:'a68_match_ops', age:'6-8', title:'مطابقة العملية', type:'match', icon:'🧮', prompt:'طابق المسألة مع الناتج.', cards:['2+2','4','3+1','4'] },
    { id:'a68_tf_even', age:'6-8', title:'زوجي/فردي', type:'tf', icon:'2️⃣', prompt:'العدد 9 زوجي', answer:false },

    // 9–12: logic & social scenarios
    { id:'a912_mcq_logic', age:'9-12', title:'منطق بسيط', type:'mcq', icon:'🧠', prompt:'أي شكل لا ينتمي للمجموعة؟', options:['■','●','▲','◆'], answer:1 },
    { id:'a912_tf_fraction', age:'9-12', title:'كسور', type:'tf', icon:'¼', prompt:'1/2 أكبر من 3/4', answer:false },
    { id:'a912_drag_cats', age:'9-12', title:'تصنيف', type:'drag', icon:'🗃️', prompt:'اسحب الرموز تحت الفئة المناسبة.', buckets:[{name:'حيوانات',items:['🐶','🐱']},{name:'أشكال',items:['■','▲']}] },
    { id:'a912_mcq_seq', age:'9-12', title:'متسلسلة', type:'mcq', icon:'🔗', prompt:'5, 10, 15, ؟', options:['18','20','25','30'], answer:1 },
    { id:'a912_match_syn', age:'9-12', title:'مرادفات', type:'match', icon:'📚', prompt:'طابق الكلمة مع مرادفها.', cards:['سعيد','مسرور','سريع','بطيء','بطيء','سريع'] },
    { id:'a912_tf_safe', age:'9-12', title:'سلامة رقمية', type:'tf', icon:'🔐', prompt:'مشاركة كلمة المرور مع صديق أمر آمن إذا كنت تثق به.', answer:false },

    // 13–15: critical thinking
    { id:'a1315_mcq_prob', age:'13-15', title:'احتمالات', type:'mcq', icon:'🎲', prompt:'لو رميت نردًا عادلاً، احتمال ظهور 6 هو:', options:['1/3','1/4','1/6','1/2'], answer:2 },
    { id:'a1315_tf_graph', age:'13-15', title:'قراءة تمثيل', type:'tf', icon:'📈', prompt:'زيادة خطية دائمًا تعني زيادة ثابتة في النسبة المئوية.', answer:false },
    { id:'a1315_drag_args', age:'13-15', title:'حجج واستدلال', type:'drag', icon:'🧷', prompt:'اسحب الجملة إلى خانة: حقيقة / رأي.', buckets:[{name:'حقيقة',items:['درجة الغليان للماء 100°C']},{name:'رأي',items:['أفضل مادة هي الرياضيات']}] },
    { id:'a1315_mcq_logic2', age:'13-15', title:'منطق', type:'mcq', icon:'🧩', prompt:'إذا كانت كل الطيور تطير وبعض الحيوانات طيور، إذن:', options:['كل الحيوانات تطير','بعض الحيوانات تطير','لا أحد يطير','لا شيء مما سبق'], answer:1 },
    { id:'a1315_match_pairs', age:'13-15', title:'مطابقة مفاهيم', type:'match', icon:'🗂️', prompt:'طابق المصطلح مع تعريفه.', cards:['متغير','قيمة تتغير','ثابت','قيمة لا تتغير','حد','جزء من تعبير'] },
    { id:'a1315_tf_bias', age:'13-15', title:'تحيّز', type:'tf', icon:'⚖️', prompt:'الاعتماد على مصدر واحد للمعلومة قد يسبب تحيزًا.', answer:true },
  ];

  // Renderers per type
  function renderMCQ(e){
    return `<article class="card">
      <h3>${e.icon} ${e.title} <small class="badge">${e.age}</small></h3>
      <p>${e.prompt}</p>
      ${e.image ? `<img alt='صورة تمرين' src='${e.image}' style='max-height:160px;border-radius:12px'/>` : ''}
      <div class="form__actions">${e.options.map((opt,i)=>`<button class='btn' data-ans='${i}' data-id='${e.id}'>${opt}</button>`).join('')}</div>
      <p id='fb_${e.id}' class='success' hidden></p>
    </article>`;
  }
  function renderTF(e){
    return `<article class="card">
      <h3>${e.icon} ${e.title} <small class="badge">${e.age}</small></h3>
      <p>${e.prompt}</p>
      <div class="form__actions">
        <button class='btn' data-ans='true' data-id='${e.id}'>صح</button>
        <button class='btn' data-ans='false' data-id='${e.id}'>خطأ</button>
      </div>
      <p id='fb_${e.id}' class='success' hidden></p>
    </article>`;
  }
  function renderDrag(e){
    // For colors (pairs) or buckets classification
    if (e.pairs){
      const drops = e.pairs.map((p,i)=>`<div class='card' data-drop='${i}' style='min-height:48px;display:flex;align-items:center;gap:.5rem;margin:.35rem 0'>${p.label}</div>`).join('');
      const drags = e.pairs.map((p,i)=>`<div class='btn' draggable='true' data-drag='${i}' style='background:${p.color};color:#000'>${p.label}</div>`).sort(()=>Math.random()-0.5).join('');
      return `<article class='card'>
        <h3>${e.icon} ${e.title} <small class='badge'>${e.age}</small></h3>
        <p>${e.prompt}</p>
        <div>${drops}</div>
        <div class='form__actions' style='gap:.4rem;flex-wrap:wrap'>${drags}</div>
        <p id='fb_${e.id}' class='success' hidden></p>
      </article>`;
    }
    if (e.buckets){
      const zones = e.buckets.map((b,bi)=>`<div class='card' data-bucket='${bi}' style='min-height:80px'><b>${b.name}</b><div class='bucket-items'></div></div>`).join('');
      const items = e.buckets.flatMap((b,bi)=>b.items.map(x=>({x,bi}))).sort(()=>Math.random()-0.5);
      const drags = items.map((it,i)=>`<div class='btn' draggable='true' data-item='${i}'>${it.x}</div>`).join('');
      return `<article class='card'>
        <h3>${e.icon} ${e.title} <small class='badge'>${e.age}</small></h3>
        <p>${e.prompt}</p>
        <div class='grid' style='grid-template-columns:repeat(2,1fr);gap:.5rem'>${zones}</div>
        <div class='form__actions' style='gap:.4rem;flex-wrap:wrap'>${drags}</div>
        <p id='fb_${e.id}' class='success' hidden></p>
      </article>`;
    }
    if (e.order){
      const items = e.order.map((n,i)=>`<div class='btn' draggable='true' data-ord='${i}'>${n}</div>`).sort(()=>Math.random()-0.5).join('');
      return `<article class='card'>
        <h3>${e.icon} ${e.title} <small class='badge'>${e.age}</small></h3>
        <p>${e.prompt}</p>
        <div class='form__actions' style='gap:.4rem;flex-wrap:wrap' data-order-container>${items}</div>
        <button class='btn btn--ghost' data-check-order='${e.id}'>تحقّق</button>
        <p id='fb_${e.id}' class='success' hidden></p>
      </article>`;
    }
    return '';
  }
  function renderMatch(e){
    const cards = e.cards.map((c,i)=>({id:i, val:c})).sort(()=>Math.random()-0.5);
    return `<article class='card'>
      <h3>${e.icon} ${e.title} <small class='badge'>${e.age}</small></h3>
      <p>${e.prompt}</p>
      <div class='grid' style='grid-template-columns:repeat(4,1fr);gap:.4rem' data-match='${e.id}'>
        ${cards.map(c=>`<button class='btn' data-card='${c.id}' data-val='${c.val}'>?</button>`).join('')}
      </div>
      <p id='fb_${e.id}' class='success' hidden></p>
    </article>`;
  }

  function render(e){
    if (e.type==='mcq') return renderMCQ(e);
    if (e.type==='tf') return renderTF(e);
    if (e.type==='drag') return renderDrag(e);
    if (e.type==='match') return renderMatch(e);
    return '';
  }

  grid.innerHTML = exercises.map(render).join('');

  // Timers per exercise (optional simple demo): 20s countdown for each card
  function attachTimers(){
    grid.querySelectorAll('article.card').forEach(card=>{
      const idEl = card.querySelector('[id^=fb_]'); if (!idEl) return;
      const id = idEl.id.replace('fb_','');
      const timer = document.createElement('span'); timer.className = 'badge'; timer.style.marginInlineStart='.5rem';
      let t = 20; timer.textContent = `الوقت: ${t}s`;
      const h = setInterval(()=>{ t--; timer.textContent = `الوقت: ${t}s`; if (t<=0){ clearInterval(h); idEl.hidden=false; idEl.textContent='انتهى الوقت!'; }
      }, 1000);
      const hider = (ev)=>{ if (ev.target.closest(`[data-id='${id}']`) || ev.target.closest('[data-ans]') || ev.target.closest('[data-drag]') || ev.target.closest('[data-item]') || ev.target.closest('[data-check-order]')){ clearInterval(h); } };
      card.querySelector('.form__actions')?.addEventListener('click', hider, { once:true });
      card.querySelector('[data-match]')?.addEventListener('click', hider, { once:true });
      card.querySelector('h3')?.appendChild(timer);
    });
  }

  // attachTimers(); // توقيف المؤقتات — المطلوب ألعاب دون وقت محدد

  // Interactions
  function feedback(id, ok, msgOk='أحسنت! إجابة صحيحة.', msgNo='قريبة! جرّب مرة أخرى.'){
    const fb = document.getElementById('fb_'+id); if (!fb) return;
    fb.hidden = false; fb.textContent = ok ? msgOk : msgNo; setTimeout(()=> fb.hidden = true, 1600);
    // track score per exercise + award badges
    try {
      const uid = localStorage.getItem('currentUserId');
      const key = 'skills_scores';
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push({ id, ok, userId: uid||null, at: new Date().toISOString() });
      localStorage.setItem(key, JSON.stringify(arr));

      // Award badges via AppStore when available
      const S = window.AppStore;
      function grantOnce(name, reason){
        try {
          if (!S) return;
          const all = S.all('badges') || [];
          if (all.some(b => b.userId === uid && b.name === name)) return; // already earned
          S.push('badges', { id: S.nextId('b'), userId: uid||null, name, reason, date: new Date().toISOString() });
        } catch {}
      }

      // Only award on correct attempts
      if (ok){
        const mine = arr.filter(x => x.userId === uid && x.ok);
        // 1) First correct
        if (mine.length === 1) grantOnce('أول إنجاز', 'أول إجابة صحيحة في الألعاب');
        // 2) Five correct overall
        if (mine.length >= 5) grantOnce('نجم المهارات', 'خمس إجابات صحيحة في الألعاب');
        // 3) Multi-type mastery: correct in mcq, tf, drag, match
        const typesOk = new Set(mine.map(x => (exercises.find(e=>e.id===x.id)||{}).type).filter(Boolean));
        if (['mcq','tf','drag','match'].every(t => typesOk.has(t))) grantOnce('متعدد المهارات', 'إنجاز صحيح في جميع أنماط الألعاب');
      }
    } catch {}
  }

  // MCQ + TF
  grid.addEventListener('click', (e)=>{
    const btn = e.target.closest('button.btn'); if (!btn) return;
    const id = btn.getAttribute('data-id');
    const ansIdx = btn.getAttribute('data-ans');
    if (id && ansIdx!=null){
      const ex = exercises.find(x=>x.id===id); if (!ex) return;
      const ok = (String(ansIdx) === String(ex.answer));
      feedback(id, ok);
    }
  });

  // Drag & Drop helpers
  function enableDnD(){
    // color pairs
    grid.querySelectorAll('[data-drag]').forEach(el => {
      el.addEventListener('dragstart', ev=>{ ev.dataTransfer.setData('text/plain', el.getAttribute('data-drag')); });
    });
    grid.querySelectorAll('[data-drop]').forEach(drop => {
      drop.addEventListener('dragover', ev=>ev.preventDefault());
      drop.addEventListener('drop', ev=>{
        ev.preventDefault();
        const idx = ev.dataTransfer.getData('text/plain');
        const expect = drop.getAttribute('data-drop');
        const ok = String(idx)===String(expect);
        if (ok){ drop.style.outline='3px solid #10b981'; feedback(drop.closest('article').querySelector('[id^=fb_]').id.replace('fb_',''), true, 'رائع!'); }
        else { drop.style.outline='3px solid #ef4444'; feedback(drop.closest('article').querySelector('[id^=fb_]').id.replace('fb_',''), false); }
      });
    });

    // buckets classification
    grid.querySelectorAll('[data-item]').forEach(el=>{
      el.addEventListener('dragstart', ev=>{ ev.dataTransfer.setData('text/plain', el.getAttribute('data-item')); });
    });
    grid.querySelectorAll('[data-bucket]').forEach(zone=>{
      zone.addEventListener('dragover', ev=>ev.preventDefault());
      zone.addEventListener('drop', ev=>{
        ev.preventDefault();
        const idx = Number(ev.dataTransfer.getData('text/plain'));
        const lists = Array.from(grid.querySelectorAll('[data-bucket]'));
        const allItems = lists.flatMap((z,bi)=>Array.from(z.querySelectorAll('.bucket-items .btn')).map(btn=>btn.textContent));
        // Just move element
        const sourceBtn = grid.querySelector(`[data-item='${idx}']`);
        if (sourceBtn){ zone.querySelector('.bucket-items').appendChild(sourceBtn); }
        feedback(zone.closest('article').querySelector('[id^=fb_]').id.replace('fb_',''), true, 'تم التصنيف');
      });
    });

    // order verification
    grid.querySelectorAll('[data-check-order]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.getAttribute('data-check-order');
        const ex = exercises.find(x=>x.id===id); if (!ex || !ex.order) return;
        const cont = btn.previousElementSibling;
        const nums = Array.from(cont.querySelectorAll('[data-ord]')).map(el=>Number(el.textContent));
        const sorted = [...nums].sort((a,b)=>a-b);
        const ok = JSON.stringify(nums)===JSON.stringify(sorted);
        feedback(id, ok, ok ? 'ترتيب صحيح!' : 'تحقّق من الترتيب');
      });
    });
  }
  enableDnD();

  // Matching cards interaction (simple 2-by-2)
  const openState = {}; // id -> {first:null|string}
  grid.querySelectorAll('[data-match]').forEach(wrap=>{
    const id = wrap.getAttribute('data-match'); openState[id] = { first:null };
    wrap.addEventListener('click', (e)=>{
      const b = e.target.closest('button[data-card]'); if (!b) return;
      const val = b.getAttribute('data-val');
      b.textContent = val; b.disabled = true;
      const st = openState[id];
      if (!st.first){ st.first = val; return; }
      const ok = (st.first === val); st.first = null;
      feedback(id, ok, 'مطابقة صحيحة!', 'ليست مطابقة.');
      if (!ok){ setTimeout(()=>{ // reset wrong try
        wrap.querySelectorAll('button[disabled]').forEach(bt=>{ bt.disabled=false; bt.textContent='?'; });
      }, 600); }
    });
  });
})();