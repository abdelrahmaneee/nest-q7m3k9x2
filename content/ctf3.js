/* ===== تحديات الأعلام ③: أعلام جديدة لدروس المرحلة الأولى التي لم يكن لها تحدٍّ بعد =====
   الروابط المزيّفة، XSS، الملح، فحص سلامة الملفات بالبصمة، البحث الثنائي، المهام التلقائية، الخط الزمني. */
(function () {
  const b64 = s => btoa(unescape(encodeURIComponent(s)));
  const ev = (() => { const L = ['09:14:02 web  GET /index.html 10.0.0.5', '07:41:55 auth LOGIN sara SUCCESS 10.0.0.21', '03:12:09 auth LOGIN admin FAILED 66.6.6.6', '08:05:31 web  GET /shop 10.0.0.7', '03:12:07 auth LOGIN admin FAILED 66.6.6.6', '03:11:58 fw   FIRST-CONTACT 66.6.6.6 note=OQAB{t1m3l1n3_m4st3r}', '03:13:40 auth LOGIN admin SUCCESS 66.6.6.6', '10:22:10 web  POST /upload 10.0.0.9', '03:12:08 auth LOGIN admin FAILED 66.6.6.6', '06:00:00 sys  BACKUP done', '03:15:02 sys  NEW USER helper by admin']; return L.join('\n'); })();

  C.ctf.push(
    /* ---- الويب: قراءة الروابط (u7 l6 + u2 l3) ---- */
    {
      id: 'w7', track: 'web', title: 'الرابط المتنكّر', pts: 100,
      story: 'وصلت إلى بريد عُقاب الوهمي 3 رسائل كلها تقول إنها من «روبلوكس». واحدة فقط فيها رابط **مزيّف**. اقرأ الروابط كالمحقّق (عرض الكود يكشف الرابط الحقيقي خلف الزر!)، ثم بلّغ عن **صاحب الرابط المزيّف** من صفحة البلاغات: `/report?owner=...`',
      env: {
        type: 'browser', host: 'mail.oqab', start: '/', pages: {
          '/': { html: '<h1>📬 البريد</h1><p><b>1) فريق روبلوكس:</b> نشكرك على اللعب! <a href="https://www.roblox.com/news">الأخبار</a></p><p><b>2) دعم روبلوكس:</b> حسابك سيُغلق! <a href="https://roblox.com.account-check.net/login">تحقّق الآن</a></p><p><b>3) روبلوكس:</b> فعالية جديدة <a href="https://events.roblox.com/summer">التفاصيل</a></p><!-- لتبليغ: /report?owner=اسم_صاحب_الرابط -->' },
          '/report': p => ({ html: (p.owner || '').toLowerCase().replace(/^www\./, '') === 'account-check.net' ? '<h1>✅ شكراً للبلاغ!</h1><p>صاحب الرابط المزيّف هو account-check.net وليس روبلوكس.</p><p>العلم: OQAB{r34d_th3_r34l_0wn3r}</p>' : '<h1>🤔 ليس هذا</h1><p>صاحب الرابط = آخر كلمتين قبل أول / بعد الاسم. حاول مرة أخرى.</p>' })
        }
      },
      flag: 'OQAB{r34d_th3_r34l_0wn3r}',
      hints: ['اضغط «عرض الكود» لترى الروابط الحقيقية خلف الكلام.', 'في الرسالة 2: `roblox.com.account-check.net`. اقرأ آخر كلمتين قبل أول `/`.', 'اذهب إلى: `/report?owner=account-check.net`'],
      solution: 'الرابط `roblox.com.account-check.net` يبدأ بكلمة roblox ليخدعنا، لكن صاحبه الحقيقي هو آخر كلمتين: `account-check.net`.',
      defend: 'اقرأ دائماً آخر كلمتين قبل أول `/`، ولا تضغط رابطاً في رسالة تخيفك. افتح التطبيق الرسمي بنفسك.'
    },
    /* ---- الويب: XSS (u17 l5) ---- */
    {
      id: 'w8', track: 'web', title: 'البحث الذي يردّد كلامك', pts: 150,
      story: 'موقع ألعاب وهمي فيه بحث. اكتب أي كلمة في الرابط `/search?q=...` وسترى أن الصفحة **تردّد** كلامك كما هو داخل HTML. روبوت المدير يزور أي رابط بحث يُرسل إليه... هل تستطيع أن تجعل الصفحة **تنفّذ كوداً** بدل أن تعرض كلاماً؟ (محاكاة آمنة: لا يُنفَّذ شيء حقيقي.)',
      env: {
        type: 'browser', host: 'games.oqab', start: '/search?q=chess', pages: {
          '/search': p => { const q = p.q || ''; const bad = /<\s*script|on\w+\s*=|javascript:/i.test(q); return { html: '<h1>🔎 نتائج البحث عن: ' + (bad ? '<span>[كودك هنا]</span>' : q.replace(/</g, '&lt;')) + '</h1>' + (bad ? '<div style="background:#c62828;color:#fff;padding:10px;border-radius:10px">⚡ الصفحة وضعت كلامك داخل HTML فاشتغل ككود! روبوت المدير فتح الرابط فأرسل الكود كوكيه:<br><b>admin_cookie = OQAB{x55_r3fl3ct3d}</b></div>' : '<p>لا توجد نتائج.</p><!-- المبرمج: نضع q داخل الصفحة بـ innerHTML -->') }; }
        }
      },
      flag: 'OQAB{x55_r3fl3ct3d}',
      hints: ['جرّب: `/search?q=<b>hi</b>` وانظر في «عرض الكود» ماذا حدث لوسمك.', 'تذكّر درس الكود الخبيث: وسم صورة مكسورة له `onerror`.', 'جرّب: `/search?q=<img src=x onerror=steal()>`'],
      solution: 'الصفحة تضع كلام البحث داخل HTML دون تنظيف، فكتبنا وسماً فيه `onerror` فصار كوداً يعمل في متصفح من يفتح الرابط. هذه ثغرة XSS المنعكسة.',
      defend: 'اعرض كلام المستخدم دائماً بـ `textContent` أو حوّل `<` إلى `&lt;` قبل وضعه في الصفحة.'
    },
    /* ---- التشفير: الملح (u8 l7) ---- */
    {
      id: 'c7', track: 'crypto', title: 'نسي الملح!', pts: 150,
      story: 'سُرقت قاعدة بيانات وهمية تستعمل **الملح**. بصمة كلمة مرور أحد المستخدمين وملحها:\nالملح: `x9`\nالبصمة: `64d251e6fa564ede2d10a114bd30b0a6e8abe16856c5f918c4555e5bd8f4793d`\nبرنامج المهاجم جاهز، لكنه **نسي الملح**! أصلحه. العلم: `OQAB{كلمة_المرور}`',
      env: { type: 'py', code: 'import hashlib\n\nsalt = "x9"\ntarget = "64d251e6fa564ede2d10a114bd30b0a6e8abe16856c5f918c4555e5bd8f4793d"\nwords = ["123456", "password", "qwerty", "football", "dragon", "princess", "letmein"]\n\nfor w in words:\n    h = hashlib.sha256(w.encode()).hexdigest()   # ⚠️ أين الملح؟\n    if h == target:\n        print("وجدتها:", w)\nprint("انتهى البحث")\n' },
      flag: 'OQAB{dragon}',
      hints: ['شغّل البرنامج: لم يجد شيئاً، لأن الموقع حسب البصمة للملح + الكلمة.', 'غيّر `w.encode()` إلى `(salt + w).encode()`', 'كلمة السر وحش أسطوري 🐉'],
      solution: 'الموقع يحسب البصمة لـ `salt + الكلمة`. أضفنا الملح فوجدنا `dragon`. الملح منع الجداول الجاهزة، لكن الكلمة الضعيفة سقطت بالقاموس!',
      defend: 'الملح جيد، لكنه لا ينقذ كلمة ضعيفة. استعمل جملة طويلة غريبة، والمواقع تستعمل بصمات بطيئة مثل bcrypt.'
    },
    /* ---- التشفير: سلامة الملفات بالبصمة (u8 l4) ---- */
    {
      id: 'c8', track: 'crypto', title: 'أيّ تحميل هو الأصلي؟', pts: 100,
      story: 'نزّلت لعبة من 3 مواقع مختلفة. الموقع الرسمي نشر **بصمة SHA-256** للملف الأصلي. اثنان من التحميلات معدّلان! احسب بصمة كل ملف، وقارنها بالبصمة الرسمية. العلم داخل الملف **الأصلي** فقط (احذر: في الملفات المعدّلة أعلام مزيّفة!).',
      env: { type: 'py', code: 'import hashlib\n\nofficial = "983f7e0b400d46978feede319ac34ca49565b257129c35f78696d536a50b2d55"\nfiles = {\n    "mirror1.zip": "game v1.2 + hidden-miner OQAB{m1n3r_1ns1d3}",\n    "mirror2.zip": "game v1.2 OQAB{h4sh_ch3ck3d}",\n    "mirror3.zip": "game v1.2 OQAB{f4k3_d0wnl04d}",\n}\n\nfor name, data in files.items():\n    h = hashlib.sha256(data.encode()).hexdigest()\n    print(name, h[:12])\n    # إذا كانت h تساوي official اطبع "الأصلي:" و name\n' },
      flag: 'OQAB{h4sh_ch3ck3d}', alt: [],
      hints: ['شغّل البرنامج وقارن أول 12 رمزاً بأول البصمة الرسمية `983f7e0b400d`.', 'أضف داخل الحلقة: `if h == official:` ثم `print("الأصلي:", name, data)`', 'الأصلي هو mirror2.'],
      solution: 'بصمة mirror2 وحدها طابقت البصمة الرسمية. أي تعديل ولو حرف واحد يغيّر البصمة كلها، فكُشف الملفان المعدّلان.',
      defend: 'نزّل من الموقع الرسمي، وإذا نشر بصمة فافحصها قبل التشغيل.'
    },
    /* ---- قراءة الكود: البحث الثنائي (u11 l3) ---- */
    {
      id: 'k5', track: 'code', title: 'سبع محاولات فقط', pts: 150,
      story: 'حارس يخبّئ رقماً بين 1 و 100، ويسمح بـ **7 تخمينات فقط**! بعد كل تخمين يقول: «أكبر» أو «أصغر». بالتخمين العشوائي ستخسر غالباً... لكن **البحث الثنائي** يجد أي رقم في 7 خطوات أو أقل! أكمل البرنامج.',
      env: { type: 'py', code: 'log = []\nsecret = sum(range(13)) - 4\n\ndef guess(n):\n    log.append(n)\n    if len(log) > 7:\n        return "⛔ انتهت المحاولات!"\n    if n < secret:\n        return "أكبر"\n    if n > secret:\n        return "أصغر"\n    return "✅ OQAB{b1n4ry_" + str(secret) + "_w1n}"\n\nlo, hi = 1, 100\nfor step in range(7):\n    mid = (lo + hi) // 2\n    r = guess(mid)\n    print(step + 1, mid, r)\n    if r.startswith("✅"):\n        break\n    # أكمل: إذا كان r == "أكبر" ارفع lo إلى mid + 1\n    #       وإذا كان r == "أصغر" اخفض hi إلى mid - 1\n' },
      flag: 'OQAB{b1n4ry_74_w1n}',
      hints: ['البرنامج الآن يخمّن 50 سبع مرات! لأن lo و hi لا يتغيّران.', 'أضف: `if r == "أكبر":` ثم `lo = mid + 1`', 'وأضف: `if r == "أصغر":` ثم `hi = mid - 1`'],
      solution: 'في كل خطوة رمينا نصف الأرقام: 50 ← 75 ← 62 ← 68 ← 71 ← 73 ← 74 ✅. سبع خطوات بالضبط!',
      defend: 'هذا سبب «قفل الحساب بعد محاولات قليلة»: لو سمح الموقع بإجابات «أكبر/أصغر» لسقط أي رقم سري بسرعة.'
    },
    /* ---- لينكس: المهام التلقائية (u16 l5) ---- */
    {
      id: 'x5', track: 'linux', title: 'المهمة التي تعود كل صباح', pts: 150,
      story: 'كلما أعاد المدير تشغيل الخادم الوهمي، يعود برنامج غريب للعمل! هناك شيء يشغّله **تلقائياً مع كل إقلاع**. جد المهمة، واقرأ البرنامج، وفكّ السر المخبّأ فيه.',
      env: { type: 'term', host: 'cron-srv', fs: { home: { oqab: { 'ticket.txt': 'البرنامج يعود بعد كل إعادة تشغيل! أين المهام التلقائية في لينكس؟' } }, etc: { crontab: '# مهام تلقائية\n0 3 * * * root /usr/bin/backup.sh\n@reboot root /opt/.helper.sh' }, opt: { '.helper.sh': '#!/bin/sh\n# يرسل الملفات كل ساعة\nwhile true; do upload /home/*; sleep 3600; done\n# key=' + b64('OQAB{cr0n_r3b00t_hunt}') } } },
      flag: 'OQAB{cr0n_r3b00t_hunt}',
      hints: ['المهام التلقائية في `cat /etc/crontab`. ابحث عن `@reboot`.', 'الملف يبدأ بنقطة فهو مخفي: `ls -a /opt` ثم `cat /opt/.helper.sh`', 'المفتاح Base64: `base64 -d ' + b64('OQAB{cr0n_r3b00t_hunt}') + '`'],
      solution: '`/etc/crontab` فيه `@reboot root /opt/.helper.sh`، أي: شغّله مع كل إقلاع. قرأنا البرنامج المخفي، ووجدنا في آخره سطر Base64، ففككناه.',
      defend: 'افحص `/etc/crontab` بعد أي اختراق، واحذف السطر الغريب **والبرنامج** معاً، ثم اعرف كيف دخل المهاجم وأغلق الثغرة.'
    },
    /* ---- الملفات: الخط الزمني (u10 l4 + u3 l7) ---- */
    {
      id: 'f7', track: 'files', title: 'من بدأ أولاً؟', pts: 150,
      story: 'سجلّات 3 أجهزة (الويب، والدخول، والجدار الناري) جُمعت في ملف واحد `events.log`، لكن الأسطر **مخلوطة**! المحقّق يحتاج **الخط الزمني**: ما أول شيء فعله المهاجم في تلك الليلة؟ العلم في **أول سطر** للمهاجم بعد الترتيب بالوقت.',
      env: { type: 'term', host: 'forensics', fs: { home: { oqab: { 'events.log': ev } } } },
      flag: 'OQAB{t1m3l1n3_m4st3r}',
      hints: ['الأسطر تبدأ بالوقت، فإذا رتّبتها ترتّبت بالوقت: `sort events.log`', 'اعرض الأسطر الأولى فقط: `sort events.log | head -n 3`', 'أول أثر للعنوان 66.6.6.6 كان سطر الجدار الناري FIRST-CONTACT.'],
      solution: '`sort` رتّب الأسطر بالوقت لأن كل سطر يبدأ به. فظهر أن المهاجم 66.6.6.6 لمس الجدار الناري أولاً الساعة 03:11:58، ثم خمّن كلمة admin، ثم دخل، ثم صنع مستخدماً جديداً.',
      defend: 'اجمع السجلات من كل الأجهزة في مكان واحد وبتوقيت موحّد، فالخط الزمني يكشف القصة كاملة.'
    }
  );
})();
