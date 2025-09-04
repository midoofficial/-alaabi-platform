// Seed initial demo data if empty
(function(){
  const S = window.AppStore;
  if (!S) return;

  function ensure(key, items){ if ((S.all(key) || []).length === 0) S.set(key, items); }

  ensure('users', [
    { id: 'u_admin', role: 'admin', name: 'admin', email: 'admin@example.com', passwordHash: '753159', active: true },
    { id: 'u_parent', role: 'parent', name: 'ولي أمر', email: 'parent@example.com', passwordHash: '123456', active: true },
    { id: 'u_student', role: 'student', name: 'طالب', email: 'student@example.com', passwordHash: '123456', active: true }
  ]);
  // migration: fix older seed where admin email was 'admin'
  try {
    const users = S.all('users') || [];
    let changed = false;
    users.forEach(u=>{
      if (u.role==='admin' && (u.email==='admin' || !u.email)) { u.email = 'admin@example.com'; changed = true; }
      if (u.role==='admin' && !u.active) { u.active = true; changed = true; }
    });
    if (changed) S.set('users', users);
  } catch {}

  ensure('lessons', [
    { id: 'l1', title: 'الأعداد من 1 إلى 5', ageRange: '3-5', topic: 'رياضيات', type: 'video', src: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 'l2', title: 'حروف العربية: أ، ب، ت', ageRange: '6-8', topic: 'لغة', type: 'video', src: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { id: 'l3', title: 'التعاون مع الأصدقاء', ageRange: '9-12', topic: 'اجتماعي', type: 'article', src: '#' }
  ]);

  // Build or extend questions to 120 (30 لكل فئة)
  (function seedQuestions(){
    const existing = S.all('questions') || [];
    const map = new Map(existing.map(q => [q.id, q]));

    function svgData(label){
      const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='240'><rect width='100%' height='100%' fill='#FDE68A'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='52' font-family='Tahoma'>${label}</text></svg>`;
      return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    }

    function add(q){ map.set(q.id, q); }

    const ranges = ['3-5','6-8','9-12','13-15'];
    for (const age of ranges){
      for (let i=1;i<=30;i++){
        const skill = ['معرفية','لغوية','حركية','اجتماعية'][i%4];
        const id = `q_${age.replace('-', '')}_${i}`;
        let q = null;
        if (age === '3-5'){
          const type = (i%3===0) ? 'tf' : 'mcq';
          if (type==='mcq'){
            const n = (i%5)+1;
            q = { id, ageRange: age, skill, level: 1, type, prompt: 'كم عدد النجوم في الصورة؟', image: svgData(`★ × ${n}`), options:[String(n-1), String(n), String(n+1), String(n+2)], answer: 1, explain:'عدّ النجوم ثم اختر العدد الصحيح.' };
          } else {
            const truth = (i%2===0);
            q = { id, ageRange: age, skill, level: 1, type, prompt: truth ? 'أ هو أول حرف في الأبجدية العربية.' : 'ز هو أول حرف في الأبجدية العربية.', answer: truth, explain: truth ? 'ترتيب الحروف يبدأ بـ أ' : 'الحرف الأول هو أ وليس ز' };
          }
        } else if (age === '6-8'){
          const type = (i%4===0) ? 'tf' : 'mcq';
          if (type==='mcq'){
            const a = (i%10)+1, b = ((i*2)%10)+1; const c = a + b;
            q = { id, ageRange: age, skill, level: 2, type, prompt: `${a} + ${b} = ؟`, image: (i%3===0)? svgData(`${a} + ${b}`) : undefined, options:[String(c-1), String(c), String(c+1), String(c+2)], answer: 1, explain:`المجموع ${a}+${b} = ${c}` };
          } else {
            const stmtOk = (i%2===0);
            q = { id, ageRange: age, skill, level: 2, type, prompt: stmtOk ? '10 أكبر من 7.' : '4 أكبر من 9.', answer: stmtOk, explain: stmtOk ? '10 > 7' : '4 أصغر من 9' };
          }
        } else if (age === '9-12'){
          const type = (i%5===0) ? 'tf' : 'mcq';
          if (type==='mcq'){
            q = { id, ageRange: age, skill, level: 2, type, prompt: 'مرادف "سعيد" هو:', image: (i%3===0)? svgData('سعيد = ؟') : undefined, options:['حزين','مسرور','غاضب','قلق'], answer: 1, explain:'مرادف سعيد هو مسرور.' };
          } else {
            const ok = (i%2===0);
            q = { id, ageRange: age, skill, level: 2, type, prompt: ok ? 'الجملة تحتوي فعلاً: "قرأ الطالب الدرس".' : 'الجملة تحتوي فعلاً: "الطالب مجتهد".', answer: ok, explain: ok ? 'قرأ: فعل ماضٍ' : 'الجملة الاسمية بلا فعل' };
          }
        } else { // 13-15
          const type = (i%3===0) ? 'mcq' : 'tf';
          if (type==='tf'){
            const ok = (i%2===0);
            q = { id, ageRange: age, skill, level: 3, type, prompt: ok ? 'لا تشارك كلمة المرور مع أي شخص.' : 'من الآمن نشر عنوان المنزل على الإنترنت.', answer: ok, explain: 'أمان رقمي أساسي.' };
          } else {
            q = { id, ageRange: age, skill, level: 3, type, prompt: 'ما أفضل تصرّف إذا وصلتك رسالة مزعجة؟', options:['الردّ بعنف','تجاهل وابلاغ ولي الأمر','مشاركة البيانات','نشر الرسالة'], answer: 1, explain:'التجاهل مع إبلاغ ولي الأمر خطوة سليمة.' };
          }
        }
        if (i%10===0) q.video = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
        if (i%7===0) q.audio = '/assets/audio/sample-audio.mp3';
        add(q);
      }
    }

    S.set('questions', Array.from(map.values()));
  })();

  ensure('settings', { botEnabled: true, motion: true, site: { email: 'admin@example.com' } });

  // Add a few hand-crafted questions (no timers needed)
  const qs = (S.all('questions')||[]);
  function addQ(q){ if(!qs.find(x=>x.id===q.id)) qs.push(q); }
  addQ({ id:'q_hand_1', ageRange:'6-8', skill:'رياضيات', level:1, type:'mcq', prompt:'ما ناتج 2 + 3؟', options:['4','5','6','7'], answer:1, explain:'2+3=5' });
  addQ({ id:'q_hand_2', ageRange:'9-12', skill:'لغة', level:2, type:'tf', prompt:'جمع كلمة "كتاب" هو "كتب".', answer:true, explain:'كتاب ← كتب' });
  addQ({ id:'q_hand_3', ageRange:'3-5', skill:'ألوان', level:1, type:'mcq', prompt:'اختر اللون الأحمر', options:['أحمر','أزرق','أصفر','أخضر'], answer:0, explain:'الأحمر هو المطلوب' });
  S.set('questions', qs);
})();