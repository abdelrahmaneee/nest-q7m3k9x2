/* ===== عُقاب — art (SVG) ===== */
'use strict';
const Art = (() => {
  /* companion palette / costume catalogue (stage 1 = day, stage 2 = night) */
  const COLORS = {
    blue: ['#244A93', '#3F74D6', 'أزرق'], red: ['#9B2C2C', '#E05A5A', 'أحمر'], green: ['#1F6B45', '#3BB273', 'أخضر'], gold: ['#8A5A00', '#E0A21B', 'ذهبي'], purple: ['#4B2A8C', '#8E6BE8', 'بنفسجي'], orange: ['#A04A0F', '#F08A3C', 'برتقالي'],
    ngreen: ['#0F2F22', '#2BD67B', 'أخضر نيون'], ncyan: ['#0B2A3A', '#2BC8F0', 'سماوي نيون'], npink: ['#3A0F33', '#F04CC8', 'وردي نيون'], nred: ['#3A0F14', '#FF5A6A', 'أحمر نيون'], namber: ['#33250A', '#FFC53D', 'كهرماني'],
    teal: ['#0F5E63', '#2EC4B6', 'فيروزي'], silver: ['#475569', '#C0C9D6', 'فضي'], nviolet: ['#24124A', '#A78BFA', 'بنفسجي نيون'], nwhite: ['#1E293B', '#E6F0FF', 'أبيض ثلجي']
  };
  /* costumes open one after another as points grow.
     stage 1: total XP. Guaranteed XP from lessons+tests alone reaches 4600 at the end of stage 1,
     so the last day costume (4300) is always reachable, and medals/daily play bring each one earlier.
     stage 2: "night points" = flag points + part-3 lessons. Minimum when everything is done ≈ 3550 (with hints),
     so the last night costume (3400) is always reachable and arrives well before the end. */
  const LOOKS = {
    s1: {
      cos: [['classic', 'الكلاسيكي', null], ['astro', 'رائد الفضاء', { xp: 150 }], ['detective', 'المحقّق الرقمي', { xp: 400 }], ['coder', 'المبرمج', { xp: 700 }], ['scientist', 'العالِم', { xp: 1000 }], ['netguard', 'حارس الشبكة', { xp: 1400 }], ['knight', 'حارس الجدار الناري', { xp: 1800 }], ['analyst', 'محلّل مركز الأمن', { xp: 2300 }], ['cryptor', 'سيّد التشفير', { xp: 2800 }], ['whitehat', 'الهاكر الأخلاقي', { xp: 3300 }], ['hero', 'البطل الرقمي', { xp: 3800 }], ['king', 'الملك', { xp: 4300, crown: 1 }]],
      col: ['blue', 'red', 'green', 'gold', 'purple', 'orange', 'teal', 'silver'],
      colReq: { teal: { xp: 600 }, silver: { xp: 2000 } },
      th: [['sky', 'السماء'], ['forest', 'الغابة'], ['sunset', 'الغروب'], ['candy', 'الحلوى'], ['desert', 'الصحراء']]
    },
    s2: {
      cos: [['ninja', 'النينجا', null], ['hood', 'صاحب القلنسوة', null], ['cyborg', 'السايبورغ', { np: 150 }], ['glitch', 'الغلتش', { np: 400 }], ['shadow', 'الظل', { np: 800 }], ['redteam', 'الفريق الأحمر', { np: 1300 }], ['samurai', 'الساموراي', { np: 1900 }], ['phantom', 'الشبح الرقمي', { np: 2600 }], ['legend', 'أسطورة الأعلام', { np: 3400 }]],
      col: ['ngreen', 'ncyan', 'npink', 'nred', 'namber', 'nviolet', 'nwhite'],
      colReq: { nviolet: { np: 600 }, nwhite: { np: 2200 } },
      th: [['neon', 'النيون'], ['synth', 'السينث'], ['ice', 'الجليد'], ['ember', 'الجمر']]
    }
  };
  /* robotic eagle companion. mood: idle|happy|think|wow ; lvl 0..6 ; look {cos,col} */
  function eagle(mood = 'idle', lvl = 0, night = false, look) {
    look = look || (typeof App !== 'undefined' && App.look ? App.look(night) : null) || {};
    const cos = ({ wizard: 'whitehat', pharaoh: 'analyst' })[look.cos] || look.cos || (night ? 'ninja' : 'classic');
    const pal = COLORS[look.col] || COLORS[night ? 'ngreen' : 'blue'];
    const steel = pal[0], steel2 = pal[1], face = '#EEF5FF', gold = '#F2A51A', gold2 = '#FFD36B';
    const eyeC = night ? steel2 : '#43D1FF';
    let back = '', top = '', mid = '', band = '';
    if (cos === 'classic') { const n = 3 + Math.min(lvl, 6); for (let i = 0; i < n; i++) { const a = -70 + i * (140 / (n - 1)); back += '<path d="M60 26 l-4 -18 l8 0 z" fill="' + (i % 2 ? gold : gold2) + '" transform="rotate(' + a + ' 60 40)"/>'; } }
    if (cos === 'astro') top = '<circle cx="60" cy="50" r="40" fill="rgba(200,230,255,.22)" stroke="#CFE8FF" stroke-width="3"/><path d="M34 30 q10 -14 26 -16" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/><path d="M60 10 v-8" stroke="#CFE8FF" stroke-width="3"/><circle cx="60" cy="2" r="4" fill="#FF5A5A"/>';
    if (cos === 'detective') top = '<path d="M30 34 q30 -30 60 0 q-30 -6 -60 0z" fill="#8B5E34" stroke="#4A2F14" stroke-width="2.5"/><path d="M26 36 q34 -8 68 0 q-6 6 -34 4 q-28 2 -34 -4z" fill="#A8743F" stroke="#4A2F14" stroke-width="2"/><path d="M40 22 l40 0" stroke="#4A2F14" stroke-width="2" stroke-dasharray="3 3"/>';
    if (cos === 'knight') top = '<path d="M30 46 q0 -30 30 -30 q30 0 30 30 h-6 q-2 -20 -24 -22 q-22 2 -24 22z" fill="#B8C2D1" stroke="#4B5563" stroke-width="2.5"/><path d="M60 16 v14" stroke="#4B5563" stroke-width="3"/><path d="M62 16 q16 -14 30 -6 q-12 2 -18 12" fill="#E04B4B" stroke="#7A1A1A" stroke-width="2"/>';
    if (cos === 'whitehat') top = '<path d="M33 32 q1 -27 27 -27 q26 0 27 27z" fill="#F8FAFC" stroke="#64748B" stroke-width="2.5"/><path d="M46 11 q14 9 28 0" stroke="#94A3B8" stroke-width="2.5" fill="none"/><rect x="33.6" y="23" width="52.8" height="8.5" fill="#14A37F"/><text x="60" y="30" font-size="7.5" text-anchor="middle" fill="#ECFDF5" font-family="monospace" font-weight="700">1010</text><ellipse cx="60" cy="34" rx="41" ry="7.5" fill="#FFFFFF" stroke="#64748B" stroke-width="2.5"/>';
    if (cos === 'king') top = '<path d="M36 26 l6 -18 l9 12 l9 -16 l9 16 l9 -12 l6 18z" fill="#F2C230" stroke="#8A5A00" stroke-width="2.5"/><circle cx="60" cy="16" r="3" fill="#E04B4B"/><circle cx="45" cy="20" r="2.5" fill="#2F6BD8"/><circle cx="75" cy="20" r="2.5" fill="#14A37F"/>';
    if (cos === 'scientist') top = '<g fill="none" stroke="#334155" stroke-width="3"><circle cx="48" cy="50" r="12" fill="rgba(180,230,255,.35)"/><circle cx="72" cy="50" r="12" fill="rgba(180,230,255,.35)"/><path d="M60 50 h0 M36 48 l-6 -2 M84 48 l6 -2"/></g><path d="M58 22 q2 -12 10 -14 q-2 8 4 10" fill="#14A37F" stroke="#0B4D3A" stroke-width="2"/><circle cx="66" cy="10" r="3" fill="#7CF0C0"/>';
    if (cos === 'analyst') { top = '<path d="M27 54 q-1 -42 33 -42 q34 0 33 42" fill="none" stroke="#1F2937" stroke-width="5.5" stroke-linecap="round"/><rect x="18" y="46" width="13" height="22" rx="6" fill="#2F6BD8" stroke="#1E3A8A" stroke-width="2.5"/><rect x="89" y="46" width="13" height="22" rx="6" fill="#2F6BD8" stroke="#1E3A8A" stroke-width="2.5"/><circle cx="24.5" cy="57" r="3" fill="#7CF0C0"/>'; mid = '<path d="M25 66 q2 16 22 16" fill="none" stroke="#1F2937" stroke-width="3" stroke-linecap="round"/><rect x="45" y="78" width="9" height="7" rx="3.5" fill="#1F2937"/>'; }
    if (cos === 'samurai') top = '<path d="M28 42 q0 -28 32 -28 q32 0 32 28 q-10 -6 -32 -6 q-22 0 -32 6z" fill="#7F1D1D" stroke="#2A0A0A" stroke-width="2.5"/><path d="M60 16 q-26 -20 -34 -6 q12 -2 22 12 M60 16 q26 -20 34 -6 q-12 -2 -22 12" fill="' + steel2 + '" stroke="#2A0A0A" stroke-width="2"/><circle cx="60" cy="24" r="4" fill="' + steel2 + '"/><path d="M26 44 l-8 14 l14 -6 M94 44 l8 14 l-14 -6" fill="#7F1D1D" stroke="#2A0A0A" stroke-width="2"/>';
    if (cos === 'coder') top = '<path d="M32 37 q0 -31 28 -31 q28 0 28 31z" fill="#334155" stroke="#0F172A" stroke-width="2.5"/><rect x="30" y="31" width="60" height="9" rx="4.5" fill="#475569" stroke="#0F172A" stroke-width="2"/><circle cx="60" cy="6" r="5" fill="#22C55E" stroke="#0F172A" stroke-width="2"/><text x="60" y="26" font-size="12" text-anchor="middle" fill="#7CF0C0" font-family="monospace" font-weight="700">&lt;/&gt;</text>';
    if (cos === 'netguard') top = '<path d="M60 21 v-9" stroke="#334155" stroke-width="3"/><circle cx="60" cy="11" r="3.5" fill="#14A37F"/><g fill="none" stroke="#14A37F" stroke-width="3" stroke-linecap="round"><path d="M52 8 q8 -6 16 0"/><path d="M46 4 q14 -9 28 0"/></g><path d="M60 86 l10 4 v7 q0 8 -10 12 q-10 -4 -10 -12 v-7z" fill="#14A37F" stroke="#0B4D3A" stroke-width="2"/><path d="M55 97 l4 4 l7 -8" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>';
    if (cos === 'cryptor') { back = '<g transform="rotate(-38 60 60)"><circle cx="60" cy="6" r="9" fill="none" stroke="#E0A21B" stroke-width="5"/><path d="M60 15 v95 M60 98 h11 M60 106 h8" stroke="#E0A21B" stroke-width="5"/></g>'; top = '<path d="M49 16 v-5 a11 11 0 0 1 22 0 v5" fill="none" stroke="#5A3A00" stroke-width="4"/><rect x="43" y="15" width="34" height="20" rx="5" fill="#E0A21B" stroke="#5A3A00" stroke-width="2.5"/><circle cx="60" cy="23" r="3.5" fill="#3A2400"/><path d="M60 25 v6" stroke="#3A2400" stroke-width="3" stroke-linecap="round"/>'; }
    if (cos === 'hero') { back = '<path d="M30 58 q-22 34 -16 58 q46 8 92 0 q6 -24 -16 -58z" fill="#E04B4B" stroke="#7A1A1A" stroke-width="2.5"/>'; band = '<path d="M30 42 q30 -9 60 0 q3 12 -5 17 q-12 3 -25 -2 q-13 5 -25 2 q-8 -5 -5 -17z" fill="#111827"/><path d="M90 46 l12 -6 M90 50 l12 2" stroke="#111827" stroke-width="4" stroke-linecap="round"/>'; top = '<circle cx="60" cy="99" r="8" fill="#FFD36B" stroke="#C27C00" stroke-width="2"/><text x="60" y="102.5" font-size="9" text-anchor="middle" fill="#7A1A1A" font-weight="900" font-family="monospace">01</text>'; }
    if (cos === 'glitch') { band = '<rect x="34" y="42" width="52" height="16" rx="3" fill="#0B0B14"/>'; top = '<g><rect x="20" y="40" width="14" height="5" fill="#2BC8F0"/><rect x="86" y="56" width="16" height="5" fill="#F04CC8"/><rect x="26" y="74" width="10" height="4" fill="#F04CC8"/><rect x="84" y="30" width="9" height="4" fill="#2BC8F0"/><animate attributeName="opacity" values="1;.25;1;.8;1" dur="1.4s" repeatCount="indefinite"/></g><path d="M36 61 h48" stroke="' + steel2 + '" stroke-width="1.5" opacity=".7"/>'; }
    if (cos === 'redteam') top = '<path d="M30 31 q4 -21 34 -19 q26 2 28 14 q-30 -4 -62 5z" fill="#B91C1C" stroke="#450A0A" stroke-width="2.5"/><circle cx="83" cy="20" r="5" fill="#FCA5A5" stroke="#450A0A" stroke-width="2"/><path d="M38 59 q22 10 44 0 l-2 10 q-20 8 -40 0z" fill="#DC2626" stroke="#450A0A" stroke-width="2"/><path d="M44 66 h32" stroke="#FCA5A5" stroke-width="1.5" stroke-dasharray="3 3"/>';
    if (cos === 'phantom') { back = '<ellipse cx="60" cy="64" rx="56" ry="56" fill="' + steel2 + '" opacity=".16"><animate attributeName="opacity" values=".1;.28;.1" dur="2.4s" repeatCount="indefinite"/></ellipse>'; top = '<ellipse cx="60" cy="14" rx="22" ry="5" fill="none" stroke="' + steel2 + '" stroke-width="2.5"/><ellipse cx="60" cy="8" rx="14" ry="3.5" fill="none" stroke="' + steel2 + '" stroke-width="2" opacity=".6"/><g stroke="' + steel2 + '" stroke-width="1.2" opacity=".35"><path d="M32 76 h56 M30 84 h60 M32 92 h56 M36 100 h48"/></g>'; }
    if (cos === 'legend') { back = '<path d="M30 66 q-14 30 -10 50 q40 6 80 0 q4 -20 -10 -50z" fill="#0B0B14" stroke="' + steel2 + '" stroke-width="2.5"/>'; top = '<path d="M38 29 l5 -15 l9 9 l8 -16 l8 16 l9 -9 l5 15z" fill="' + steel2 + '" stroke="#0B0B14" stroke-width="2"/><circle cx="60" cy="20" r="3" fill="#FF5A6A"/><path d="M92 34 v-30" stroke="#E5E7EB" stroke-width="2.5"/><path d="M92 4 h20 l-5 6 l5 6 h-20z" fill="#FF5A6A" stroke="#0B0B14" stroke-width="1.5"/>'; }
    if (cos === 'ninja') band = '<path d="M30 40 h60 v16 h-60z" fill="#111827"/><path d="M90 46 q14 -2 20 8 M90 50 q12 6 14 16" stroke="#111827" stroke-width="5" fill="none" stroke-linecap="round"/>';
    if (cos === 'hood') mid = '<path d="M24 64 q-6 -50 36 -54 q42 4 36 54 q-6 -14 -12 -18 q-4 -22 -24 -24 q-20 2 -24 24 q-6 4 -12 18z" fill="#1F2937" stroke="#0B1220" stroke-width="2.5"/>';
    if (cos === 'cyborg') top = '<rect x="30" y="42" width="60" height="14" rx="7" fill="' + steel2 + '" opacity=".55"/><rect x="30" y="42" width="60" height="14" rx="7" fill="none" stroke="' + steel2 + '" stroke-width="2"/><path d="M80 22 l12 -14" stroke="' + steel2 + '" stroke-width="3"/><circle cx="93" cy="7" r="3.5" fill="' + steel2 + '"/>';
    if (cos === 'shadow') back = '<path d="M20 64 q40 -10 80 0 l10 50 q-50 12 -100 0z" fill="#0B0B14" stroke="' + steel2 + '" stroke-width="2" opacity=".95"/>';
    let eyes;
    if (mood === 'happy') eyes = '<path d="M40 50 q8 -9 16 0" stroke="#0B1A3A" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M64 50 q8 -9 16 0" stroke="#0B1A3A" stroke-width="4.5" fill="none" stroke-linecap="round"/>';
    else eyes = '<g class="eye"><circle cx="48" cy="50" r="9" fill="#0B1A3A"/><circle cx="48" cy="50" r="5.2" fill="' + eyeC + '"/><circle cx="50" cy="47.5" r="2" fill="#fff"/></g><g class="eye"><circle cx="72" cy="50" r="9" fill="#0B1A3A"/><circle cx="72" cy="50" r="5.2" fill="' + eyeC + '"/><circle cx="74" cy="47.5" r="2" fill="#fff"/></g>' +
      (mood === 'think' ? '<path d="M64 36 l16 -3" stroke="#0B1A3A" stroke-width="3.5" stroke-linecap="round"/>' : '<path d="M38 38 l14 3 M82 38 l-14 3" stroke="#0B1A3A" stroke-width="3.5" stroke-linecap="round"/>');
    if (cos === 'ninja' || cos === 'shadow' || cos === 'glitch') eyes = eyes.replace(/stroke="#0B1A3A"/g, 'stroke="' + steel2 + '"');
    const beak = mood === 'wow'
      ? '<path d="M52 58 q8 -4 16 0 l-2 8 q-6 10 -12 0 z" fill="' + gold + '" stroke="#7A4A00" stroke-width="2"/><path d="M55 66 q5 4 10 0" fill="#7A1A1A"/>'
      : '<path d="M51 57 q9 -5 18 0 q0 9 -7 15 q-2 2 -3 -1 q-1 -5 -8 -8 z" fill="' + gold + '" stroke="#7A4A00" stroke-width="2"/>';
    const faceC = cos === 'shadow' ? '#1A1A2E' : face;
    return '<svg class="eagle" viewBox="0 0 120 120" aria-hidden="true">' + back +
      '<g class="wl"><path d="M30 70 q-26 -6 -28 20 q14 -6 18 2 q6 -8 14 -2 z" fill="' + steel + '" stroke="#0B1A3A" stroke-width="2.5"/><path d="M8 84 l10 -2 M14 90 l8 -4" stroke="' + steel2 + '" stroke-width="2.5"/></g>' +
      '<g class="wr"><path d="M90 70 q26 -6 28 20 q-14 -6 -18 2 q-6 -8 -14 -2 z" fill="' + steel + '" stroke="#0B1A3A" stroke-width="2.5"/><path d="M112 84 l-10 -2 M106 90 l-8 -4" stroke="' + steel2 + '" stroke-width="2.5"/></g>' +
      '<ellipse cx="60" cy="88" rx="30" ry="26" fill="' + steel + '" stroke="#0B1A3A" stroke-width="2.5"/>' +
      '<path d="M48 82 h24 v10 q-12 10 -24 0 z" fill="' + faceC + '" stroke="#0B1A3A" stroke-width="2"/><path d="M60 84 v12" stroke="' + steel2 + '" stroke-width="2.5"/>' +
      '<path d="M48 112 l-4 6 M54 113 l0 6 M66 113 l0 6 M72 112 l4 6" stroke="' + gold + '" stroke-width="4" stroke-linecap="round"/>' +
      '<circle cx="60" cy="50" r="30" fill="' + steel + '" stroke="#0B1A3A" stroke-width="2.5"/>' + mid +
      '<path d="M34 50 q0 -18 26 -18 q26 0 26 18 q0 12 -10 14 h-32 q-10 -2 -10 -14z" fill="' + faceC + '"/>' +
      band + eyes + beak +
      '<circle cx="31" cy="54" r="3" fill="' + steel2 + '"/><circle cx="89" cy="54" r="3" fill="' + steel2 + '"/>' + top +
      '</svg>';
  }

  /* white hat, level 0..6 */
  function hat(lvl = 0) {
    const band = ['#9AA8C0', '#2F6BD8', '#2F6BD8', '#14A37F', '#9B6BFF', '#E04B4B', '#F2A51A'][lvl] || '#9AA8C0';
    const trim = lvl >= 6 ? '#F2A51A' : '#D9E2F0';
    let extra = '', glow = '';
    if (lvl >= 2) extra += '<g transform="translate(100 94)"><path d="M0 -13 l11 4 v8 q0 9 -11 14 q-11 -5 -11 -14 v-8 z" fill="#fff" stroke="' + band + '" stroke-width="3"/><path d="M-5 0 l4 4 l7 -8" stroke="' + band + '" stroke-width="3" fill="none" stroke-linecap="round"/></g>';
    if (lvl >= 3) extra += '<circle cx="132" cy="93" r="5" fill="#F2A51A"/><circle cx="68" cy="93" r="5" fill="#F2A51A"/>';
    if (lvl >= 4) glow = '<ellipse cx="100" cy="80" rx="96" ry="72" fill="url(#hglow)"/>';
    if (lvl >= 5) extra += '<path d="M30 96 q-26 -20 -16 -50 q12 18 30 28 z M170 96 q26 -20 16 -50 q-12 18 -30 28 z" fill="#fff" stroke="#9FB3D6" stroke-width="3"/>';
    if (lvl >= 6) extra += '<g fill="#FFD36B"><path d="M100 4 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4z"><animateTransform attributeName="transform" type="rotate" from="0 100 18" to="360 100 18" dur="6s" repeatCount="indefinite"/></path></g>';
    return '<svg viewBox="0 0 200 160" aria-hidden="true"><defs><radialGradient id="hglow"><stop offset="0" stop-color="#FFE08A" stop-opacity=".9"/><stop offset="1" stop-color="#FFE08A" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="hcrown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#E3EAF5"/></linearGradient></defs>' + glow +
      '<ellipse cx="100" cy="112" rx="86" ry="22" fill="#fff" stroke="' + trim + '" stroke-width="5"/>' +
      '<path d="M48 110 q-2 -54 22 -70 q14 -10 30 0 q16 -10 30 0 q24 16 22 70 q-52 14 -104 0z" fill="url(#hcrown)" stroke="#C5D2E6" stroke-width="3"/>' +
      '<path d="M100 40 q-4 16 0 30" stroke="#C5D2E6" stroke-width="3" fill="none"/>' +
      '<path d="M50 88 q50 14 100 0 l1 16 q-51 14 -102 0z" fill="' + band + '"/>' + extra + '</svg>';
  }

  function medal(icon, color = '#2F6BD8', got = true) {
    return '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M30 4 h14 l8 28 h-14z" fill="#E04B4B"/><path d="M70 4 h-14 l-8 28 h14z" fill="#2F6BD8"/>' +
      '<circle cx="50" cy="60" r="34" fill="' + (got ? '#FFD36B' : '#D3DDEE') + '" stroke="' + (got ? '#C27C00' : '#9AA8C0') + '" stroke-width="5"/>' +
      '<circle cx="50" cy="60" r="25" fill="' + color + '"/><text x="50" y="70" text-anchor="middle" font-size="28">' + icon + '</text></svg>';
  }

  const IC = {
    map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
    hat: '<path d="M3 17c4 2 14 2 18 0M6 16c0-6 1-10 4-10 1 0 1.5 1 2 1s1-1 2-1c3 0 4 4 4 10"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    unlock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 7.5-2"/>',
    flag: '<path d="M5 21V4m0 0h11l-2 4 2 4H5"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    back: '<path d="m9 6 6 6-6 6"/>',
    fire: '<path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-5 5-5 8-1-1-2-2-2-4-2 2-2 5-2 8 0 4 3 7 7 7Z"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    sound: '<path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6m2-9a8 8 0 0 1 0 12"/>',
    mute: '<path d="M4 9v6h4l5 4V5L8 9zM17 9l5 6m0-6-5 6"/>',
    play: '<path d="M7 4v16l13-8z"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    msg: '<path d="M4 5h16v11H8l-4 4z"/>',
    dl: '<path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    up: '<path d="m6 15 6-6 6 6"/>', down: '<path d="m6 9 6 6 6-6"/>',
    bulb: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3Z"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>'
  };
  const ic = (n, s = 24) => '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IC[n] || '') + '</svg>';

  const logo = (night) => '<svg viewBox="0 0 48 48" aria-hidden="true"><rect width="48" height="48" rx="14" fill="' + (night ? '#2BD67B' : '#1E4FA6') + '"/><path d="M8 26 q8 -4 12 2 q2 -10 12 -12 q-2 6 2 8 q6 2 8 -2 q0 10 -10 12 q-4 6 -12 4 q-8 -2 -12 -12z" fill="' + (night ? '#04140B' : '#fff') + '"/><circle cx="30" cy="20" r="2" fill="' + (night ? '#2BD67B' : '#1E4FA6') + '"/><path d="M34 20 l5 2 l-5 2z" fill="#F2A51A"/></svg>';
  return { eagle, hat, medal, ic, logo, LOOKS, COLORS };
})();
const ic = Art.ic;
