/* ===== تحديات الأعلام ②: مسارات جديدة وقضايا. كل شيء وهمي داخل التطبيق ===== */
(function () {
  const noise = (n, seed) => { const words = ['ok', 'ping', 'sync', 'tick', 'idle', 'beat', 'save', 'load']; const L = []; let x = seed; for (let i = 0; i < n; i++) { x = (x * 9301 + 49297) % 233280; L.push('log-' + words[x % words.length] + '-' + (x % 37)); } return L; };
  const hay = (() => { const base = noise(60, 7); const lines = []; base.forEach(l => { lines.push(l); lines.push(l); }); lines.splice(83, 0, 'OQAB{un1qu3_n33dl3}'); return lines.join('\n'); })();
  const b64 = s => btoa(unescape(encodeURIComponent(s)));
  const caesar = (s, k) => s.replace(/[a-z]/gi, ch => { const b = ch <= 'Z' ? 65 : 97; return String.fromCharCode((ch.charCodeAt(0) - b + k) % 26 + b); });
  const xorHex = (s, k) => Array.from(s).map(c => (c.charCodeAt(0) ^ k).toString(16).padStart(2, '0')).join('');

  C.ctf.push(
    /* ---------------- الاستطلاع ② ---------------- */
    {
      id: 'r5', track: 'recon', title: 'الخادم القديم', pts: 150,
      story: 'شركة «ألعاب الصقر» تقول إنها أغلقت خادمها القديم. لكن عُقاب يعرف أن الأسماء القديمة تبقى أحياناً في دليل الهاتف (DNS). تتبّع الخيط: من الاسم ← إلى العنوان ← إلى الأبواب!',
      env: { type: 'term', host: 'recon-lab', fs: { home: { oqab: { 'mission.txt': 'ابدأ بـ: lookup falcon.games TXT' } } }, world: { dns: { 'falcon.games': { A: '10.30.0.2', TXT: 'تذكير للفريق: الخادم القديم ما زال على old.falcon.games حتى نهاية الشهر' }, 'old.falcon.games': { A: '10.30.0.8' } }, hosts: { '10.30.0.2': { name: 'www', ports: { 443: { svc: 'https', banner: 'موقع ألعاب الصقر' } } }, '10.30.0.8': { name: 'old-box', ports: { 22: { svc: 'ssh', banner: 'SSH-2.0 (مقفل بكلمة مرور)' }, 9999: { svc: 'debug', banner: 'لوحة تصحيح قديمة مفتوحة!\nالعلم: OQAB{0ld_s3rv3rs_n3v3r_d13}' } } } } } },
      flag: 'OQAB{0ld_s3rv3rs_n3v3r_d13}',
      hints: ['اقرأ سجل TXT: `lookup falcon.games TXT`', 'وجدت اسماً جديداً؟ اسأل عن عنوانه: `lookup old.falcon.games`', 'امسح العنوان: `scan 10.30.0.8` ثم اتصل بالباب الغريب: `connect 10.30.0.8 9999`'],
      solution: 'سجل TXT كشف اسم الخادم القديم. سألنا DNS عن عنوانه (10.30.0.8)، ثم مسحناه فوجدنا باب 9999 مفتوحاً، واتصلنا به.',
      defend: 'عندما تغلق خادماً **احذف أسماءه من DNS** وأطفئه فعلاً. والملاحظات الداخلية لا تُكتب في سجلات عامة يقرؤها كل العالم.'
    },
    {
      id: 'r6', track: 'recon', title: 'الإبرة في المجلدات', pts: 100,
      story: 'خادم ضخم فيه مجلدات داخل مجلدات. المبرمج اعترف: «تركت نسخة احتياطية من الإعدادات بامتداد `.bak` في مكان ما». لا وقت لفتح كل المجلدات... استخدم أداة البحث!',
      env: { type: 'term', host: 'big-srv', fs: { home: { oqab: { 'readme.txt': 'ابحث عن ملف ينتهي بـ .bak' } }, srv: { app: { v1: { 'main.py': 'print("v1")' }, v2: { 'main.py': 'print("v2")', lib: { 'utils.py': '# أدوات' } } }, data: { '2025': { 'jan.csv': 'a,b' }, '2026': { 'feb.csv': 'c,d', old: { deep: { 'settings.bak': 'admin_pass=Fa1c0n!\nالعلم: OQAB{f1nd_3v3ryth1ng}' } } } } }, opt: { tools: { 'run.sh': 'echo hi' } } } },
      flag: 'OQAB{f1nd_3v3ryth1ng}',
      hints: ['الأمر `find` يبحث في كل المجلدات. ابدأ من الجذر `/`.', 'النجمة `*` تعني «أي شيء»: `find / -name "*.bak"`', 'اقرأ الملف بالمسار الذي ظهر: `cat /srv/data/2026/old/deep/settings.bak`'],
      solution: '`find / -name "*.bak"` بحث في كل الخادم ووجد الملف في أعماق `/srv/data/2026/old/deep/`. ثم قرأناه بـ `cat`.',
      defend: 'النسخ الاحتياطية من ملفات الإعدادات فيها كلمات سر! لا تتركها على الخادم، وابحث عنها بنفسك بـ find قبل أن يجدها المهاجم.'
    },

    /* ---------------- الويب ② ---------------- */
    {
      id: 'w5', track: 'web', title: 'السعر في يدك', pts: 100,
      story: 'متجر وهمي يبيع «سيف التنين الأسطوري» بـ 500 جوهرة، وأنت تملك 0 فقط. لاحظ عُقاب شيئاً غريباً في رابط الشراء... من يقرّر السعر هنا؟',
      env: { type: 'browser', host: 'shop.oqab', start: '/item', pages: { '/item': { html: '<h1>⚔️ سيف التنين الأسطوري</h1><p>السعر: 500 💎</p><p>رصيدك: 0 💎</p><a href="#">اشترِ الآن ← /buy?item=dragon_sword&price=500</a>' }, '/buy': (p) => { const pr = +p.price; return { html: isNaN(pr) ? '<h1>خطأ</h1>' : pr > 0 ? '<h1>❌ رصيدك لا يكفي</h1><p>السعر ' + pr + ' 💎 ورصيدك 0</p>' : '<h1>✅ تم الشراء بـ ' + pr + ' 💎!</h1><p>المتجر صدّق السعر القادم من الرابط...</p><p>العلم: <b>OQAB{n3v3r_trust_th3_cl13nt}</b></p>' }; } } },
      flag: 'OQAB{n3v3r_trust_th3_cl13nt}',
      hints: ['اكتب في شريط العنوان رابط الشراء الظاهر في الصفحة: `/buy?item=dragon_sword&price=500`', 'السعر مكتوب في الرابط... والرابط في يدك أنت!', 'جرّب: `/buy?item=dragon_sword&price=0`'],
      solution: 'المتجر أخذ السعر من الرابط الذي يرسله المتصفح بدل أن يأخذه من قاعدة بياناته. غيّرنا price إلى 0 فاشترينا مجاناً.',
      defend: 'الخادم **لا يثق أبداً** بالأسعار أو النقاط القادمة من المتصفح. يأخذ رقم المنتج فقط، ويحسب السعر من قاعدة بياناته بنفسه.'
    },
    {
      id: 'w6', track: 'web', title: 'الطريق في السكربت', pts: 150,
      story: 'صفحة لعبة تبدو بسيطة. لكن مبرمجي الواجهة يتركون أحياناً روابط سرية داخل كود JavaScript، لأنهم يظنون أن أحداً لن يقرأه. اقرأ الكود!',
      env: { type: 'browser', host: 'arena.oqab', start: '/', pages: { '/': { html: '<h1>🏟️ ساحة المعارك</h1><p>انضم إلى المعركة القادمة!</p><button>العب</button>\n<script>\n  // إعدادات اللعبة\n  const API = "/api/v2";\n  function loadScores() { fetch(API + "/scores"); }\n  // للمطوّرين فقط: لوحة الاختبار\n  // fetch("/api/v2/dev-panel?key=letmein")\n</script>' }, '/api/v2/scores': { html: '<pre>[{"name":"Lina","score":1450},{"name":"Omar","score":1300}]</pre>' }, '/api/v2/dev-panel': (p) => ({ html: p.key === 'letmein' ? '<pre>{"status":"ok","debug":true,"flag":"OQAB{j4v4scr1pt_l34ks}"}</pre>' : '<pre>{"error":"مفتاح خاطئ"}</pre>' }) } },
      flag: 'OQAB{j4v4scr1pt_l34ks}',
      hints: ['اضغط «عرض الكود» واقرأ ما داخل `<script>`.', 'هناك سطر تعليق فيه رابط ومفتاح...', 'اذهب إلى: `/api/v2/dev-panel?key=letmein`'],
      solution: 'كود JavaScript يصل لمتصفح كل زائر، فيمكن قراءته. وجدنا فيه رابط لوحة المطوّرين ومفتاحها في تعليق، فزرناه.',
      defend: 'كل ما في JavaScript **عام** يراه الجميع. لا تضع فيه مفاتيح أو روابط سرية أبداً، وأغلق لوحات الاختبار قبل النشر.'
    },

    /* ---------------- التشفير ② ---------------- */
    {
      id: 'c5', track: 'crypto', title: 'XOR بمفتاح واحد', pts: 150,
      story: 'اعترضنا رسالة مشفّرة بـ XOR، والمرسل استخدم مفتاحاً من **رقم واحد فقط** (من 0 إلى 255). تذكّر درس الكسر بالقوة: 256 احتمالاً لا شيء أمام الحاسوب!',
      env: { type: 'py', code: 'enc = bytes.fromhex("' + xorHex('OQAB{x0r_s1ngl3_k3y_br0k3n}', 77) + '")\n\nfor key in range(256):\n    out = ""\n    for b in enc:\n        out = out + chr(b ^ key)\n    # اطبع فقط إذا بدأت النتيجة بـ OQAB\n    if out.startswith("...."):\n        print(key, out)', hint: 'ضع "OQAB" مكان النقاط' },
      flag: 'OQAB{x0r_s1ngl3_k3y_br0k3n}',
      hints: ['البرنامج جاهز تقريباً: يجرّب كل المفاتيح من 0 إلى 255.', 'غيّر الشرط ليبحث عن بداية العلم: `if out.startswith("OQAB"):`', 'شغّل، وسيظهر المفتاح الصحيح والعلم معاً.'],
      solution: 'جرّبنا المفاتيح الـ 256 كلها، وطبعنا فقط النتيجة التي تبدأ بـ OQAB. المفتاح كان 77.',
      defend: 'مفتاح XOR القصير ضعيف جداً. التشفير الحقيقي يستخدم خوارزميات مثل **AES** بمفاتيح طويلة جداً لا تكفيها مليارات السنين.'
    },
    {
      id: 'c6', track: 'crypto', title: 'ثلاث طبقات', pts: 200,
      story: 'رسالة من «عصابة الظل» مغلّفة بطبقات مثل البصل 🧅: أولاً Base64، وفي داخلها شيفرة قيصر. فكّ الطبقات واحدة واحدة!',
      env: [{ type: 'b64', mode: 'd', text: b64(caesar('OQAB{l4y3rs_l1k3_4n_0n10n}', 13)) }, { type: 'caesar', lang: 'en', paste: true }],
      flag: 'OQAB{l4y3rs_l1k3_4n_0n10n}',
      hints: ['الآلة الأولى تفكّ Base64. انظر للنتيجة: هل تشبه العلم؟', 'النتيجة تبدأ بـ BDNO... هذه شيفرة قيصر! انسخها في آلة قيصر الثانية.', 'أزح الحروف 13 مرة (هذه الإزاحة الشهيرة اسمها ROT13).'],
      solution: 'فككنا Base64 فظهر نص بشيفرة قيصر، ثم أزحناه 13 خانة فظهر العلم.',
      defend: 'تكديس طرق ضعيفة **لا يصنع** طريقة قوية! Base64 ليس تشفيراً، وقيصر يُكسر في ثوانٍ. استخدم تشفيراً حقيقياً مثل AES.'
    },

    /* ---------------- تحليل الملفات ② ---------------- */
    {
      id: 'f5', track: 'files', title: 'الأوامر لا تنسى', pts: 100,
      story: 'مستخدم يقول: «لم أكتب كلمة السر في أي ملف أبداً!». لكن عُقاب يعرف أن الطرفية **تتذكّر** كل أمر كُتب فيها، في ملف مخفي...',
      env: { type: 'term', host: 'user-pc', fs: { home: { oqab: { 'todo.txt': 'لا شيء مهم هنا', '.bash_history': 'ls\ncd games\nls -a\nmysql -u admin -pOQAB{h1st0ry_r3m3mb3rs}\nclear\nexit', games: { 'chess.txt': 'شطرنج' } } } } },
      flag: 'OQAB{h1st0ry_r3m3mb3rs}',
      hints: ['ابحث عن الملفات المخفية: `ls -a`', 'الملف `.bash_history` فيه كل الأوامر القديمة.', '`cat .bash_history` ثم ابحث عن كلمة سر كُتبت داخل أمر.'],
      solution: 'المستخدم كتب كلمة السر **داخل الأمر** نفسه (`-p...`)، والطرفية حفظت الأمر كاملاً في `.bash_history`.',
      defend: 'لا تكتب كلمات السر داخل الأوامر. دع البرنامج **يسألك** عنها، فلا تُحفظ في السجل.'
    },
    {
      id: 'f6', track: 'files', title: 'الكلام داخل البرنامج', pts: 150,
      story: 'برنامج غريب `locker.bin` يطلب كلمة سر لفتح خزنة. لا نستطيع تشغيله، لكن البرامج تحتفظ بداخلها بكلمات مقروءة. لنستخرجها!',
      env: { type: 'term', host: 'lab', fs: { home: { oqab: { 'locker.bin': '\u007fELF\u0002\u0001\u0001\u0000\u0000\u0000\u0000\u0000\u0002\u0000>\u0000\u0001\u0000\u0000\u0000\u0010\u0000\u0000\u0000libc.so.6\u0000\u0000puts\u0000\u0000\u0000Enter password:\u0000\u0000Wrong!\u0000\u0000\u0000OQAB{str1ngs_r3v34l_4ll}\u0000\u0000Correct!\u0000\u0000\u0000' } } } },
      flag: 'OQAB{str1ngs_r3v34l_4ll}',
      hints: ['جرّب `cat locker.bin`: كلام غريب، صحيح؟', 'الأداة `strings` تستخرج الكلام المقروء فقط من أي ملف.', '`strings locker.bin`'],
      solution: '`strings` استخرج كل الكلمات المقروءة من البرنامج، ومنها كلمة السر المحفوظة داخله كما هي.',
      defend: 'لا تضع الأسرار داخل البرامج كما هي. أي شخص يملك الملف يستخرجها بـ strings في ثانية.'
    },

    /* ---------------- لينكس ---------------- */
    {
      id: 'x1', track: 'linux', title: 'ملف بلا صلاحيات', pts: 50,
      story: 'أنت صاحب الملف `secret.txt`، لكن أحداً نزع منه **كل** الصلاحيات، حتى صلاحيتك أنت في القراءة! أنت المالك... إذن تستطيع إرجاعها.',
      env: { type: 'term', host: 'linux-lab', fs: { home: { oqab: { 'secret.txt': { $: 'العلم: OQAB{chm0d_t0_th3_r3scu3}', p: '---------' } } } } },
      flag: 'OQAB{chm0d_t0_th3_r3scu3}',
      hints: ['جرّب `cat secret.txt` ثم `ls -l` لترى الصلاحيات.', 'صاحب الملف يستطيع دائماً تغيير صلاحياته بـ `chmod`.', '`chmod 600 secret.txt` ثم `cat secret.txt`'],
      solution: 'الصلاحيات كانت `---------`. بما أننا أصحاب الملف، أعطينا أنفسنا القراءة والكتابة بـ `chmod 600`.',
      defend: 'الصلاحيات تحمي من **الآخرين**، لكن المالك والمدير root يستطيعان تغييرها دائماً. لذلك نحمي حساب المالك نفسه بكلمة سر قوية.'
    },
    {
      id: 'x2', track: 'linux', title: 'سلّم إلى المدير', pts: 150,
      story: 'أنت مستخدم عادي (oqab) بلا صلاحيات sudo. العلم في `/root/flag.txt`. لكن مستخدماً آخر في الخادم، اسمه `deploy`، **مسموح له** بـ sudo... وربما كان مهملاً في مكان ما!',
      env: { type: 'term', host: 'prod-srv', sudoers: ['deploy'], pw: { deploy: 'Sunshine2026' }, fs: { etc: { group: 'sudo:x:27:deploy' }, root: { '@': { p: 'rwx------', o: 'root' }, 'flag.txt': { $: 'العلم: OQAB{pr1v_3sc_v14_n0t3s}', p: 'rw-------', o: 'root' } }, home: { oqab: { 'readme.txt': 'أنت oqab. لا يمكنك sudo.' }, deploy: { 'deploy_notes.txt': 'ملاحظة لنفسي: كلمة سري الجديدة Sunshine2026 (لا تنسَ!)' } } } },
      flag: 'OQAB{pr1v_3sc_v14_n0t3s}',
      hints: ['من يملك sudo؟ `cat /etc/group`', 'ابحث في بيت deploy: `ls /home/deploy` ثم اقرأ الملف.', '`su deploy` واكتب كلمة السر التي وجدتها، ثم `sudo cat /root/flag.txt`'],
      solution: 'وجدنا أن deploy في مجموعة sudo، وكلمة سره مكتوبة في ملاحظة يقرؤها الجميع. انتقلنا إليه بـ `su deploy`، ثم قرأنا العلم بـ sudo. هذا اسمه «رفع الصلاحيات».',
      defend: 'كلمات السر لا تُكتب في ملفات أبداً، خصوصاً لحسابات sudo. واجعل مجلدات المستخدمين خاصة (`chmod 700`) لا يقرؤها الآخرون.'
    },
    {
      id: 'x3', track: 'linux', title: 'البرنامج الشبح', pts: 150,
      story: 'برنامج غريب يعمل على الخادم منذ أيام. المهاجم أخفى رسالة **داخل أمر التشغيل نفسه**، وشفّرها بطريقة تعرفها جيداً...',
      env: { type: 'term', host: 'ghost-srv', procs: [{ pid: 1, user: 'root', cmd: 'systemd' }, { pid: 88, user: 'root', cmd: 'cron' }, { pid: 412, user: 'www', cmd: 'nginx' }, { pid: 1337, user: 'www', cmd: 'python3 ghost.py --msg ' + b64('OQAB{gh0st_1n_th3_ps}') }, { pid: 2001, user: 'oqab', cmd: 'bash' }], fs: { home: { oqab: { 'alert.txt': 'تنبيه: برنامج غير معروف يعمل. افحص العمليات.' } } } },
      flag: 'OQAB{gh0st_1n_th3_ps}',
      hints: ['اعرض العمليات: `ps`', 'العملية 1337 فيها نص غريب ينتهي بـ `=`... هذه علامة Base64!', 'فكّه: `base64 -d` ثم النص'],
      solution: '`ps` أظهر أمر التشغيل الكامل للعملية 1337، وفيه نص Base64. فككناه بـ `base64 -d` فظهر العلم.',
      defend: 'أوامر التشغيل يراها كل مستخدمي الخادم بـ ps، فلا تمرّر فيها أسراراً. ومن يراقب العمليات بانتظام يكشف البرامج الشبحية مبكراً.'
    },
    {
      id: 'x4', track: 'linux', title: 'الوحيد بين المكرّرين', pts: 200,
      story: 'ملف `data.txt` فيه أكثر من 100 سطر، وكل سطر مكرّر **مرتين** إلا سطراً واحداً فقط ظهر مرة واحدة. ذلك السطر هو العلم. لن تجده بعينيك... استخدم الأنابيب!',
      env: { type: 'term', host: 'pipe-lab', fs: { home: { oqab: { 'data.txt': hay } } } },
      flag: 'OQAB{un1qu3_n33dl3}',
      hints: ['الأداة `uniq -c` تعدّ الأسطر المتكرّرة المتجاورة. لكن المتكرّر هنا ليس متجاوراً...', 'رتّب أولاً لتصبح المتكرّرات متجاورة: `sort data.txt | uniq -c`', 'ابحث عن السطر الذي عدده 1: `sort data.txt | uniq -c | grep " 1 "`'],
      solution: '`sort` جمع الأسطر المتشابهة بجانب بعضها، و`uniq -c` عدّ كل سطر، و`grep " 1 "` أظهر السطر الذي تكرّر مرة واحدة فقط.',
      defend: 'هذه نفس الطريقة التي يكتشف بها المدافعون **الحدث الغريب الوحيد** بين ملايين الأحداث العادية في السجلات.'
    },

    /* ---------------- قراءة الكود ---------------- */
    {
      id: 'k1', track: 'code', title: 'الكلمة المقلوبة', pts: 50,
      story: 'برنامج حارس يفحص كلمة السر. لا تحتاج تخميناً: اقرأ الكود وافهم كيف يفحص، ثم اجعله يكشف السر بنفسه!',
      env: { type: 'py', code: 'def check(pw):\n    return pw[::-1] == "}d4b_3d0c_d43r{BAQO"\n\n# [::-1] تعني: اقلب النص\n# ما الكلمة التي إذا قلبناها صارت هذه؟\nprint(check("test"))' },
      flag: 'OQAB{r34d_c0d3_b4d}',
      hints: ['`pw[::-1]` تقلب النص. إذن كلمة السر هي النص المحفوظ **مقلوباً**.', 'اطبع النص المقلوب بنفسك: `print("}d4b_3d0c_d43r{BAQO"[::-1])`'],
      solution: 'الحارس يقلب ما تكتبه ويقارنه بنص محفوظ. فقلبنا النص المحفوظ نفسه، فظهرت كلمة السر.',
      defend: 'إذا كان الكود عند المستخدم، فهو يرى كل منطق الفحص. الفحص الحقيقي يكون على الخادم، ويقارن **بصمة** كلمة السر وليس الكلمة نفسها.'
    },
    {
      id: 'k2', track: 'code', title: 'أرقام بدل الحروف', pts: 100,
      story: 'المبرمج ظنّ أنه ذكي: خبّأ كلمة السر كقائمة **أرقام** حتى لا يقرأها أحد. لكنك تعرف أن كل حرف له رقم في الجدول! (تذكّر `chr`)',
      env: { type: 'py', code: 'secret = [79, 81, 65, 66, 123, 97, 115, 99, 49, 49, 95, 49, 115, 95, 110, 48, 116, 95, 51, 110, 99, 114, 121, 112, 116, 49, 48, 110, 125]\n\ndef check(pw):\n    return [ord(c) for c in pw] == secret\n\n# حوّل الأرقام إلى حروف هنا\n' },
      flag: 'OQAB{asc11_1s_n0t_3ncrypt10n}',
      hints: ['`chr(79)` تعطي الحرف O.', 'استخدم حلقة: لكل رقم n في secret، أضف chr(n) إلى نص.', '`print("".join(chr(n) for n in secret))`'],
      solution: 'حوّلنا كل رقم إلى حرفه بـ chr، فظهرت كلمة السر. الأرقام مجرد ترميز وليست تشفيراً.',
      defend: 'تحويل الحروف إلى أرقام (ASCII) أو Base64 **ترميز** يعكسه أي أحد. لا تخبّئ الأسرار به.'
    },
    {
      id: 'k3', track: 'code', title: 'المفتاح في الكود', pts: 150,
      story: 'هذه المرة شفّر المبرمج كلمة السر بـ XOR. لكنه ارتكب خطأً كبيراً: ترك **المفتاح** مكتوباً في الكود نفسه! 🤦',
      env: { type: 'py', code: 'KEY = 23\nenc = [' + Array.from('OQAB{k3y_1n_c0d3_0opS}').map(c => c.charCodeAt(0) ^ 23).join(', ') + ']\n\ndef check(pw):\n    return [ord(c) ^ KEY for c in pw] == enc\n\n# XOR مرتين بنفس المفتاح يرجع الأصل!\n' },
      flag: 'OQAB{k3y_1n_c0d3_0opS}',
      hints: ['تذكّر سحر XOR: `(x ^ KEY) ^ KEY == x`', 'لكل رقم n في enc، الحرف الأصلي هو `chr(n ^ KEY)`', '`print("".join(chr(n ^ KEY) for n in enc))`'],
      solution: 'عملنا XOR لكل رقم مع نفس المفتاح المكتوب في الكود، فرجعت كلمة السر الأصلية.',
      defend: 'التشفير قوي بقدر **سرية المفتاح**. مفتاح مكتوب داخل الكود = لا تشفير. المفاتيح تُحفظ في أماكن محمية منفصلة.'
    },
    {
      id: 'k4', track: 'code', title: 'الحارس ذو الشروط', pts: 200,
      story: 'آخر حارس، وهو الأذكى: كلمة السر غير مكتوبة في أي مكان! فقط **شروط** يجب أن تتحقّق كلها. اقرأ كل شرط، واستنتج كلمة السر حرفاً حرفاً، ثم تأكّد بتشغيل `check`.',
      env: { type: 'py', code: 'def check(pw):\n    if len(pw) != 14: return False\n    if pw[:5] != "OQAB{": return False\n    if pw[-1] != "}": return False\n    mid = pw[5:13]\n    if mid[0:4] != "l0g1": return False\n    if mid[4] != "c": return False\n    if mid[5:] != mid[5] * 3: return False\n    if mid[5] != "!": return False\n    return True\n\nprint(check("OQAB{????????}"))' },
      flag: 'OQAB{l0g1c!!!}',
      hints: ['الطول 14، يبدأ بـ OQAB{ وينتهي بـ }. إذن في الوسط 8 حروف (mid).', 'أول 4 من الوسط l0g1، ثم c، ثم 3 حروف كلها متشابهة.', 'الحرف المكرّر هو !، إذن: `OQAB{l0g1c!!!}`. جرّبه في check.'],
      solution: 'قرأنا الشروط واحداً واحداً: البداية والنهاية والطول، ثم أجزاء الوسط. كل شرط كشف قطعة، حتى اكتملت كلمة السر.',
      defend: 'هذا ما يفعله «مهندسو الهندسة العكسية»: يقرؤون منطق البرنامج ليفهموه. لذلك لا يُحفظ منطق الأسرار في جهاز المستخدم.'
    },

    /* ---------------- حزم الشبكة ---------------- */
    {
      id: 'n1', track: 'net', title: 'كلمة السر الطائرة', pts: 50,
      story: 'التقطنا حزماً من شبكة تدريب وهمية. أحدهم سجّل دخوله في موقع **بلا قفل** (HTTP). افتح الحزم وابحث!',
      env: { type: 'packets', packets: [{ src: '10.0.0.4', dst: '10.0.0.80', proto: 'TCP', port: 80, info: 'SYN' }, { src: '10.0.0.80', dst: '10.0.0.4', proto: 'TCP', port: 80, info: 'SYN-ACK' }, { src: '10.0.0.4', dst: '10.0.0.80', proto: 'TCP', port: 80, info: 'ACK' }, { src: '10.0.0.4', dst: '10.0.0.80', proto: 'HTTP', port: 80, info: 'GET /', data: 'GET / HTTP/1.1\nHost: club.oqab' }, { src: '10.0.0.4', dst: '10.0.0.80', proto: 'HTTP', port: 80, info: 'POST /login', data: 'POST /login HTTP/1.1\n\nuser=mona&pass=OQAB{plain_t3xt_http}' }, { src: '10.0.0.80', dst: '10.0.0.4', proto: 'HTTP', port: 80, info: '302 Found' }, { src: '10.0.0.4', dst: '142.250.1.1', proto: 'TLS', port: 443, info: 'Application Data', data: '17 03 03 ... (مشفّر)' }] },
      flag: 'OQAB{plain_t3xt_http}',
      hints: ['اكتب `POST` في الفلتر.', 'اضغط على حزمة POST /login لترى محتواها.'],
      solution: 'حزمة POST حملت اسم المستخدم وكلمة السر كنص مكشوف، لأن الموقع يستخدم HTTP بلا تشفير.',
      defend: 'كل موقع فيه تسجيل دخول يجب أن يستخدم **HTTPS** فقط. ومع HTTPS تظهر الحزمة كرموز مشفّرة لا معنى لها.'
    },
    {
      id: 'n2', track: 'net', title: 'من يطرق كل الأبواب؟', pts: 100,
      story: 'خادمنا رأى طرقاً غريباً: جهاز يرسل SYN لأبواب كثيرة جداً، واحداً تلو الآخر. هذا **مسح منافذ** (Port Scan). من الفاعل؟ العلم هو عنوانه داخل `OQAB{...}`.',
      flagHint: 'شكله: `OQAB{العنوان}` مثل `OQAB{1.2.3.4}`',
      env: { type: 'packets', packets: [{ src: '10.0.0.4', dst: '10.0.0.80', proto: 'TCP', port: 443, info: 'SYN' }, { src: '10.0.0.80', dst: '10.0.0.4', proto: 'TCP', port: 443, info: 'SYN-ACK' }, { src: '10.0.0.4', dst: '10.0.0.80', proto: 'TCP', port: 443, info: 'ACK' }].concat([21, 22, 23, 25, 53, 80, 110, 139, 143, 443, 445, 3306, 3389, 8080].map(pt => ({ src: '45.33.32.156', dst: '10.0.0.80', proto: 'TCP', port: pt, info: 'SYN' }))).concat([{ src: '10.0.0.9', dst: '10.0.0.80', proto: 'TCP', port: 80, info: 'SYN' }]) },
      flag: 'OQAB{45.33.32.156}',
      hints: ['اكتب `SYN` في الفلتر، وانظر من يرسل لأبواب كثيرة مختلفة.', 'جهاز طبيعي يتصل بباب واحد ويكمل المصافحة. الماسح يرسل SYN فقط لأبواب كثيرة.'],
      solution: 'العنوان 45.33.32.156 أرسل SYN لـ 14 باباً مختلفاً بسرعة دون أن يكمل أي مصافحة: هذا توقيع مسح المنافذ.',
      defend: 'أنظمة كشف التسلّل (IDS) تراقب هذا النمط تلقائياً وتحظر الماسح. وأغلق كل باب لا تحتاجه، فالماسح لن يجد شيئاً.'
    },
    {
      id: 'n3', track: 'net', title: 'حرف في كل حزمة', pts: 150,
      story: 'برنامج «تلنت» (Telnet) القديم يرسل كل حرف تكتبه في **حزمة منفصلة**، وبلا تشفير! أحدهم كتب كلمة سر عبر تلنت. اجمع الحروف بالترتيب.',
      env: { type: 'packets', packets: [{ src: '10.0.0.7', dst: '10.0.0.2', proto: 'TCP', port: 23, info: 'SYN' }, { src: '10.0.0.2', dst: '10.0.0.7', proto: 'TELNET', port: 23, info: 'Login:', data: 'Password: ' }].concat(Array.from('OQAB{t3ln3t_1s_l0ud}').map(ch => ({ src: '10.0.0.7', dst: '10.0.0.2', proto: 'TELNET', port: 23, info: 'حرف', data: ch }))).concat([{ src: '10.0.0.2', dst: '10.0.0.7', proto: 'TELNET', port: 23, info: 'Welcome', data: 'أهلاً بك!' }]) },
      flag: 'OQAB{t3ln3t_1s_l0ud}',
      hints: ['اكتب `TELNET` في الفلتر.', 'افتح حزم «حرف» واحدة واحدة بالترتيب، واكتب كل حرف تراه.'],
      solution: 'كل حزمة TELNET حملت حرفاً واحداً مكشوفاً. جمعناها بالترتيب فظهرت كلمة السر كاملة.',
      defend: 'Telnet قديم وخطير. البديل الآمن هو **SSH** الذي يشفّر كل شيء. لذلك المنفذ 23 مغلق في أي خادم محترم.'
    },
    {
      id: 'n4', track: 'net', title: 'التهريب عبر DNS', pts: 200,
      story: 'برنامج خبيث يسرّب البيانات بحيلة ذكية: يقطّع السر إلى قطع، ويخبّئ كل قطعة في **سؤال DNS** لاسم غريب! الجدران النارية نادراً ما تمنع DNS... اجمع القطع وفكّها.',
      env: [{ type: 'packets', packets: (function () { const s = b64('OQAB{dns_3xf1ltr4t10n}'); const parts = s.match(/.{1,8}/g); const L = [{ src: '10.0.0.5', dst: '8.8.8.8', proto: 'DNS', port: 53, info: 'google.com ؟' }]; parts.forEach((p, i) => { L.push({ src: '10.0.0.66', dst: '8.8.8.8', proto: 'DNS', port: 53, info: p + '.x' + i + '.evil.oqab ؟', data: 'سؤال DNS عن الاسم: ' + p + '.x' + i + '.evil.oqab' }); if (i === 1) L.push({ src: '10.0.0.5', dst: '8.8.8.8', proto: 'DNS', port: 53, info: 'youtube.com ؟' }); }); return L; })() }, { type: 'b64', mode: 'd', text: '' }],
      flag: 'OQAB{dns_3xf1ltr4t10n}',
      hints: ['اكتب `evil` في الفلتر.', 'كل اسم يبدأ بقطعة، ثم `.x0` و `.x1`... هذا ترتيب القطع.', 'اجمع القطع بالترتيب (x0 ثم x1 ثم x2...) بلا نقاط، والصقها في آلة Base64.'],
      solution: 'الجهاز 10.0.0.66 سأل عن أسماء غريبة تحت evil.oqab. أول جزء من كل اسم قطعة Base64، والرقم بعد x ترتيبها. جمعناها وفككناها.',
      defend: 'المدافعون يراقبون أسئلة DNS الطويلة والغريبة والكثيرة لنفس النطاق، فهي علامة تهريب بيانات.'
    },

    /* ---------------- القضايا الكبرى ---------------- */
    {
      id: 's1', track: 'case', title: 'القضية 1: الواجب المختفي', pts: 100,
      story: '📁 **القضية:** مشروع سارة النهائي اختفى من خادم المدرسة الوهمي قبل التسليم بساعة! سارة تبكي، والمعلّم يحتاج الحقيقة. من حذفه؟ ومتى؟ وهل يمكن إنقاذه؟\n\nالعلم مخبّأ في الملف المحذوف نفسه.',
      env: { type: 'term', host: 'school-srv', cwd: '/home/oqab', fs: { home: { oqab: { 'case.txt': 'ابدأ من سجل الأحداث: /var/log/events.log' } }, var: { log: { 'events.log': '07:58 LOGIN sara\n08:10 SAVE sara project_final.docx\n08:15 LOGOUT sara\n09:02 LOGIN omar\n09:03 OPEN omar /shared/sara/project_final.docx\n09:04 DELETE omar /shared/sara/project_final.docx -> /shared/.trash/\n09:05 LOGOUT omar\n09:30 LOGIN teacher' } }, shared: { sara: {}, '.trash': { 'project_final.docx': 'مشروع سارة: نظام الطاقة الشمسية ☀️\nالعلم: OQAB{c4s3_cl0s3d_s4r4_s4v3d}' } } } },
      flag: 'OQAB{c4s3_cl0s3d_s4r4_s4v3d}',
      hints: ['اقرأ السجل: `cat /var/log/events.log`. ابحث عن DELETE.', 'السجل يقول أين ذهب الملف المحذوف. المجلد يبدأ بنقطة (مخفي).', '`ls -a /shared` ثم `cat /shared/.trash/project_final.docx`'],
      solution: 'السجل كشف أن omar حذف الملف الساعة 09:04 ونقله إلى `/shared/.trash/`. وجدنا الملف هناك سليماً وأنقذنا مشروع سارة.',
      defend: 'المجلدات المشتركة يجب أن تكون بصلاحيات تمنع الآخرين من الحذف، والسجلات تُحفظ دائماً، فهي ذاكرة الخادم.'
    },
    {
      id: 's2', track: 'case', title: 'القضية 2: الحساب المخطوف', pts: 150,
      story: '📁 **القضية:** حساب يوسف في لعبة وهمية سُرق، واختفت كل جواهره! لدينا جدول سجلات الدخول. ابحث عن الدخول الغريب: من بلد آخر، وفي وقت غريب. المهاجم ترك «توقيعاً» في اسم جهازه.',
      env: { type: 'sql', tables: { logins: { cols: ['id', 'user', 'country', 'time', 'device'], rows: [[1, 'yusuf', 'EG', '18:02', 'Yusuf-Phone'], [2, 'sara', 'EG', '18:10', 'Sara-iPad'], [3, 'yusuf', 'EG', '19:30', 'Yusuf-Phone'], [4, 'ali', 'SA', '20:00', 'Ali-PC'], [5, 'yusuf', 'XX', '03:14', 'OQAB{l0g1n_fr0m_n0wh3r3}'], [6, 'yusuf', 'EG', '08:00', 'Yusuf-Phone'], [7, 'mona', 'MA', '21:45', 'Mona-Laptop']] }, trades: { cols: ['id', 'from_user', 'to_user', 'gems', 'time'], rows: [[1, 'sara', 'ali', 10, '18:20'], [2, 'yusuf', 'shadow99', 5000, '03:16'], [3, 'mona', 'sara', 5, '22:00']] } }, start: "SELECT * FROM logins WHERE user = 'yusuf'" },
      flag: 'OQAB{l0g1n_fr0m_n0wh3r3}',
      hints: ['اعرض كل دخول يوسف: `SELECT * FROM logins WHERE user = \'yusuf\'`', 'أيّ دخول من بلد غريب وفي منتصف الليل؟ انظر لعمود device.', 'لتعرف أين ذهبت الجواهر: `SELECT * FROM trades WHERE from_user = \'yusuf\'`'],
      solution: 'دخول رقم 5 جاء من بلد غريب الساعة 03:14 (يوسف نائم!). وبعده بدقيقتين نُقلت 5000 جوهرة إلى shadow99. اسم الجهاز كان العلم.',
      defend: 'التحقّق بخطوتين (2FA) كان سيوقف المهاجم حتى لو عرف كلمة السر. والتنبيه عند الدخول من بلد جديد يكشف السرقة فوراً.'
    },
    {
      id: 's3', track: 'case', title: 'القضية 3: رسالة العصابة', pts: 150,
      story: '📁 **القضية:** التقطت الشرطة الوهمية حزماً من شبكة «عصابة الظل». إحدى الحزم فيها رسالة بين أفراد العصابة، مغلّفة بطبقتين. جدها، وفكّ الطبقتين، لتعرف كلمة السر التي يتّفقون عليها.',
      env: [{ type: 'packets', packets: [{ src: '172.16.0.3', dst: '172.16.0.9', proto: 'HTTP', port: 80, info: 'GET /news', data: 'GET /news HTTP/1.1' }, { src: '172.16.0.9', dst: '172.16.0.3', proto: 'CHAT', port: 6667, info: 'رسالة', data: 'الزعيم: الرسالة القادمة مغلّفة. فكّ Base64 أولاً ثم أزح الحروف 3 للخلف.' }, { src: '172.16.0.9', dst: '172.16.0.3', proto: 'CHAT', port: 6667, info: 'رسالة', data: b64(caesar('OQAB{g4ng_m3ss4g3_d3c0d3d}', 3)) }, { src: '172.16.0.3', dst: '172.16.0.9', proto: 'CHAT', port: 6667, info: 'رسالة', data: 'وصلت 👍' }] }, { type: 'b64', mode: 'd', text: '' }, { type: 'caesar', lang: 'en', paste: true }],
      flag: 'OQAB{g4ng_m3ss4g3_d3c0d3d}',
      hints: ['اكتب `CHAT` في الفلتر واقرأ رسائل الزعيم.', 'انسخ الرسالة المرمّزة في آلة Base64.', 'النتيجة تبدأ بـ RTDE: أزحها في آلة قيصر حتى تصبح OQAB (إزاحة 3 للخلف = 23 للأمام).'],
      solution: 'الزعيم شرح الطريقة في رسالة مكشوفة! فككنا Base64، ثم أزحنا قيصر 3 للخلف، فظهرت كلمة السر.',
      defend: 'خطأ العصابة: أرسلوا **طريقة الفك** في نفس القناة غير المشفّرة. التشفير الحقيقي يعتمد على مفتاح سري لا على إخفاء الطريقة.'
    },
    {
      id: 's4', track: 'case', title: 'القضية 4: الخادم المريض', pts: 200,
      story: '📁 **القضية الكبرى:** خادم «عُش عُقاب» بطيء جداً منذ 3 أيام. المدير يشكّ في برنامج تعدين خفي. مهمتك الكاملة: اكتشف البرنامج، وكيف يعود بعد كل إعادة تشغيل، واقرأ إعداداته. العلم هو «المحفظة» التي يرسل إليها المهاجم أرباحه.\n\nلديك صلاحية sudo.',
      env: { type: 'term', host: 'nest-srv', sudoers: ['oqab'], procs: [{ pid: 1, user: 'root', cmd: 'systemd' }, { pid: 120, user: 'root', cmd: 'cron' }, { pid: 410, user: 'www', cmd: 'nginx' }, { pid: 3141, user: 'www', cmd: '/tmp/.sys/kworker --config /tmp/.sys/c.json (CPU 99%)' }, { pid: 3300, user: 'oqab', cmd: 'bash' }], fs: { home: { oqab: { 'ticket.txt': 'الخادم بطيء. ابدأ بـ ps' } }, tmp: { '.sys': { '@': { p: 'rwx------', o: 'www' }, 'kworker': { $: 'MZ...miner...', o: 'www' }, 'c.json': { $: '{\n  "pool": "pool.evil.oqab:3333",\n  "wallet": "OQAB{m1n3r_hunt3r_pr0}",\n  "cpu": 99\n}', p: 'rw-------', o: 'www' } } }, etc: { 'crontab': '# مهام تلقائية\n0 3 * * * root /usr/bin/backup.sh\n@reboot www /tmp/.sys/kworker --config /tmp/.sys/c.json' } } },
      flag: 'OQAB{m1n3r_hunt3r_pr0}',
      hints: ['`ps` يكشف برنامجاً باسم يشبه برامج النظام (kworker) لكنه يعمل من `/tmp/.sys`!', 'كيف يعود بعد إعادة التشغيل؟ اقرأ `cat /etc/crontab` وابحث عن @reboot.', 'ملف الإعدادات محمي: `sudo cat /tmp/.sys/c.json`'],
      solution: '`ps` كشف «kworker» مزيّفاً يعمل من مجلد مخفي في /tmp. السطر `@reboot` في crontab يعيد تشغيله مع كل إقلاع. وبـ sudo قرأنا إعداداته فظهرت محفظة المهاجم.',
      defend: 'الإصلاح الكامل: `kill` للعملية، وحذف سطر @reboot، وحذف المجلد، ثم سدّ الثغرة التي دخل منها عبر www، وتغيير كلمات السر.'
    }
  );
})();
