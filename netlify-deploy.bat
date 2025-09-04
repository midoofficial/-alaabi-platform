@echo off
echo ========================================
echo    نشر منصة ألعابي على Netlify
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git غير مثبت على النظام
    echo.
    echo يرجى تثبيت Git من: https://git-scm.com/download/win
    echo أو استخدم النشر المباشر على Netlify
    echo.
    pause
    exit /b 1
)

echo ✅ Git مثبت ومتاح
echo.

REM Check if this is a git repository
if not exist ".git" (
    echo 📁 إنشاء مستودع Git جديد...
    git init
    echo.
)

REM Check if remote origin exists
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  لم يتم ربط المستودع بـ GitHub بعد
    echo.
    echo يرجى:
    echo 1. إنشاء مستودع جديد على GitHub
    echo 2. تشغيل الأمر التالي:
    echo    git remote add origin https://github.com/USERNAME/REPO-NAME.git
    echo.
    set /p continue="هل تريد المتابعة بدون ربط GitHub؟ (y/n): "
    if /i not "%continue%"=="y" (
        pause
        exit /b 1
    )
)

echo 📦 إضافة الملفات للمستودع...
git add .

echo 💾 إنشاء commit جديد...
set /p commit_msg="أدخل رسالة الـ commit (أو اضغط Enter للرسالة الافتراضية): "
if "%commit_msg%"=="" set commit_msg=تحديث منصة ألعابي

git commit -m "%commit_msg%"

REM Push to GitHub if remote exists
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo 🚀 رفع التغييرات إلى GitHub...
    git push origin main
    if %errorlevel% equ 0 (
        echo ✅ تم رفع المشروع بنجاح!
        echo.
        echo الخطوات التالية:
        echo 1. اذهب إلى netlify.com
        echo 2. اضغط "New site from Git"
        echo 3. اختر GitHub واختر المستودع
        echo 4. اضغط Deploy!
    ) else (
        echo ❌ فشل في رفع المشروع
        echo تحقق من صحة رابط المستودع وصلاحيات الوصول
    )
) else (
    echo ⚠️  المستودع غير مربوط بـ GitHub
    echo يمكنك النشر المباشر على Netlify بسحب مجلد المشروع
)

echo.
echo 🌐 للنشر المباشر:
echo 1. اذهب إلى netlify.com
echo 2. اسحب مجلد المشروع كاملاً
echo 3. انتظر اكتمال النشر
echo.

pause