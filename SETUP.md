# دليل الإعداد السريع - منصة ألعابي

## 🚀 النشر السريع على Netlify (بدون Git)

### الطريقة الأولى: السحب والإفلات المباشر

1. **اذهب إلى [netlify.com](https://netlify.com)**
2. **سجل دخول أو أنشئ حساب جديد**
3. **اضغط على "Sites" في القائمة الجانبية**
4. **اسحب مجلد المشروع كاملاً** (`d:\منصة العابي`) إلى المنطقة المخصصة
5. **انتظر اكتمال النشر** (عادة 1-2 دقيقة)
6. **احصل على الرابط** (مثل: `amazing-site-123456.netlify.app`)

### الطريقة الثانية: رفع ملف مضغوط

1. **اضغط بالزر الأيمن على مجلد المشروع**
2. **اختر "Send to" > "Compressed folder"**
3. **في Netlify، اضغط "Deploy manually"**
4. **اسحب الملف المضغوط**
5. **انتظر النشر**

---

## 🔧 إعداد Git (للنشر التلقائي)

### تثبيت Git

#### على Windows:
1. **حمّل Git من**: https://git-scm.com/download/win
2. **ثبّت البرنامج** مع الإعدادات الافتراضية
3. **أعد تشغيل PowerShell/Command Prompt**

#### التحقق من التثبيت:
```bash
git --version
```

### إعداد Git للمرة الأولى:
```bash
git config --global user.name "اسمك"
git config --global user.email "your-email@example.com"
```

---

## 📁 إعداد المستودع

### في مجلد المشروع:
```bash
# الانتقال لمجلد المشروع
cd "d:\منصة العابي"

# إنشاء مستودع Git
git init

# إضافة جميع الملفات
git add .

# أول commit
git commit -m "إعداد منصة ألعابي - النسخة الأولى"
```

### ربط بـ GitHub:

1. **اذهب إلى [github.com](https://github.com)**
2. **اضغط "New repository"**
3. **اسم المستودع**: `alaaби-platform` (أو أي اسم تريده)
4. **اتركه Public** (أو Private حسب الرغبة)
5. **لا تضع ✅ في README, .gitignore, license** (لأنها موجودة)
6. **اضغط "Create repository"**

### ربط المستودع المحلي بـ GitHub:
```bash
# استبدل USERNAME بـ اسم المستخدم و REPO-NAME بـ اسم المستودع
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git branch -M main
git push -u origin main
```

---

## 🌐 النشر على Netlify مع Git

### بعد رفع المشروع على GitHub:

1. **في Netlify، اضغط "New site from Git"**
2. **اختر "GitHub"**
3. **اختر المستودع**
4. **إعدادات البناء**:
   - **Branch to deploy**: `main`
   - **Build command**: (اتركه فارغاً)
   - **Publish directory**: `.`
5. **اضغط "Deploy site"**

### مميزات النشر مع Git:
- ✅ **تحديث تلقائي** عند كل push
- ✅ **معاينة التغييرات** قبل النشر
- ✅ **تاريخ الإصدارات**
- ✅ **إمكانية التراجع**

---

## ⚙️ إعدادات ما بعد النشر

### 1. تحديث الروابط
بعد الحصول على رابط الموقع، غيّر في الملفات:

**في `index.html`:**
```html
<meta property="og:url" content="https://YOUR-SITE.netlify.app" />
<link rel="canonical" href="https://YOUR-SITE.netlify.app/" />
```

**في `robots.txt`:**
```
Sitemap: https://YOUR-SITE.netlify.app/sitemap.xml
```

**في `sitemap.xml`:**
```xml
<loc>https://YOUR-SITE.netlify.app/</loc>
```

### 2. إعداد Google Analytics
1. **اذهب إلى [analytics.google.com](https://analytics.google.com)**
2. **أنشئ حساب جديد**
3. **أنشئ property جديد**
4. **احصل على Measurement ID** (مثل: G-XXXXXXXXXX)
5. **استبدل `GA_MEASUREMENT_ID` في الملفات**

### 3. تخصيص اسم الموقع
في Netlify:
1. **Site settings > Domain management**
2. **Options > Edit site name**
3. **غيّر الاسم** (مثل: `alaabi-platform`)

---

## 🎯 اختبار الموقع

### تحقق من:
- ✅ **الصفحة الرئيسية** تعمل
- ✅ **الروابط النظيفة** تعمل (`/learning`, `/activities`)
- ✅ **النماذج** ترسل الرسائل
- ✅ **PWA** يعمل (أيقونة التثبيت تظهر)
- ✅ **الألعاب** تعمل بشكل صحيح

### أدوات الاختبار:
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **GTmetrix**: https://gtmetrix.com/
- **Wave Accessibility**: https://wave.webaim.org/

---

## 🆘 حل المشاكل الشائعة

### المشكلة: الروابط النظيفة لا تعمل
**الحل**: تأكد من وجود ملف `_redirects` في الجذر

### المشكلة: النماذج لا ترسل
**الحل**: تأكد من وجود `data-netlify="true"` في النموذج

### المشكلة: الخطوط العربية لا تظهر
**الحل**: تحقق من تحميل خطوط Cairo/Tajawal في CSS

### المشكلة: Service Worker لا يعمل
**الحل**: تأكد من أن الموقع يعمل على HTTPS (Netlify يوفر هذا تلقائياً)

---

## 📞 الدعم

### إذا واجهت مشاكل:
1. **راجع Netlify Deploy Log** للأخطاء
2. **استخدم Developer Tools** في المتصفح
3. **تحقق من ملف `netlify.toml`**

### مصادر مفيدة:
- [Netlify Docs](https://docs.netlify.com/)
- [Git Tutorial](https://git-scm.com/docs/gittutorial)
- [GitHub Guides](https://guides.github.com/)

---

**🎉 مبروك! موقعك جاهز للانطلاق!**