@echo off
chcp 65001 >nul
echo ========================================
echo    إعداد GitHub لمنصة ألعابي
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git غير مثبت على النظام
    echo.
    echo يرجى تثبيت Git أولاً من: https://git-scm.com/download/win
    echo.
    echo بعد التثبيت:
    echo 1. أعد تشغيل PowerShell
    echo 2. شغّل هذا الملف مرة أخرى
    echo.
    pause
    start https://git-scm.com/download/win
    exit /b 1
)

echo ✅ Git مثبت ومتاح
echo.

REM Check if this is already a git repository
if exist ".git" (
    echo 📁 مستودع Git موجود بالفعل
    echo.
    
    REM Check if remote origin exists
    git remote get-url origin >nul 2>&1
    if %errorlevel% equ 0 (
        echo 🔗 المستودع مربوط بـ GitHub بالفعل
        for /f "tokens=*" %%i in ('git remote get-url origin') do echo الرابط: %%i
        echo.
        
        set /p push_changes="هل تريد رفع التغييرات الجديدة؟ (y/n): "
        if /i "%push_changes%"=="y" (
            echo 📦 إضافة الملفات الجديدة...
            git add .
            
            set /p commit_msg="أدخل رسالة الـ commit (أو اضغط Enter للرسالة الافتراضية): "
            if "%commit_msg%"=="" set commit_msg=تحديث منصة ألعابي
            
            git commit -m "%commit_msg%"
            
            echo 🚀 رفع التغييرات إلى GitHub...
            git push
            
            if %errorlevel% equ 0 (
                echo ✅ تم رفع التغييرات بنجاح!
            ) else (
                echo ❌ فشل في رفع التغييرات
            )
        )
        goto :end
    )
)

REM Git configuration check
echo 🔧 فحص إعدادات Git...
for /f "tokens=*" %%i in ('git config --global user.name 2^>nul') do set git_name=%%i
for /f "tokens=*" %%i in ('git config --global user.email 2^>nul') do set git_email=%%i

if "%git_name%"=="" (
    echo ⚠️  لم يتم إعداد اسم المستخدم في Git
    set /p user_name="أدخل اسمك: "
    git config --global user.name "%user_name%"
    echo ✅ تم حفظ الاسم: %user_name%
) else (
    echo ✅ اسم المستخدم: %git_name%
)

if "%git_email%"=="" (
    echo ⚠️  لم يتم إعداد البريد الإلكتروني في Git
    set /p user_email="أدخل بريدك الإلكتروني (نفس المسجل في GitHub): "
    git config --global user.email "%user_email%"
    echo ✅ تم حفظ البريد: %user_email%
) else (
    echo ✅ البريد الإلكتروني: %git_email%
)

echo.

REM Initialize git repository if not exists
if not exist ".git" (
    echo 📁 إنشاء مستودع Git جديد...
    git init
    echo.
)

REM Add files
echo 📦 إضافة الملفات للمستودع...
git add .

REM Create initial commit
echo 💾 إنشاء commit أولي...
git commit -m "إعداد منصة ألعابي - النسخة الأولى"

echo.
echo ========================================
echo    ربط المستودع بـ GitHub
echo ========================================
echo.

echo 📋 الخطوات التالية:
echo.
echo 1. اذهب إلى https://github.com
echo 2. اضغط "New repository"
echo 3. اسم المستودع: alaabi-platform
echo 4. الوصف: منصة ألعابي مع الأخصائية ميرنا السيد
echo 5. اتركه Public أو اختر Private
echo 6. لا تضع ✅ في أي من الخيارات الإضافية
echo 7. اضغط "Create repository"
echo 8. انسخ رابط المستودع
echo.

set /p repo_url="الصق رابط المستودع هنا (مثل: https://github.com/username/alaabi-platform.git): "

if "%repo_url%"=="" (
    echo ❌ لم يتم إدخال رابط المستودع
    echo.
    echo يمكنك ربط المستودع لاحقاً بالأوامر التالية:
    echo git remote add origin YOUR_REPO_URL
    echo git branch -M main
    echo git push -u origin main
    echo.
    pause
    exit /b 1
)

echo.
echo 🔗 ربط المستودع المحلي بـ GitHub...
git remote add origin "%repo_url%"

echo 🌿 تحديد الفرع الرئيسي...
git branch -M main

echo 🚀 رفع المشروع إلى GitHub...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ✅ تم رفع المشروع بنجاح إلى GitHub!
    echo.
    echo ========================================
    echo    الخطوات التالية - ربط Netlify
    echo ========================================
    echo.
    echo 1. اذهب إلى https://netlify.com
    echo 2. سجل دخول أو أنشئ حساب جديد
    echo 3. اضغط "New site from Git"
    echo 4. اختر "GitHub"
    echo 5. اختر مستودع "alaabi-platform"
    echo 6. إعدادات النشر:
    echo    - Branch: main
    echo    - Build command: (اتركه فارغاً)
    echo    - Publish directory: .
    echo 7. اضغط "Deploy site"
    echo.
    echo 🎉 مبروك! مشروعك الآن على GitHub!
    echo.
    
    set /p open_github="هل تريد فتح GitHub الآن؟ (y/n): "
    if /i "%open_github%"=="y" (
        start "%repo_url:~0,-4%"
    )
    
    set /p open_netlify="هل تريد فتح Netlify الآن؟ (y/n): "
    if /i "%open_netlify%"=="y" (
        start https://netlify.com
    )
    
) else (
    echo.
    echo ❌ فشل في رفع المشروع
    echo.
    echo الأسباب المحتملة:
    echo - رابط المستودع غير صحيح
    echo - لم تسجل دخول إلى GitHub
    echo - مشاكل في الاتصال بالإنترنت
    echo.
    echo يمكنك المحاولة مرة أخرى أو النشر يدوياً
)

:end
echo.
echo 📖 للمساعدة الإضافية، افتح: github-deploy-guide.html
echo.
pause