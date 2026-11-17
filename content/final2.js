(function () {
  const SHOP_FS = {
    etc: { hostname: 'falcon-shop', passwd: 'root:x:0:0\nwww:x:33:33\nfalcon:x:1000:1000\nguest:x:1001:1001' },
    var: {
      www: {
        'index.html': '<h1>متجر الصقر</h1>',
        'config.php': { $: 'db_user=shop\ndb_pass=Falcon#Shop2026', p: 'rw-rw-rw-' },
        uploads: { 'logo.png': '[صورة]', '.x.php': { $: 'باب خلفي: ينفّذ أي أمر يرسله المهاجم', p: 'rwxrwxrwx', o: 'www' } }
      },
      log: { 'access.log': '10:00 GET /index.html 10.0.0.5\n10:02 GET /config.php 185.9.9.9\n10:03 POST /uploads 185.9.9.9\n10:04 GET /uploads/.x.php?cmd=whoami 185.9.9.9\n10:05 GET /uploads/.x.php?cmd=xmrig 185.9.9.9' }
    },
    home: { falcon: { 'todo.txt': 'مهام الحارس:\n1. افحص صلاحيات ملفات الموقع\n2. افحص سجل الزيارات\n3. افحص البرامج التي تعمل' } }
  };
  const SHOP_PROCS = [{ pid: 1, user: 'root', cmd: 'systemd' }, { pid: 300, user: 'www', cmd: 'nginx' }, { pid: 666, user: 'www', cmd: 'xmrig --hidden (من /var/www/uploads)' }, { pid: 700, user: 'falcon', cmd: 'bash' }];
  const USERS = { cols: ['id', 'username', 'role', 'created'], rows: [[1, 'falcon', 'admin', '2025-01-10'], [2, 'sara', 'customer', '2025-03-02'], [3, 'ali', 'customer', '2025-06-11'], [4, 'support', 'admin', '2026-11-17'], [5, 'mona', 'customer', '2025-09-20'], [6, 'yusuf', 'customer', '2026-02-14']] };
  const ORDERS = { cols: ['id', 'user', 'item', 'price'], rows: [[1, 'sara', 'سكن تنين', 50], [2, 'ali', 'جواهر', 20], [3, 'support', 'كل المتجر', 0], [4, 'mona', 'سيف', 35], [5, 'support', 'جواهر ×9999', 0]] };
  const LOGIN_DB = { users: { cols: ['id', 'username', 'password', 'role'], rows: [[1, 'admin', 'Falcon#Admin!', 'admin'], [2, 'sara', 'pink-moon-7', 'customer']] } };
  C.units.push({
    id: 'final2', project: true, part: 2, doneMedal: 'stage1', title: 'المشروع الكبير ②: عملية الصقر', icon: '🦅', blurb: '«متجر الصقر» للألعاب اختُرق! استخدم كل أدوات الجزء الثاني: لينكس، و SQL، و Python، والشبكات، والتشفير، لتحقّق وتنظّف وتحمي.',
    lessons: [
      {
        id: 'p1', title: 'المهمة 1: الاستطلاع والصلاحيات', mins: 15, steps: [
          { t: 'say', mood: 'think', m: '🚨 **بلاغ عاجل:** صاحب «متجر الصقر» يقول: «ظهر في متجري حساب مدير غريب، وطلبات مجانية بآلاف الجواهر، والخادم بطيء جداً!». أنت المحقّق الأمني. لديك إذن كامل من صاحب المتجر لفحص خادمه (وهذا أهم شرط في أي عمل أمني حقيقي ✅).' },
          { t: 'sh', m: 'ابدأ الفحص من الداخل:', host: 'falcon-shop', user: 'falcon', cwd: '/home/falcon', fs: SHOP_FS, sudoers: ['falcon'], goals: [{ d: 'اقرأ قائمة المهام: `cat todo.txt`', ok: c => c.cmd === 'cat' && /todo/.test(c.args[0] || '') }, { d: 'افحص صلاحيات ملفات الموقع: `ls -l /var/www`', ok: c => c.cmd === 'ls' && c.args.includes('-l') && /www/.test(c.args.join(' ')) }, { d: 'ملف `config.php` صلاحيته rw-rw-rw-! اجعلها 600: `sudo chmod 600 /var/www/config.php`', ok: c => c.T.node('/var/www/config.php').p === 'rw-------' }, { d: 'ابحث عن الملفات المخفية في uploads: `ls -la /var/www/uploads`', ok: c => c.cmd === 'ls' && c.args.some(x => /^-\w*a/.test(x)) && /uploads/.test(c.args.join(' ')) }], yes: 'وجدت ملفاً مخفياً غريباً `.x.php` صلاحيته 777 في مجلد الصور المرفوعة! 🚩' },
          { t: 'q', q: 'لماذا كانت صلاحية config.php (rw-rw-rw-) خطيرة؟', o: ['لأن أي مستخدم على الخادم يستطيع قراءة كلمة سر قاعدة البيانات وتغييرها', 'لأنها طويلة', 'لا خطر'], a: 0, tag: 'المشروع ②' },
          { t: 'q', q: 'ملف `.x.php` في مجلد الصور المرفوعة. لماذا هو مريب جداً؟', o: ['مخفي، وصلاحيته 777، وهو برنامج في مكان مخصّص للصور فقط', 'لأن اسمه قصير', 'ليس مريباً'], a: 0, tag: 'المشروع ②' }
        ]
      },
      {
        id: 'p2', title: 'المهمة 2: قاعدة البيانات تتكلّم', mins: 15, steps: [
          { t: 'say', m: 'الآن لقاعدة بيانات المتجر. فيها جدولان: `users` (الحسابات) و `orders` (الطلبات). ابحث عن آثار المهاجم بـ SQL!' },
          { t: 'do', m: 'حقّق بالاستعلامات:', w: { type: 'sql', tables: { users: USERS, orders: ORDERS }, goal: 1, start: 'SELECT * FROM users', missions: [{ d: 'اعرض كل المدراء: الحسابات التي `role = \'admin\'`', ok: r => r.rows.length === 2 && r.rows.some(x => x.includes('support')) }, { d: 'رتّب الحسابات حسب تاريخ الإنشاء من الأحدث (`ORDER BY created DESC`)', ok: r => r.rows.length === 6 && r.rows[0].includes('support') }, { d: 'اعرض طلبات المستخدم `support` من جدول orders', ok: r => r.rows.length === 2 && r.rows.every(x => x.includes('support')) }], yes: 'كشفت المهاجم: حساب «support» مدير أُنشئ أمس، وطلب المتجر كله مجاناً! 🕵️' } },
          { t: 'in', q: 'ما اسم حساب المدير المزيّف الذي صنعه المهاجم؟', a: ['support'], ltr: 1, tag: 'المشروع ②' },
          { t: 'say', m: 'كيف صنع المهاجم حساب مدير؟ صفحة دخول لوحة التحكم كانت **تلصق** كلام المستخدم في SQL! لنتأكّد أن الحماية صارت تعمل بعد إصلاح المبرمجين:' },
          { t: 'do', m: 'اختبر صفحة الدخول بعد الإصلاح: شغّل الحماية ✅ وجرّب الحيلة `\' OR \'1\'=\'1` في كلمة المرور:', w: { type: 'sqli', goal: 1, user: 'admin', tables: LOGIN_DB, fix: true, yesFix: 'الثغرة مسدودة! ✅ الآن صفحة الدخول تعامل كل ما يُكتب كنص فقط.' } }
        ]
      },
      {
        id: 'p3', title: 'المهمة 3: محلّل الزيارات بـ Python', mins: 15, steps: [
          { t: 'say', m: 'سجل زيارات الموقع فيه آلاف الأسطر عادة. سنكتب برنامجاً يعدّ الطلبات لكل عنوان IP، ويكشف من طلب **ملفات حسّاسة** مثل config أو الملفات المخفية.' },
          { t: 'py', m: 'أكمل المحلّل: عُدّ الطلبات لكل عنوان (القاموس)، واطبع العناوين التي طلبت شيئاً فيه كلمة `config` أو `.x.php`:', code: 'log = """10:00 GET /index.html 10.0.0.5\n10:01 GET /shop 10.0.0.7\n10:02 GET /config.php 185.9.9.9\n10:03 POST /uploads 185.9.9.9\n10:04 GET /uploads/.x.php?cmd=whoami 185.9.9.9\n10:05 GET /index.html 10.0.0.5\n10:06 GET /uploads/.x.php?cmd=xmrig 185.9.9.9"""\n\ncount = {}\nsuspects = []\nfor line in log.split("\\n"):\n    parts = line.split()\n    path = parts[2]\n    ip = parts[3]\n    count[ip] = count.get(ip, 0) + ...\n    if "config" in path or ".x.php" in ...:\n        if ip not in suspects:\n            suspects.append(ip)\n\nprint("عدد الطلبات:", count)\nprint("المشتبه بهم:", suspects)', check: { outHas: ["المشتبه بهم: ['185.9.9.9']", "'185.9.9.9': 4"] }, hint: 'الأول 1، والثاني path', sol: 'log = """10:00 GET /index.html 10.0.0.5\n10:01 GET /shop 10.0.0.7\n10:02 GET /config.php 185.9.9.9\n10:03 POST /uploads 185.9.9.9\n10:04 GET /uploads/.x.php?cmd=whoami 185.9.9.9\n10:05 GET /index.html 10.0.0.5\n10:06 GET /uploads/.x.php?cmd=xmrig 185.9.9.9"""\n\ncount = {}\nsuspects = []\nfor line in log.split("\\n"):\n    parts = line.split()\n    path = parts[2]\n    ip = parts[3]\n    count[ip] = count.get(ip, 0) + 1\n    if "config" in path or ".x.php" in path:\n        if ip not in suspects:\n            suspects.append(ip)\n\nprint("عدد الطلبات:", count)\nprint("المشتبه بهم:", suspects)', yes: 'برنامجك كشف المهاجم: 185.9.9.9! 🎯' },
          { t: 'order', q: 'من السجل، رتّب خطوات الهجوم كما حدثت:', items: ['طلب ملف الإعدادات config.php (سرق كلمة السر)', 'رفع ملف خبيث إلى مجلد uploads', 'استخدم الباب الخلفي .x.php لينفّذ whoami', 'شغّل المعدّن الخفي xmrig'], yes: 'هذه قصة الاختراق كاملة! 📖' },
          { t: 'q', q: 'ما الثغرة التي سمحت برفع ملف .php إلى مجلد الصور؟', o: ['الموقع لا يفحص نوع الملفات المرفوعة', 'الواي فاي ضعيف', 'الخط صغير'], a: 0, why: 'مجلد الصور يجب أن يقبل الصور فقط، ويُفحص على الخادم (تذكّر: لا تثق بالمستخدم!).', tag: 'المشروع ②' }
        ]
      },
      {
        id: 'p4', title: 'المهمة 4: طرد الدخيل', mins: 15, steps: [
          { t: 'say', m: 'عرفت كل شيء. الآن التنظيف! تذكّر الخطة: **أوقف** ← **احذف** ← **سدّ الثغرة** ← **غيّر كلمات السر**.' },
          { t: 'sh', m: 'نظّف الخادم:', host: 'falcon-shop', user: 'falcon', cwd: '/home/falcon', fs: SHOP_FS, sudoers: ['falcon'], procs: SHOP_PROCS, net: { hosts: { 'falcon-shop.com': { ip: '93.184.20.50', ms: 20, hops: [] } } }, goals: [{ d: 'اعرض البرامج العاملة: `ps`', ok: c => c.cmd === 'ps' }, { d: 'أوقف المعدّن الخفي بقوة المدير (رقمه 666)', ok: c => !c.T.procs.some(p => p.pid === 666) }, { d: 'احذف الباب الخلفي: `sudo rm /var/www/uploads/.x.php`', ok: c => !c.T.node('/var/www/uploads/.x.php') }, { d: 'تأكّد أن الموقع ما زال يعمل: `ping falcon-shop.com`', ok: c => c.cmd === 'ping' }], yes: 'الخادم نظيف! 🧹 والموقع يعمل.' },
          { t: 'sort', q: 'بعد التنظيف: ماذا يجب أن نفعل أيضاً؟', buckets: ['✅ ضروري', '❌ لا يفيد'], items: [['تغيير كلمة سر قاعدة البيانات المسروقة', 0], ['حذف حساب المدير المزيّف support', 0], ['منع رفع ملفات غير الصور', 0], ['تحديث برامج الخادم', 0], ['تغيير لون شعار المتجر', 1], ['إعادة تشغيل الخادم فقط والتوقّف', 1]], yes: 'تفكير حارس محترف! الإصلاح الحقيقي يسدّ الباب، لا يطرد اللص فقط.' },
          { t: 'q', q: 'لماذا يجب تغيير كلمة سر قاعدة البيانات حتى بعد حذف الباب الخلفي؟', o: ['لأن المهاجم قرأها ويستطيع العودة بها', 'لأنها قديمة فقط', 'لا داعي'], a: 0, tag: 'المشروع ②' }
        ]
      },
      {
        id: 'p5', title: 'المهمة 5: التقرير الموقّع', mins: 12, steps: [
          { t: 'say', m: 'آخر مهمة لأي محقّق: **التقرير**. صاحب المتجر يحتاج أن يفهم ما حدث، وماذا أصلحت. والتقرير يجب أن يكون **موقّعاً رقمياً** حتى لا يغيّره أحد بعدك.' },
          { t: 'order', q: 'رتّب أقسام تقرير الحادثة:', items: ['ماذا حدث؟ (ملخّص)', 'كيف دخل المهاجم؟ (الثغرات)', 'ماذا فعل؟ (الأدلة من السجلات)', 'ماذا أصلحنا؟', 'توصيات حتى لا يتكرّر'], yes: 'هيكل تقرير احترافي! 📋' },
          { t: 'do', m: 'وقّع التقرير بمفتاحك الخاص، ثم أثبت أن أي تعديل يُكشف (غيّر حرفاً وتحقّق):', w: { type: 'sign', goal: 1, text: 'تقرير عملية الصقر: المهاجم 185.9.9.9 دخل عبر رفع ملفات غير مفحوص. تم التنظيف وسدّ الثغرات.' } },
          { t: 'q', q: 'لماذا نوقّع التقرير رقمياً؟', o: ['ليثبت أنه منّا ولم يغيّره أحد', 'ليصبح أجمل', 'ليصبح أقصر'], a: 0, tag: 'المشروع ②' },
          { t: 'say', mood: 'wow', m: '🏆🦅 **عملية الصقر نجحت!** استخدمت في مشروع واحد: صلاحيات لينكس، و SQL وحقنها، و Python والقواميس، والسجلات، والعمليات، والشبكات، والتوقيع الرقمي.\n\n🎓 **أنت الآن خرّيج المرحلة الأولى من عُقاب!** شهادتك تنتظرك، وعالم الأعلام 🚩 مفتوح أمامك.' }
        ]
      }
    ]
  });
})();
