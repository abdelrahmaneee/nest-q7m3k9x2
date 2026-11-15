C.units.push({
  id: 'u5', title: 'البرمجة ②: التكرار والآلات', icon: '🔁', blurb: 'القوائم، والحلقات التي تكرّر، والدوال التي تصنع أدوات. ثم تبني فاحص كلمات المرور.',
  lessons: [
    {
      id: 'l1', title: 'القوائم: صندوق فيه صناديق', mins: 10, steps: [
        { t: 'say', m: '[[list]] تحفظ عدة أشياء في صندوق واحد، بين قوسين مربعين `[ ]` ومفصولة بفواصل:\n`friends = ["علي", "سارة", "يوسف"]`' },
        { t: 'say', mood: 'wow', m: 'سرّ مهم: في البرمجة **العدّ يبدأ من 0!** أول عنصر رقمه 0، والثاني 1...\n`friends[0]` هو «علي»، و`friends[2]` هو «يوسف».', s: 'تخيّل طابوراً، والمبرمجون يسمّون أول شخص «رقم صفر». غريب قليلاً، لكنك ستعتاد عليه!', w: { type: 'card', html: '<div class="hexv" style="text-align:center">[ "علي" , "سارة" , "يوسف" ]\n    0        1        2</div>' } },
        { t: 'q', q: 'ماذا يطبع هذا؟', code: 'colors = ["أحمر", "أخضر", "أزرق"]\nprint(colors[1])', o: ['أخضر', 'أحمر', 'أزرق'], a: 0, why: 'العدّ من 0: أحمر=0، أخضر=1.', tag: 'القوائم' },
        { t: 'py', m: 'اصنع قائمة فيها 3 من أصدقائك، واطبع **أول** واحد، ثم اطبع عددهم بـ `len`:', code: 'friends = ["...", "...", "..."]\nprint(friends[0])\nprint(len(friends))', check: { outHas: '3', lines: 2 }, yes: 'ممتاز!' },
        { t: 'say', m: 'نضيف عنصراً لآخر القائمة بـ `append`:\n`friends.append("مريم")`' },
        { t: 'py', m: 'قائمة اللاعبين المحظورين في خادم اللعبة فيها لاعبان. أضف `"hacker99"` ثم اطبع القائمة:', code: 'banned = ["spam_bot", "cheater7"]\n# أضف hacker99 هنا\nprint(banned)', check: { outHas: 'hacker99' }, hint: 'banned.append("hacker99")', sol: 'banned = ["spam_bot", "cheater7"]\nbanned.append("hacker99")\nprint(banned)' }
      ]
    },
    {
      id: 'l2', title: 'حلقة for: كرّرها عني!', mins: 12, medal: 'loops', steps: [
        { t: 'say', m: 'لو أردت أن تطبع «أهلاً» 100 مرة، هل تكتب print مئة مرة؟ لا! نستخدم [[loop]]:\n`for i in range(5):`\n    `print("أهلاً")`', s: 'for تعني «كرّر لكل واحد». range(5) تعني: 5 مرات. والأسطر التي فيها 4 مسافات هي التي تتكرّر.' },
        { t: 'say', m: '`range(5)` تعطي الأرقام 0، 1، 2، 3، 4 (خمسة أرقام تبدأ من صفر). و`range(1, 6)` تعطي 1 إلى 5.' },
        { t: 'q', q: 'كم مرة يطبع هذا البرنامج «🦅»؟', code: 'for i in range(3):\n    print("🦅")', o: ['3 مرات', 'مرة واحدة', '4 مرات'], a: 0, tag: 'الحلقات' },
        { t: 'py', m: 'اكتب حلقة تطبع الأرقام من **1 إلى 10**، كل رقم في سطر:', code: 'for i in range( ):\n    print(i)', check: { out: '1\n2\n3\n4\n5\n6\n7\n8\n9\n10' }, hint: 'range(1, 11) تعطي من 1 إلى 10 (الرقم الأخير لا يدخل).', sol: 'for i in range(1, 11):\n    print(i)', medal: 'loops', yes: 'صنعت أول حلقة! 🔁' },
        { t: 'say', m: 'والحلقة تمرّ أيضاً على عناصر القائمة واحداً واحداً:\n`for name in friends:`\n    `print("أهلاً", name)`' },
        { t: 'py', m: 'اطبع جدول الضرب للرقم 7 (من 7×1 إلى 7×10):', code: 'for i in range(1, 11):\n    print(7, "×", i, "=", 7 * i)', check: { outHas: '70', lines: 10 }, yes: 'برنامج من سطرين كتب 10 أسطر! هذه قوة الحلقات.' },
        { t: 'py', m: '🔐 **أداة أمنية:** المهاجم يجرّب كلمات المرور بحلقة! اجعل الحلقة تمرّ على القائمة وتطبع `"وُجدت!"` عندما تصل لكلمة السر الصحيحة `"dragon"`:', code: 'secret = "dragon"\nguesses = ["123456", "password", "qwerty", "dragon", "monkey"]\nfor g in guesses:\n    print("أجرّب:", g)\n    # إذا كانت g تساوي secret اطبع وُجدت!\n', check: { outHas: 'وُجدت!' }, hint: 'داخل الحلقة (8 مسافات): if g == secret:\n        print("وُجدت!")', sol: 'secret = "dragon"\nguesses = ["123456", "password", "qwerty", "dragon", "monkey"]\nfor g in guesses:\n    print("أجرّب:", g)\n    if g == secret:\n        print("وُجدت!")', yes: 'هكذا يعمل «التخمين بالقوة». لهذا السبب كلمة dragon سيئة: إنها في كل قوائم المهاجمين!' }
      ]
    },
    {
      id: 'l3', title: 'حلقة while: حتى يتحقق الشرط', mins: 12, steps: [
        { t: 'say', m: 'حلقة `while` تكرّر **طالما** الشرط صحيح:\n`count = 3`\n`while count > 0:`\n    `print(count)`\n    `count = count - 1`', s: 'while تعني «طالما». طالما العدد أكبر من صفر، اطبعه وأنقصه واحداً. عندما يصل للصفر يتوقّف.' },
        { t: 'say', mood: 'think', m: '⚠️ **احذر:** إذا لم يتغيّر الشرط أبداً، تدور الحلقة للأبد! اسمها «حلقة لا نهائية». لا تقلق، عُقاب يوقفها بعد 6 ثوانٍ.' },
        { t: 'py', m: 'العدّ التنازلي للصاروخ 🚀: اطبع من 5 إلى 1، ثم «انطلق!»:', code: 'n = 5\nwhile n > 0:\n    print(n)\n    # أنقص n واحداً\nprint("انطلق!")', check: { out: '5\n4\n3\n2\n1\nانطلق!' }, hint: 'أضف السطر: n = n - 1 (بأربع مسافات)', sol: 'n = 5\nwhile n > 0:\n    print(n)\n    n = n - 1\nprint("انطلق!")' },
        { t: 'say', m: '🔐 **ربط أمني مهم:** كيف يوقف الموقع هجوم التخمين؟ يسمح بـ **3 محاولات فقط** ثم يقفل الحساب! هذه الحماية مكتوبة بحلقة while.' },
        { t: 'py', m: 'قفل الحساب! عُقاب سيكتب 3 كلمات خاطئة. أكمل البرنامج ليطبع «🔒 تم قفل الحساب» بعد المحاولة الثالثة:', code: 'tries = 0\nwhile tries < 3:\n    pw = input("كلمة المرور: ")\n    if pw == "Moon-River-55":\n        print("أهلاً!")\n        break\n    tries = tries + 1\n    print("خطأ. المحاولات:", tries)\n# اطبع رسالة القفل هنا\n', inputs: ['1234', 'admin', 'password'], check: { outHas: 'تم قفل الحساب' }, hint: 'اكتب في آخر سطر (بلا مسافات): if tries == 3: ثم تحته print("🔒 تم قفل الحساب")', sol: 'tries = 0\nwhile tries < 3:\n    pw = input("كلمة المرور: ")\n    if pw == "Moon-River-55":\n        print("أهلاً!")\n        break\n    tries = tries + 1\n    print("خطأ. المحاولات:", tries)\nif tries == 3:\n    print("🔒 تم قفل الحساب")', yes: 'برمجت حماية حقيقية ضد التخمين! 🛡️ لاحظ: break تخرج من الحلقة فوراً.' },
        { t: 'q', q: 'ماذا يحدث في هذا البرنامج؟', code: 'x = 1\nwhile x > 0:\n    print(x)', o: ['حلقة لا نهائية، لأن x لا يتغيّر', 'يطبع 1 مرة واحدة', 'خطأ في الكتابة'], a: 0, tag: 'الحلقات' }
      ]
    },
    {
      id: 'l4', title: 'الدوال: اصنع آلتك', mins: 12, medal: 'funcs', steps: [
        { t: 'say', m: '[[function]] آلة لها اسم: تعطيها شيئاً، فتعمل عليه وتعيد لك النتيجة. نصنعها بـ `def`:\n`def double(n):`\n    `return n * 2`', s: 'مثل آلة العصير: تعطيها برتقالة (n) وتعيد لك عصيراً (return). def تعني «عرّف آلة جديدة».', w: { type: 'card', big: '5 ➜ ⚙️ double ➜ 10' } },
        { t: 'say', m: 'بعد أن نصنع الآلة، نستخدمها بكتابة اسمها وما نعطيه بين قوسين:\n`print(double(5))` ← يطبع 10\nلقد استخدمت دوالاً من قبل دون أن تعرف: `print` و `len` و `input` كلها دوال!' },
        { t: 'q', q: 'ماذا يطبع هذا؟', code: 'def add(a, b):\n    return a + b\n\nprint(add(3, 4))', o: ['7', '34', 'add(3, 4)'], a: 0, tag: 'الدوال' },
        { t: 'py', m: 'اصنع دالة `triple` تعيد الرقم مضروباً في 3. عُقاب سيجرّبها بأرقام مختلفة:', code: 'def triple(n):\n    return \n\nprint(triple(5))', check: { outHas: '15', after: 'assert triple(2) == 6\nassert triple(10) == 30\nassert triple(0) == 0' }, hint: 'return n * 3', sol: 'def triple(n):\n    return n * 3\n\nprint(triple(5))', medal: 'funcs', yes: 'صنعت آلة تعمل مع أي رقم! ⚙️' },
        { t: 'py', m: 'دالة ترحيب: `greet(name)` تعيد النص «أهلاً يا » ثم الاسم. (يمكن جمع النصوص بـ `+`):', code: 'def greet(name):\n    return "أهلاً يا " + \n\nprint(greet("بطل"))', check: { out: 'أهلاً يا بطل', after: 'assert greet("سارة") == "أهلاً يا سارة"' }, hint: 'return "أهلاً يا " + name', sol: 'def greet(name):\n    return "أهلاً يا " + name\n\nprint(greet("بطل"))' },
        { t: 'say', mood: 'happy', m: 'لماذا الدوال مهمة؟ لأنك تكتب الأداة **مرة واحدة** وتستخدمها ألف مرة. خبراء الأمن يصنعون مكتبات كاملة من الدوال: دالة تفحص، ودالة تفك تشفير، ودالة تبحث في السجلات...' }
      ]
    },
    {
      id: 'l5', title: 'مشروع: فاحص كلمات المرور', mins: 15, steps: [
        { t: 'say', m: 'حان وقت مشروع حقيقي! سنصنع دالة `is_strong(pw)` تعيد `True` إذا كانت كلمة المرور قوية، و`False` إذا كانت ضعيفة. وسنستخدم كل ما تعلّمته: الدوال، والشروط، والقوائم، والحلقات.' },
        { t: 'say', m: 'قواعدنا لكلمة المرور القوية:\n1️⃣ طولها **12 حرفاً أو أكثر**.\n2️⃣ **ليست** في قائمة الكلمات المشهورة.\nونستخدم `in` لنسأل: هل الشيء موجود في القائمة؟ مثلاً `"dragon" in common` تعطي True.' },
        { t: 'py', m: 'أكمل الدالة:', code: 'common = ["password123456", "qwertyuiop12", "123456789012"]\n\ndef is_strong(pw):\n    if len(pw) < 12:\n        return False\n    if pw in common:\n        return \n    return True\n\nprint(is_strong("abc"))\nprint(is_strong("Blue-Tiger-Eats-42"))', check: { out: 'False\nTrue', after: 'assert is_strong("password123456") == False\nassert is_strong("short") == False\nassert is_strong("Green-Camel-Sings-9") == True' }, hint: 'الكلمة المشهورة ضعيفة، إذن: return False', sol: 'common = ["password123456", "qwertyuiop12", "123456789012"]\n\ndef is_strong(pw):\n    if len(pw) < 12:\n        return False\n    if pw in common:\n        return False\n    return True\n\nprint(is_strong("abc"))\nprint(is_strong("Blue-Tiger-Eats-42"))' },
        { t: 'py', m: 'الآن استخدم الدالة في حلقة تفحص كل كلمات المرور في القائمة، وتطبع لكل واحدة «قوية ✅» أو «ضعيفة ❌»:', code: 'common = ["password123456", "qwertyuiop12", "123456789012"]\n\ndef is_strong(pw):\n    if len(pw) < 12:\n        return False\n    if pw in common:\n        return False\n    return True\n\npasswords = ["ali2012", "Moon-Lamp-Turtle-19", "qwertyuiop12", "Rocket-Pizza-77!"]\nfor p in passwords:\n    # اطبع p ثم النتيجة\n', check: { outHas: ['ali2012', 'Rocket-Pizza-77!'], lines: 4 }, hint: 'داخل الحلقة:\n    if is_strong(p):\n        print(p, "قوية ✅")\n    else:\n        print(p, "ضعيفة ❌")', sol: 'common = ["password123456", "qwertyuiop12", "123456789012"]\n\ndef is_strong(pw):\n    if len(pw) < 12:\n        return False\n    if pw in common:\n        return False\n    return True\n\npasswords = ["ali2012", "Moon-Lamp-Turtle-19", "qwertyuiop12", "Rocket-Pizza-77!"]\nfor p in passwords:\n    if is_strong(p):\n        print(p, "قوية ✅")\n    else:\n        print(p, "ضعيفة ❌")', yes: 'صنعت أداة أمنية كاملة! هذه بالضبط فكرة الأدوات التي تفحص كلمات المرور في المواقع الحقيقية. 🏆' },
        { t: 'q', q: 'ماذا تعطي `"cat" in ["dog", "cat"]`؟', o: ['True', 'False', '1'], a: 0, tag: 'القوائم' },
        { t: 'say', mood: 'happy', m: 'تعلّمت الآن أهم أفكار البرمجة: الأوامر بالترتيب، والمتغيرات، والشروط، والقوائم، والحلقات، والدوال. **بهذه الأفكار الست تُبنى كل البرامج في العالم!** 🌍' }
      ]
    }
  ],
  test: [
    { t: 'q', q: 'ماذا يطبع هذا؟', code: 'a = ["س", "ص", "ع"]\nprint(a[0])', o: ['س', 'ص', 'ع'], a: 0, tag: 'القوائم' },
    { t: 'q', q: 'ماذا يطبع `print(len([4, 8, 15, 16]))`؟', o: ['4', '16', '43'], a: 0, tag: 'القوائم' },
    { t: 'q', q: 'كيف تضيف عنصراً لآخر القائمة `x`؟', o: ['`x.append(5)`', '`x.add = 5`', '`append x 5`'], a: 0, tag: 'القوائم' },
    { t: 'q', q: 'ما الأرقام التي تعطيها `range(3)`؟', o: ['0، 1، 2', '1، 2، 3', '0، 1، 2، 3'], a: 0, tag: 'الحلقات' },
    { t: 'q', q: 'كم مرة يطبع هذا؟', code: 'for i in range(1, 5):\n    print(i)', o: ['4 مرات', '5 مرات', '1 مرة'], a: 0, tag: 'الحلقات' },
    { t: 'q', q: 'متى تتوقّف حلقة while؟', o: ['عندما يصبح الشرط خطأ', 'بعد 10 مرات دائماً', 'لا تتوقّف أبداً'], a: 0, tag: 'الحلقات' },
    { t: 'q', q: 'ماذا تفعل `break`؟', o: ['تخرج من الحلقة فوراً', 'تكسر البرنامج', 'تعيد الحلقة من البداية'], a: 0, tag: 'الحلقات' },
    { t: 'q', q: 'ماذا يطبع هذا؟', code: 'def half(n):\n    return n / 2\n\nprint(half(10))', o: ['5.0', '10', '20'], a: 0, tag: 'الدوال' },
    { t: 'q', q: 'أيّ كلمة نصنع بها دالة؟', o: ['`def`', '`for`', '`if`'], a: 0, tag: 'الدوال' },
    { t: 'q', q: 'ماذا تفعل `return`؟', o: ['تعيد النتيجة من الدالة', 'تطبع على الشاشة', 'تعيد تشغيل البرنامج'], a: 0, tag: 'الدوال' },
    { t: 'q', q: 'لماذا تقفل المواقع الحساب بعد 3 محاولات خاطئة؟', o: ['لإيقاف هجوم التخمين بالقوة', 'لتوفير الكهرباء', 'لأن المستخدم ملّ'], a: 0, tag: 'الحلقات' },
    { t: 'in', q: 'ماذا يطبع `print("a" in ["a", "b"])`؟', a: ['True'], ltr: 1, tag: 'القوائم' }
  ]
});
