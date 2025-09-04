# دليل أوامر Git السريع - منصة ألعابي

## 🚀 البداية السريعة

### إذا كان Git مثبت:
```bash
# 1. الانتقال لمجلد المشروع
cd "d:\منصة العابي"

# 2. تشغيل السكريبت التلقائي
setup-github.bat
```

### إذا لم يكن Git مثبت:
1. حمّل Git من: https://git-scm.com/download/win
2. ثبّته مع الإعدادات الافتراضية
3. أعد تشغيل PowerShell
4. شغّل `setup-github.bat`

---

## 📋 الأوامر الأساسية

### إعداد Git للمرة الأولى:
```bash
git config --global user.name "اسمك"
git config --global user.email "your-email@example.com"
```

### إنشاء مستودع جديد:
```bash
# في مجلد المشروع
cd "d:\منصة العابي"
git init
git add .
git commit -m "إعداد منصة ألعابي - النسخة الأولى"
```

### ربط بـ GitHub:
```bash
# استبدل YOUR-USERNAME و REPO-NAME
git remote add origin https://github.com/YOUR-USERNAME/alaabi-platform.git
git branch -M main
git push -u origin main
```

---

## 🔄 التحديثات المستقبلية

### بعد تعديل الملفات:
```bash
# إضافة جميع التغييرات
git add .

# إنشاء commit مع رسالة وصفية
git commit -m "وصف التحديث"

# رفع التغييرات إلى GitHub
git push
```

### أوامر مفيدة:
```bash
# عرض حالة الملفات
git status

# عرض تاريخ الـ commits
git log --oneline

# عرض الفروع
git branch

# عرض الروابط المربوطة
git remote -v
```

---

## 🛠️ حل المشاكل الشائعة

### المشكلة: "git is not recognized"
**الحل:** Git غير مثبت أو غير مضاف للـ PATH
```bash
# تحقق من التثبيت
git --version

# إذا لم يعمل، أعد تثبيت Git
```

### المشكلة: "Permission denied"
**الحل:** مشاكل في المصادقة مع GitHub
```bash
# تحقق من إعدادات المستخدم
git config --global user.name
git config --global user.email

# أو استخدم GitHub Desktop للمصادقة
```

### المشكلة: "Repository not found"
**الحل:** رابط المستودع غير صحيح
```bash
# تحقق من الرابط
git remote -v

# تحديث الرابط
git remote set-url origin NEW_URL
```

### المشكلة: "Nothing to commit"
**الحل:** لا توجد تغييرات جديدة
```bash
# تحقق من حالة الملفات
git status

# إضافة ملفات محددة
git add filename.html

# أو إضافة جميع الملفات
git add .
```

---

## 📁 هيكل المشروع على GitHub

```
alaabi-platform/
├── README.md
├── index.html
├── _redirects
├── netlify.toml
├── robots.txt
├── sitemap.xml
├── manifest.webmanifest
├── sw.js
├── package.json
├── pages/
│   ├── learning/
│   ├── activities/
│   ├── contact/
│   └── ...
├── js/
├── css/
├── assets/
└── data/
```

---

## 🌐 ربط Netlify

### بعد رفع المشروع على GitHub:

1. **اذهب إلى:** https://netlify.com
2. **اضغط:** "New site from Git"
3. **اختر:** GitHub
4. **اختر:** مستودع alaabi-platform
5. **إعدادات النشر:**
   - Branch: `main`
   - Build command: (فارغ)
   - Publish directory: `.`
6. **اضغط:** Deploy site

### النتيجة:
- ✅ موقع منشور على رابط مثل: `https://amazing-site-123456.netlify.app`
- ✅ تحديث تلقائي عند كل `git push`
- ✅ معاينة التغييرات قبل النشر
- ✅ تاريخ كامل للإصدارات

---

## 🎯 نصائح مهمة

### أسماء Commits جيدة:
```bash
git commit -m "إضافة صفحة التواصل"
git commit -m "تحسين أداء الألعاب"
git commit -m "إصلاح مشكلة في النماذج"
git commit -m "تحديث التصميم للهواتف"
```

### تنظيم العمل:
```bash
# قبل البدء في تطوير ميزة جديدة
git pull  # تحديث من GitHub

# بعد الانتهاء من التطوير
git add .
git commit -m "وصف الميزة الجديدة"
git push
```

### النسخ الاحتياطية:
- GitHub يحفظ تاريخ كامل للمشروع
- يمكن الرجوع لأي إصدار سابق
- يمكن تحميل المشروع من أي مكان

---

## 📞 المساعدة

### إذا واجهت مشاكل:
1. **راجع الأخطاء** في PowerShell
2. **تحقق من الاتصال** بالإنترنت
3. **تأكد من صحة** أسماء المستخدم والمستودع
4. **استخدم GitHub Desktop** كبديل مرئي

### مصادر مفيدة:
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Netlify Docs](https://docs.netlify.com/)

---

**🎉 بالتوفيق في نشر منصة ألعابي!**