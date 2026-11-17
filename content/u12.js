C.units.push({
  id: 'u12', part: 2, title: 'البرمجة ③: النصوص والقواميس والملفات', icon: '📚', blurb: 'أدوات المحلّل الأمني: تقطيع النصوص، وقواميس العدّ، وقراءة ملفات السجلات بالكود.',
  lessons: [
    {
      id: 'l1', title: 'النص سلسلة حروف', mins: 10, steps: [
        { t: 'say', m: 'النص في Python مثل **قطار من الحروف** 🚃🚃🚃، وكل عربة لها رقم يبدأ من **0**:\n`word = "OQAB"`\n`word[0]` ← O\n`word[1]` ← Q\n`word[-1]` ← B (الأخير!)', s: 'الرقم السالب يعدّ من النهاية: -1 آخر حرف، و -2 الذي قبله.' },
        { t: 'q', q: 'إذا كان `name = "SARA"` فما هو `name[2]`؟', o: ['R', 'A', 'S'], a: 0, why: 'S=0، A=1، R=2.', tag: 'النصوص' },
        { t: 'say', m: 'أدوات النصوص:\n🔠 `.upper()` كل الحروف كبيرة، و 🔡 `.lower()` كلها صغيرة.\n📏 `len(word)` طول النص.\n✂️ `word[0:2]` قطعة من الخانة 0 حتى قبل 2.\n🔎 `"QA" in word` هل القطعة موجودة؟\n🔁 `.replace("a", "b")` استبدل.' },
        { t: 'py', m: 'جرّب الأدوات:', code: 'word = "oqab"\nprint(word.upper())\nprint(len(word))\nprint(word[0:2])', check: { out: 'OQAB\n4\noq' }, sol: 'word = "oqab"\nprint(word.upper())\nprint(len(word))\nprint(word[0:2])', yes: 'أنت تقطّع النصوص كالجرّاح! ✂️' },
        { t: 'say', m: '🔐 **لماذا يهمّ هذا في الأمن؟** المستخدم قد يكتب `ADMIN` أو `Admin` أو `admin`. إذا كان برنامجك يمنع `admin` فقط، يدخل المخترق بـ `Admin`! الحل: حوّل كل شيء لحروف صغيرة **قبل** المقارنة.' },
        { t: 'py', m: 'أصلح الحارس: يجب أن يمنع اسم «admin» مهما كُتب. أضف `.lower()`:', code: 'name = "AdMiN"\nif name == "admin":\n    print("ممنوع")\nelse:\n    print("أهلاً")', check: { out: 'ممنوع', has: ['lower'] }, hint: 'غيّر الشرط إلى: if name.lower() == "admin":', sol: 'name = "AdMiN"\nif name.lower() == "admin":\n    print("ممنوع")\nelse:\n    print("أهلاً")', yes: 'سددت ثغرة حقيقية! كثير من البرامج وقعت في هذا الخطأ.' },
        { t: 'q', q: 'ماذا يطبع `print("Oqab"[-1])`؟', o: ['b', 'O', 'خطأ'], a: 0, tag: 'النصوص' }
      ]
    },
    {
      id: 'l2', title: 'القواميس: خزانة لها أسماء', mins: 11, steps: [
        { t: 'say', m: 'القائمة ترقّم الأشياء: 0، 1، 2... لكن أحياناً نريد أن نسمّيها! مثل دفتر الهاتف: الاسم ← الرقم. هذا هو [[dict]] في Python.', w: { type: 'card', big: '📖', html: '<span class="mono" dir="ltr">ages = {"سارة": 12, "علي": 14}</span>' } },
        { t: 'say', m: 'القاموس يتكوّن من أزواج: **مفتاح : قيمة**.\n`ages["سارة"]` ← 12\nلإضافة شخص: `ages["مريم"] = 11`\nلتغيير قيمة: `ages["علي"] = 15`', s: 'القاموس مثل خزانة لها أدراج، وعلى كل درج اسم بدل الرقم.' },
        { t: 'py', m: 'اطبع عمر علي، ثم أضف «مريم» وعمرها 11، ثم اطبع القاموس كله:', code: 'ages = {"سارة": 12, "علي": 14}\nprint(ages["علي"])\nages[...] = 11\nprint(ages)', check: { outHas: ['14', 'مريم'] }, hint: 'ages["مريم"] = 11', sol: 'ages = {"سارة": 12, "علي": 14}\nprint(ages["علي"])\nages["مريم"] = 11\nprint(ages)', medal: 'dicts', yes: 'قاموسك الأول! 📖' },
        { t: 'match', q: 'وصّل:', pairs: [['ages["علي"]', 'اقرأ قيمة علي'], ['ages["علي"] = 15', 'غيّر قيمة علي'], ['"علي" in ages', 'هل علي موجود؟'], ['len(ages)', 'كم شخصاً في القاموس؟']], yes: 'ممتاز!' },
        { t: 'say', m: 'نمرّ على القاموس بحلقة هكذا:\n`for name in ages:`\n`    print(name, ages[name])`\n\nأو بطريقة أجمل: `for name, age in ages.items():`' },
        { t: 'py', m: 'هذا قاموس المستخدمين وأدوارهم. اطبع **فقط** أسماء المدراء (admin):', code: 'roles = {"oqab": "admin", "sara": "user", "ali": "user", "root": "admin"}\nfor name, role in roles.items():\n    if role == ...:\n        print(name)', check: { out: 'oqab\nroot' }, hint: 'قارن role مع "admin"', sol: 'roles = {"oqab": "admin", "sara": "user", "ali": "user", "root": "admin"}\nfor name, role in roles.items():\n    if role == "admin":\n        print(name)', yes: 'هكذا يراجع الخبراء من يملك صلاحيات خطيرة في النظام. 🔎' },
        { t: 'q', q: 'ماذا يحدث إذا كتبت `ages["خالد"]` وخالد غير موجود؟', o: ['خطأ KeyError', 'يطبع 0', 'يضيفه تلقائياً'], a: 0, why: 'لذلك نسأل أولاً: if "خالد" in ages', tag: 'القواميس' }
      ]
    },
    {
      id: 'l3', title: 'قاموس العدّ: من هاجمنا أكثر؟', mins: 11, steps: [
        { t: 'say', m: 'في الجزء الأول عددنا محاولات عنوان **واحد**. لكن ماذا لو أردنا أن نعدّ **كل** العناوين معاً؟ القاموس هو الحل: المفتاح = العنوان، والقيمة = عدد مرات ظهوره.' },
        { t: 'say', m: 'الخوارزمية:\n1️⃣ ابدأ بقاموس فارغ `{}`.\n2️⃣ لكل عنوان: إذا لم يكن في القاموس، ضعه بقيمة 0.\n3️⃣ زد قيمته 1.\n\nأو باختصار: `count[ip] = count.get(ip, 0) + 1`\n`get(ip, 0)` تعني: أعطني قيمته، أو 0 إذا لم يوجد.' },
        { t: 'py', m: 'شغّل عدّاد الهجمات:', code: 'tries = ["1.1.1.1", "6.6.6.6", "6.6.6.6", "2.2.2.2", "6.6.6.6", "1.1.1.1"]\ncount = {}\nfor ip in tries:\n    count[ip] = count.get(ip, 0) + 1\nprint(count)', check: { outHas: "'6.6.6.6': 3" }, sol: 'tries = ["1.1.1.1", "6.6.6.6", "6.6.6.6", "2.2.2.2", "6.6.6.6", "1.1.1.1"]\ncount = {}\nfor ip in tries:\n    count[ip] = count.get(ip, 0) + 1\nprint(count)', yes: 'عددت كل العناوين في مرور واحد! ⚡' },
        { t: 'py', m: 'الآن اطبع فقط العناوين التي حاولت **3 مرات أو أكثر** (المشبوهة):', code: 'count = {"1.1.1.1": 2, "6.6.6.6": 3, "2.2.2.2": 1, "9.9.9.9": 5}\nfor ip, n in count.items():\n    if ...:\n        print("مشبوه:", ip)', check: { outHas: ['6.6.6.6', '9.9.9.9'] }, hint: 'n >= 3', sol: 'count = {"1.1.1.1": 2, "6.6.6.6": 3, "2.2.2.2": 1, "9.9.9.9": 5}\nfor ip, n in count.items():\n    if n >= 3:\n        print("مشبوه:", ip)', yes: 'كشفت مهاجمَين! 🚨' },
        { t: 'q', q: 'ماذا تعطي `count.get("x", 0)` إذا لم يكن "x" في القاموس؟', o: ['0', 'خطأ', 'x'], a: 0, tag: 'قاموس العدّ' },
        { t: 'say', mood: 'wow', m: 'هل تذكر أمر الطرفية `sort | uniq -c`؟ إنه يفعل نفس الشيء! الآن تعرف كيف يعمل من الداخل. والمحلّلون الأمنيون يكتبون برامج مثل هذه لملفات فيها **ملايين** الأسطر.' }
      ]
    },
    {
      id: 'l4', title: 'الملفات: اكتب واقرأ بالكود', mins: 11, steps: [
        { t: 'say', m: 'حتى الآن، كل ما يصنعه برنامجك يختفي عندما ينتهي. لنحفظه في **ملف**! الأمر `open` يفتح ملفاً، ومعه حرف:\n✏️ `"w"` للكتابة (يمسح القديم!)\n📖 `"r"` للقراءة\n➕ `"a"` للإضافة في الآخر' },
        { t: 'say', m: 'الطريقة الآمنة تستخدم `with`، فهي تغلق الملف تلقائياً:\n`with open("notes.txt", "w") as f:`\n`    f.write("سطر أول\\n")`\n\n`\\n` تعني: سطر جديد.' },
        { t: 'py', m: 'اكتب ملفاً ثم اقرأه:', code: 'with open("diary.txt", "w") as f:\n    f.write("اليوم تعلّمت الملفات\\n")\n    f.write("غداً القواميس\\n")\n\nwith open("diary.txt", "r") as f:\n    print(f.read())', check: { outHas: 'تعلّمت' }, sol: 'with open("diary.txt", "w") as f:\n    f.write("اليوم تعلّمت الملفات\\n")\n    f.write("غداً القواميس\\n")\n\nwith open("diary.txt", "r") as f:\n    print(f.read())', medal: 'filer', yes: 'كتبت وقرأت ملفاً بالكود! 🗃️' },
        { t: 'say', m: 'نقرأ الملف **سطراً سطراً** بحلقة:\n`for line in f:`\n`    print(line.strip())`\n\n`strip()` تزيل المسافات والسطر الجديد من الطرفين.' },
        { t: 'py', m: 'اكتب ملف سجل صغير، ثم اقرأه سطراً سطراً واطبع فقط الأسطر التي فيها `FAILED`:', code: 'with open("auth.log", "w") as f:\n    f.write("LOGIN sara OK\\nLOGIN admin FAILED\\nLOGIN ali OK\\nLOGIN admin FAILED\\n")\n\nwith open("auth.log") as f:\n    for line in f:\n        if ... in line:\n            print(line.strip())', check: { out: 'LOGIN admin FAILED\nLOGIN admin FAILED' }, hint: 'ضع "FAILED" مكان النقاط', sol: 'with open("auth.log", "w") as f:\n    f.write("LOGIN sara OK\\nLOGIN admin FAILED\\nLOGIN ali OK\\nLOGIN admin FAILED\\n")\n\nwith open("auth.log") as f:\n    for line in f:\n        if "FAILED" in line:\n            print(line.strip())', yes: 'صنعت `grep` خاصاً بك في Python! 😎' },
        { t: 'q', q: 'فتحت ملفاً فيه كلام مهم بـ `"w"`. ماذا يحدث للكلام القديم؟', o: ['يُمسح!', 'يبقى ويُضاف الجديد بعده', 'لا شيء'], a: 0, why: 'w يبدأ الملف من جديد. للإضافة استخدم "a".', tag: 'الملفات' }
      ]
    },
    {
      id: 'l5', title: 'مشروع: محلّل السجلات', mins: 14, steps: [
        { t: 'say', mood: 'wow', m: '🚨 **مهمة حقيقية:** خادم «عُش عُقاب» سجّل محاولات الدخول طوال الليل. كل سطر يشبه هذا:\n`03:12 FAILED admin 45.13.7.99`\n(الوقت، النتيجة، اسم المستخدم، العنوان)\n\nستكتب برنامجاً يقرأ السجل ويكتب **تقريراً** بالمهاجمين.' },
        { t: 'say', m: 'أداة جديدة: `split()` تقطّع السطر عند المسافات وتعطيك قائمة:\n`"03:12 FAILED admin 45.13.7.99".split()`\n← `["03:12", "FAILED", "admin", "45.13.7.99"]`\nإذن العنوان هو `parts[3]` أو `parts[-1]`.' },
        { t: 'py', m: 'الخطوة 1: قطّع سطراً واطبع العنوان واسم المستخدم:', code: 'line = "03:12 FAILED admin 45.13.7.99"\nparts = line.split()\nprint(parts[...])\nprint(parts[2])', check: { out: '45.13.7.99\nadmin' }, hint: 'العنوان في الخانة 3', sol: 'line = "03:12 FAILED admin 45.13.7.99"\nparts = line.split()\nprint(parts[3])\nprint(parts[2])', yes: 'قطّعته بنجاح ✂️' },
        { t: 'py', m: 'الخطوة 2 (المشروع كاملاً): البرنامج يكتب السجل، ثم يقرؤه، ويعدّ الفاشلة لكل عنوان بقاموس، ثم يكتب **report.txt** بالعناوين التي فشلت 3 مرات أو أكثر. أكمل الفراغين:', code: 'log = """01:00 OK sara 10.0.0.5\n03:12 FAILED admin 45.13.7.99\n03:13 FAILED admin 45.13.7.99\n03:13 FAILED root 45.13.7.99\n03:20 FAILED ali 10.0.0.8\n03:30 FAILED admin 77.7.7.7\n03:31 FAILED admin 77.7.7.7\n03:32 FAILED admin 77.7.7.7\n03:33 FAILED admin 77.7.7.7\n08:00 OK ali 10.0.0.8"""\nwith open("server.log", "w") as f:\n    f.write(log)\n\ncount = {}\nwith open("server.log") as f:\n    for line in f:\n        parts = line.split()\n        if parts[1] == "FAILED":\n            ip = parts[3]\n            count[ip] = count.get(ip, 0) + ...\n\nwith open("report.txt", "w") as r:\n    for ip, n in count.items():\n        if n >= ...:\n            r.write("احظر " + ip + " (" + str(n) + " محاولات)\\n")\n\nprint(open("report.txt").read())', check: { outHas: ['45.13.7.99', '77.7.7.7'] }, hint: 'الأول 1، والثاني 3', sol: 'log = """01:00 OK sara 10.0.0.5\n03:12 FAILED admin 45.13.7.99\n03:13 FAILED admin 45.13.7.99\n03:13 FAILED root 45.13.7.99\n03:20 FAILED ali 10.0.0.8\n03:30 FAILED admin 77.7.7.7\n03:31 FAILED admin 77.7.7.7\n03:32 FAILED admin 77.7.7.7\n03:33 FAILED admin 77.7.7.7\n08:00 OK ali 10.0.0.8"""\nwith open("server.log", "w") as f:\n    f.write(log)\n\ncount = {}\nwith open("server.log") as f:\n    for line in f:\n        parts = line.split()\n        if parts[1] == "FAILED":\n            ip = parts[3]\n            count[ip] = count.get(ip, 0) + 1\n\nwith open("report.txt", "w") as r:\n    for ip, n in count.items():\n        if n >= 3:\n            r.write("احظر " + ip + " (" + str(n) + " محاولات)\\n")\n\nprint(open("report.txt").read())', yes: '🏆 صنعت محلّل سجلات حقيقياً! هذا ما يفعله محلّلو مراكز الأمن (SOC) كل يوم.' },
        { t: 'q', q: 'لماذا لم يظهر العنوان 10.0.0.8 في التقرير؟', o: ['لأنه فشل مرة واحدة فقط، أقل من 3', 'لأنه عنوان داخلي', 'خطأ في البرنامج'], a: 0, tag: 'محلّل السجلات' },
        { t: 'say', mood: 'happy', m: 'جمعت في برنامج واحد: الملفات، والحلقات، والشروط، والتقطيع، والقواميس. أنت الآن تبرمج كمحلّل أمني! 🛡️' }
      ]
    }
  ],
  test: [
    { t: 'q', q: 'ما هو `"ABC"[0]`؟', o: ['A', 'B', 'C'], a: 0, tag: 'النصوص' },
    { t: 'q', q: 'ماذا يطبع `print("hi".upper())`؟', o: ['HI', 'hi', 'Hi'], a: 0, tag: 'النصوص' },
    { t: 'q', q: 'لماذا نحوّل الاسم بـ `.lower()` قبل مقارنته بـ "admin"؟', o: ['لكي لا يتسلّل أحد بكتابة Admin أو ADMIN', 'لتجميل الاسم', 'لا سبب'], a: 0, tag: 'النصوص' },
    { t: 'q', q: 'القاموس يتكوّن من أزواج...', o: ['مفتاح : قيمة', 'رقم : رقم فقط', 'سطر : سطر'], a: 0, tag: 'القواميس' },
    { t: 'in', q: 'إذا كان `d = {"a": 5}` فماذا يطبع `print(d["a"])`؟', a: ['5'], tag: 'القواميس' },
    { t: 'q', q: 'كيف نضيف "x" بقيمة 1 إلى القاموس d؟', o: ['d["x"] = 1', 'd.add("x")', 'd + "x"'], a: 0, tag: 'القواميس' },
    { t: 'q', q: 'ماذا تعطي `{"a": 2}.get("b", 0)`؟', o: ['0', '2', 'خطأ'], a: 0, tag: 'قاموس العدّ' },
    { t: 'q', q: 'أيّ حرف نستخدمه في open لنضيف لآخر الملف دون مسح القديم؟', o: ['"a"', '"w"', '"r"'], a: 0, tag: 'الملفات' },
    { t: 'q', q: 'ما فائدة `with open(...)`؟', o: ['تغلق الملف تلقائياً', 'تحذف الملف', 'تشفّر الملف'], a: 0, tag: 'الملفات' },
    { t: 'q', q: 'ماذا يعطي `"a b c".split()`؟', o: ['["a", "b", "c"]', '"abc"', '3'], a: 0, tag: 'محلّل السجلات' },
    { t: 'q', q: 'ماذا تفعل `strip()`؟', o: ['تزيل المسافات والسطر الجديد من الطرفين', 'تحذف السطر كله', 'تقطّع النص'], a: 0, tag: 'الملفات' },
    { t: 'q', q: 'برنامج يعدّ محاولات كل عنوان. أفضل أداة لحفظ العدّ:', o: ['قاموس', 'نص واحد', 'رقم واحد'], a: 0, tag: 'قاموس العدّ' }
  ]
});
