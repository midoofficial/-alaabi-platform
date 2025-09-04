// Simple local auth (demo only) with roles and activation
(function(){
  const S = window.AppStore;
  function msg(el, text){ el.textContent = text; el.hidden = false; setTimeout(()=> el.hidden=true, 4000); }

  const loginForm = document.getElementById('login-form');
  if (loginForm){
    loginForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(loginForm).entries());
      const users = S.all('users');
      const u = users.find(x => (x.email === data.email || x.name === data.email) && x.passwordHash === data.password);
      const m = document.getElementById('login-msg');
      if (!u) return msg(m, 'بيانات غير صحيحة');
      const now = Date.now();
      const trialOk = !!u.trialEndsAt && now < Number(u.trialEndsAt);
      if (!u.active && !trialOk) return msg(m, 'الحساب بانتظار التفعيل. لديك تجربة مجانية لمدة يومين عند التسجيل.');
      localStorage.setItem('currentUserId', u.id);
      msg(m, trialOk && !u.active ? 'تم تسجيل الدخول (تجربة مجانية فعّالة)' : 'تم تسجيل الدخول');
      setTimeout(()=> location.href = u.role === 'admin' ? '/pages/admin/index.html' : '/pages/dashboard/index.html', 600);
    });
  }

  const regForm = document.getElementById('register-form');
  if (regForm){
    regForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const data = Object.fromEntries(new FormData(regForm).entries());
      const exists = S.all('users').some(x => x.email === data.email);
      const m = document.getElementById('register-msg');
      if (exists) return msg(m, 'البريد مستخدم بالفعل');
      const twoDays = 2*24*60*60*1000;
      const user = { id: S.nextId('u'), role: 'parent', name: data.name, email: data.email, passwordHash: data.password, active: false, trialEndsAt: Date.now() + twoDays };
      S.push('users', user);
      msg(m, 'تم إنشاء الحساب. فُعّلت تجربة مجانية لمدة يومين. يمكنك تسجيل الدخول الآن.');
      regForm.reset();
    });
  }

  const resetForm = document.getElementById('reset-form');
  if (resetForm){
    resetForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const m = document.getElementById('reset-msg');
      msg(m, 'تم إرسال تعليمات وهمية للاستعادة.');
    });
  }
})();