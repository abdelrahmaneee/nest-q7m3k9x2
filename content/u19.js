(function () {
  const Q = s => 'document.querySelector("' + s + '")';
  const CS = (s, p) => 'getComputedStyle(' + Q(s) + ').' + p;
  const N = s => 'document.querySelectorAll("' + s + '").length';
  C.units.push({
    id: 'u19', part: 3, title: 'HTML و CSS: صمّم صفحتك', icon: '🎨', blurb: 'من صفحة بيضاء إلى صفحة شخصية ملوّنة: الوسوم، والألوان، والصناديق، والترتيب.',
    lessons: [
      {
        id: 'l1', title: 'هيكل الصفحة: وسوم جديدة', mins: 11, steps: [
          { t: 'say', mood: 'happy', m: 'أهلاً بك في الجزء الثالث: **ستبني موقعك بنفسك!** 🏗️ تذكّر من وحدة الويب: الصفحة تُكتب بـ [[html]]، والكلام يوضع داخل وسوم مثل `<h1>` و `<p>`. اليوم نتعلّم وسوماً جديدة.' },
          { t: 'say', m: '📌 وسوم جديدة:\n`<h2>` عنوان أصغر من h1 (وهناك h3 و h4...)\n`<ul>` قائمة نقاط، وكل عنصر فيها داخل `<li>`\n`<a href="رابط">كلام</a>` رابط تضغط عليه\n\nمثال القائمة:\n`<ul>`\n`  <li>كرة القدم</li>`\n`  <li>الرسم</li>`\n`</ul>`', s: 'ul تعني «قائمة»، و li تعني «عنصر في القائمة». القائمة صندوق كبير، وكل li صندوق صغير داخله.' },
          { t: 'do', m: 'هذه صفحتك. اكتب في تبويب HTML ثم اضغط «شغّل الصفحة»:', w: { type: 'web', goal: 1, tabs: ['html'], html: '<h1>صفحة عُقاب</h1>\n<p>أهلاً بكم في صفحتي!</p>\n\n<!-- أضف عنواناً صغيراً h2 هنا -->\n\n<!-- أضف قائمة ul فيها 3 عناصر li -->\n', missions: [{ d: 'أضف عنواناً صغيراً `<h2>هواياتي</h2>`', dom: Q('h2') }, { d: 'أضف قائمة `<ul>` فيها **3** عناصر `<li>` على الأقل', dom: N('ul li') + ' >= 3' }], hint: 'اكتب: <h2>هواياتي</h2> ثم <ul> وبداخلها ثلاثة أسطر <li>شيء</li> ثم </ul>', sol: { html: '<h1>صفحة عُقاب</h1>\n<p>أهلاً بكم في صفحتي!</p>\n<h2>هواياتي</h2>\n<ul>\n  <li>البرمجة</li>\n  <li>الرسم</li>\n  <li>كرة القدم</li>\n</ul>\n' }, yes: 'صفحتك فيها عنوان وقائمة! 📋' } },
          { t: 'say', m: 'لاحظ في وسم الرابط: `<a href="https://oqab.com">موقع عُقاب</a>`\nالكلمة `href` اسمها **صفة** (Attribute): معلومة إضافية نضعها داخل الوسم الافتتاحي، بالشكل `اسم="قيمة"`. صفة href تقول للمتصفح: إلى أين يذهب الرابط.' },
          { t: 'do', m: 'أضف رابطاً لصفحتك يذهب إلى `https://oqab.com` واكتب عليه «موقع عُقاب»:', w: { type: 'web', goal: 1, tabs: ['html'], html: '<h1>صفحة عُقاب</h1>\n<p>مواقع أحبّها:</p>\n\n', missions: [{ d: 'أضف رابطاً `<a href="https://oqab.com">موقع عُقاب</a>`', dom: Q('a[href*=oqab]') }], hint: 'اكتب: <a href="https://oqab.com">موقع عُقاب</a>', sol: { html: '<h1>صفحة عُقاب</h1>\n<p>مواقع أحبّها:</p>\n<a href="https://oqab.com">موقع عُقاب</a>\n' }, yes: 'رابطك جاهز! 🔗' } },
          { t: 'match', q: 'وصّل كل وسم بعمله:', pairs: [['<h2>', 'عنوان أصغر'], ['<ul>', 'قائمة نقاط'], ['<li>', 'عنصر في القائمة'], ['<a href="...">', 'رابط']], yes: 'ممتاز!' },
          { t: 'q', q: 'في `<a href="https://oqab.com">عُقاب</a>` ما هي href؟', o: ['صفة تحدّد إلى أين يذهب الرابط', 'وسم عنوان', 'لون الرابط'], a: 0, tag: 'وسوم HTML' }
        ]
      },
      {
        id: 'l2', title: 'CSS: لوّن صفحتك', mins: 12, steps: [
          { t: 'say', m: 'HTML يبني **الهيكل**، لكن الصفحة بيضاء ومملّة! 😴 لتلوينها نستخدم [[css]]. قاعدة CSS تتكوّن من 3 أجزاء:\n\n`h1 { color: red; }`\n\n🎯 **المحدِّد** `h1`: على من نطبّق؟\n🏷️ **الخاصية** `color`: ماذا نغيّر؟\n🎨 **القيمة** `red`: إلى ماذا؟', s: 'مثل أن تقول: «كل العناوين (من)، لونها (ماذا)، أحمر (إلى ماذا)».' },
          { t: 'say', m: 'خصائص مهمة:\n`color` لون الكلام\n`background-color` لون الخلفية\n`font-size` حجم الخط، مثل `24px`\n`text-align` المحاذاة: `center` في الوسط\n\nوكل خاصية تنتهي بـ `;` والقاعدة كلها بين `{ }`.' },
          { t: 'say', m: '🎨 الألوان تُكتب بالاسم مثل `red` و `gold`، أو بالرمز السداسي مثل `#ff0000`. هل تتذكّر نظام **RGB** من الوحدة الأولى؟ هو نفسه! `#ff0000` = أحمر ff (أي 255) + أخضر 00 + أزرق 00.' },
          { t: 'do', m: 'افتح تبويب **CSS** ولوّن الصفحة. شغّل بعد كل تغيير لترى النتيجة:', w: { type: 'web', goal: 1, tabs: ['css', 'html'], html: '<h1>صفحة عُقاب</h1>\n<p>أهلاً بكم في صفحتي!</p>', css: 'h1 {\n  color: ...;\n}\n', missions: [{ d: 'غيّر لون العنوان `h1` (مثلاً `color: darkblue;`)', dom: CS('h1', 'color') + ' !== "rgb(0, 0, 0)"' }, { d: 'أضف قاعدة `body` بلون خلفية `background-color`', dom: CS('body', 'backgroundColor') + ' !== "rgba(0, 0, 0, 0)"' }, { d: 'اجعل حجم خط الفقرة `p` يساوي `22px`', dom: CS('p', 'fontSize') + ' === "22px"' }, { d: 'اجعل العنوان في الوسط `text-align: center;`', dom: CS('h1', 'textAlign') + ' === "center"' }], hint: 'مثال كامل:\nbody { background-color: lightyellow; }\nh1 { color: darkblue; text-align: center; }\np { font-size: 22px; }', sol: { css: 'body {\n  background-color: lightyellow;\n}\nh1 {\n  color: darkblue;\n  text-align: center;\n}\np {\n  font-size: 22px;\n}\n', html: '<h1>صفحة عُقاب</h1>\n<p>أهلاً بكم في صفحتي!</p>' }, yes: 'صفحتك صارت ملوّنة! 🌈' } },
          { t: 'q', q: 'في القاعدة `p { font-size: 20px; }`، ما هي الخاصية؟', o: ['font-size', 'p', '20px'], a: 0, tag: 'قواعد CSS' },
          { t: 'q', q: 'أيّ قاعدة تجعل خلفية الصفحة سوداء؟', o: ['body { background-color: black; }', 'body { color: black; }', 'black { body }'], a: 0, why: 'color للكلام، و background-color للخلفية.', tag: 'قواعد CSS' }
        ]
      },
      {
        id: 'l3', title: 'الصناديق: class والمسافات', mins: 12, steps: [
          { t: 'say', m: 'كل شيء في الصفحة **صندوق** 📦. ولنصنع صندوقاً خاصاً نستخدم الوسم `<div>` (معناه: قسم). وحتى نلوّن صناديق معيّنة فقط، نعطيها اسم مجموعة بالصفة `class`:\n\n`<div class="card">أنا بطاقة</div>`\n\nوفي CSS نختارها بنقطة قبل الاسم: `.card { ... }`', s: 'class مثل قميص الفريق: كل من يلبس قميص «card» يأخذ نفس الشكل.' },
          { t: 'say', m: 'خصائص الصندوق:\n`padding: 12px;` مسافة **داخل** الصندوق (بين الحدود والكلام)\n`margin: 12px;` مسافة **خارج** الصندوق (بينه وبين جيرانه)\n`border: 2px solid gold;` حدود: سُمك، ونوع، ولون\n`border-radius: 16px;` زوايا مستديرة' },
          { t: 'match', q: 'وصّل:', pairs: [['padding', 'مسافة داخل الصندوق'], ['margin', 'مسافة خارج الصندوق'], ['border', 'حدود الصندوق'], ['border-radius', 'استدارة الزوايا']], yes: 'ممتاز!' },
          { t: 'do', m: 'اصنع بطاقة جميلة:', w: { type: 'web', goal: 1, tabs: ['html', 'css'], html: '<h1>بطاقاتي</h1>\n<div class="card">\n  <h2>🎮 الألعاب</h2>\n  <p>أحب ألعاب الألغاز</p>\n</div>\n', css: '.card {\n  \n}\n', missions: [{ d: 'أعط البطاقة `.card` مسافة داخلية `padding: 16px;`', dom: 'parseInt(' + CS('.card', 'paddingTop') + ') >= 8' }, { d: 'أعطها حدوداً `border: 3px solid gold;`', dom: 'parseInt(' + CS('.card', 'borderTopWidth') + ') >= 1' }, { d: 'اجعل زواياها مستديرة `border-radius: 16px;`', dom: 'parseInt(' + CS('.card', 'borderTopLeftRadius') + ') >= 4' }, { d: 'أضف بطاقة **ثانية** بنفس الـ class فيها هواية أخرى', dom: N('.card') + ' >= 2' }], hint: 'في CSS:\n.card { padding: 16px; border: 3px solid gold; border-radius: 16px; }\nوفي HTML انسخ كل <div class="card">...</div> مرة ثانية وغيّر الكلام.', sol: { html: '<h1>بطاقاتي</h1>\n<div class="card">\n  <h2>🎮 الألعاب</h2>\n  <p>أحب ألعاب الألغاز</p>\n</div>\n<div class="card">\n  <h2>🎨 الرسم</h2>\n  <p>أرسم العُقاب</p>\n</div>\n', css: '.card {\n  padding: 16px;\n  border: 3px solid gold;\n  border-radius: 16px;\n  margin: 10px;\n}\n' }, yes: 'لاحظت؟ قاعدة CSS واحدة لوّنت البطاقتين معاً، لأنهما تلبسان نفس الـ class! 👕' } },
          { t: 'q', q: 'كيف نختار في CSS كل العناصر التي `class="star"`؟', o: ['.star', '#star', 'star'], a: 0, tag: 'الصناديق' },
          { t: 'q', q: 'أريد مسافة **بين الحدود والكلام** داخل الصندوق:', o: ['padding', 'margin', 'color'], a: 0, tag: 'الصناديق' }
        ]
      },
      {
        id: 'l4', title: 'جنباً إلى جنب: flex', mins: 11, steps: [
          { t: 'say', m: 'الصناديق تنزل عادةً **تحت** بعضها. لكن ماذا لو أردنا البطاقات **بجانب** بعضها كصفّ؟ نضعها داخل صندوق كبير، ونعطي الصندوق الكبير:\n\n`display: flex;`\n\nفتصطفّ كل الصناديق التي داخله في صفّ واحد! ✨' },
          { t: 'say', m: 'مع flex خصائص مفيدة:\n`gap: 12px;` مسافة بين الصناديق\n`justify-content: center;` ضعها في الوسط\n`flex-wrap: wrap;` إذا ضاق المكان (على الهاتف) تنزل لسطر جديد', s: 'flex مثل رفّ الكتب: تضع الكتب بجانب بعضها، وإذا امتلأ الرفّ تبدأ رفاً جديداً تحته (wrap).' },
          { t: 'do', m: 'اجعل البطاقات الثلاث في صفّ واحد:', w: { type: 'web', goal: 1, tabs: ['css', 'html'], html: '<h1>هواياتي</h1>\n<div class="row">\n  <div class="card">⚽ كرة</div>\n  <div class="card">🎨 رسم</div>\n  <div class="card">💻 برمجة</div>\n</div>\n', css: '.card {\n  padding: 16px;\n  border: 2px solid teal;\n  border-radius: 12px;\n}\n.row {\n  \n}\n', missions: [{ d: 'أعط الصندوق `.row` الخاصية `display: flex;`', dom: CS('.row', 'display') + ' === "flex"' }, { d: 'أضف مسافة بين البطاقات `gap: 12px;`', dom: 'parseInt(' + CS('.row', 'columnGap') + ') > 0' }, { d: 'ضعها في الوسط `justify-content: center;`', dom: CS('.row', 'justifyContent') + ' === "center"' }], hint: '.row { display: flex; gap: 12px; justify-content: center; }', sol: { css: '.card {\n  padding: 16px;\n  border: 2px solid teal;\n  border-radius: 12px;\n}\n.row {\n  display: flex;\n  gap: 12px;\n  justify-content: center;\n  flex-wrap: wrap;\n}\n', html: '<h1>هواياتي</h1>\n<div class="row">\n  <div class="card">⚽ كرة</div>\n  <div class="card">🎨 رسم</div>\n  <div class="card">💻 برمجة</div>\n</div>\n' }, yes: 'بطاقاتك صارت صفاً مرتّباً! 📐' } },
          { t: 'q', q: 'على أيّ صندوق نكتب `display: flex;`؟', o: ['الصندوق الكبير الذي يحتوي البطاقات', 'كل بطاقة وحدها', 'على h1'], a: 0, tag: 'flex' },
          { t: 'q', q: 'أيّ خاصية تضع مسافة بين الصناديق في flex؟', o: ['gap', 'color', 'href'], a: 0, tag: 'flex' }
        ]
      },
      {
        id: 'l5', title: 'مشروع: صفحتي الشخصية', mins: 15, medal: 'webdesigner', steps: [
          { t: 'say', mood: 'wow', m: '🏗️ حان وقت صفحتك الشخصية الكاملة! لكن قبل أن نبدأ، سؤال أمني مهم جداً: **ماذا تضع في صفحة يراها كل العالم؟**' },
          { t: 'sort', q: 'صفحة عامة على الإنترنت: هل تضع هذا فيها؟', buckets: ['✅ مقبول', '🚫 لا أبداً'], items: [['اسمك الأول أو لقب', 0], ['هواياتك', 0], ['رسوماتك ومشاريعك', 0], ['عنوان بيتك', 1], ['اسم مدرستك وصفّك', 1], ['رقم هاتفك', 1], ['صورة وجهك مع اسمك الكامل', 1], ['ألعابك المفضّلة', 0]], yes: 'أحسنت! الصفحة العامة للمشاريع والهوايات فقط، وليست للمعلومات الشخصية.' },
          { t: 'do', m: 'ابنِ صفحتك (استخدم لقباً وليس اسمك الكامل):', w: { type: 'web', goal: 1, h: 320, tabs: ['html', 'css'], html: '<h1>صفحة ...</h1>\n<p>عن نفسي: ...</p>\n\n<h2>هواياتي</h2>\n\n', css: 'body {\n  \n}\n', missions: [{ d: 'عنوان `h1` ملوّن (غيّر color)', dom: Q('h1') + ' && ' + CS('h1', 'color') + ' !== "rgb(0, 0, 0)"' }, { d: 'فقرة `p` عن نفسك', dom: Q('p') }, { d: 'قائمة `ul` فيها 3 هوايات على الأقل', dom: N('ul li') + ' >= 3' }, { d: 'صفّ بطاقات: صندوق `display: flex` فيه بطاقتان `.card` على الأقل', dom: 'Array.from(document.querySelectorAll("*")).some(function(e){return getComputedStyle(e).display==="flex" && e.querySelectorAll(".card").length>=2})' }, { d: 'خلفية ملوّنة للصفحة `body`', dom: CS('body', 'backgroundColor') + ' !== "rgba(0, 0, 0, 0)"' }], hint: 'اجمع كل ما تعلّمته: h1 و p و ul/li، ثم <div class="row"> فيه بطاقات <div class="card">، وفي CSS: .row { display: flex; gap: 12px; }', sol: { html: '<h1>صفحة الصقر الصغير</h1>\n<p>عن نفسي: أحب البرمجة والأمن السيبراني 🦅</p>\n<h2>هواياتي</h2>\n<ul>\n  <li>البرمجة</li>\n  <li>الرسم</li>\n  <li>الشطرنج</li>\n</ul>\n<h2>مشاريعي</h2>\n<div class="row">\n  <div class="card">🧮 آلة حاسبة</div>\n  <div class="card">🎮 لعبة أسئلة</div>\n</div>\n', css: 'body {\n  background-color: #eef6ff;\n}\nh1 {\n  color: #1d4ed8;\n  text-align: center;\n}\n.row {\n  display: flex;\n  gap: 12px;\n  flex-wrap: wrap;\n}\n.card {\n  padding: 14px;\n  border: 2px solid gold;\n  border-radius: 14px;\n  background-color: white;\n}\n' }, yes: '🎉 صفحتك الشخصية جاهزة! صمّمتها بنفسك من الصفر.' } },
          { t: 'say', mood: 'happy', m: 'رائع! الآن صفحتك جميلة، لكنها **ثابتة**: لا تتفاعل مع الزائر. في الوحدة القادمة سنجعلها حيّة بـ JavaScript ⚡' }
        ]
      }
    ],
    test: [
      { t: 'q', q: 'أيّ وسم يصنع قائمة نقاط؟', o: ['<ul>', '<h1>', '<a>'], a: 0, tag: 'وسوم HTML' },
      { t: 'q', q: 'كل عنصر داخل القائمة يُكتب في وسم...', o: ['<li>', '<p>', '<div>'], a: 0, tag: 'وسوم HTML' },
      { t: 'q', q: 'أيّ صفة تحدّد وجهة الرابط؟', o: ['href', 'class', 'color'], a: 0, tag: 'وسوم HTML' },
      { t: 'q', q: 'ما وظيفة CSS؟', o: ['تلوين الصفحة وتصميم شكلها', 'بناء الهيكل', 'تشغيل الخادم'], a: 0, tag: 'قواعد CSS' },
      { t: 'q', q: 'في `h1 { color: blue; }` المحدِّد هو...', o: ['h1', 'color', 'blue'], a: 0, tag: 'قواعد CSS' },
      { t: 'q', q: 'أيّ خاصية تغيّر لون الكلام؟', o: ['color', 'background-color', 'border'], a: 0, tag: 'قواعد CSS' },
      { t: 'q', q: 'اللون `#00ff00` هو...', o: ['أخضر', 'أحمر', 'أزرق'], a: 0, why: 'أحمر 00، أخضر ff، أزرق 00.', tag: 'قواعد CSS' },
      { t: 'q', q: 'كيف نختار العناصر التي `class="box"` في CSS؟', o: ['.box', 'box', '<box>'], a: 0, tag: 'الصناديق' },
      { t: 'q', q: 'المسافة **خارج** الصندوق اسمها...', o: ['margin', 'padding', 'gap'], a: 0, tag: 'الصناديق' },
      { t: 'q', q: 'أيّ خاصية تجعل الزوايا مستديرة؟', o: ['border-radius', 'text-align', 'font-size'], a: 0, tag: 'الصناديق' },
      { t: 'q', q: 'لتصفّ البطاقات بجانب بعضها نكتب على الصندوق الكبير:', o: ['display: flex;', 'color: flex;', 'flex: red;'], a: 0, tag: 'flex' },
      { t: 'q', q: 'أيّ معلومة لا نضعها في صفحة عامة؟', o: ['عنوان البيت', 'الهوايات', 'المشاريع'], a: 0, tag: 'الصناديق' }
    ]
  });
})();
