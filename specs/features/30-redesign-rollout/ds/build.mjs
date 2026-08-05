// Generates the Claude Design (DesignSync) cards for the full design system —
// self-contained RTL HTML per card, real app values only (tokens.css +
// language.md). Run: node specs/features/30-redesign-rollout/ds/build.mjs
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "dist");

const CSS = `
  * { margin:0; padding:0; box-sizing:border-box; }
  :root{
    --bg:#F8F5EE; --bg-2:#F2EAD8; --paper:#FFFFFF; --line:#EDE5D2; --line-2:#DCD0B4;
    --ink:#1F1A14; --ink-2:#6E6457; --ink-3:#A6997F;
    --accent:#E66B3D; --accent-2:#F2BC8E; --accent-bg:#FCE7D4;
    --sage:#BFC7A0; --sage-2:#8C9963; --sage-bg:#ECEFDC;
    --warn:#D38D1B; --warn-bg:#FBEFD0; --danger:#A14525; --danger-bg:#F8D8CE;
    --charcoal:#292A28;
  }
  body{
    font-family:Rubik,-apple-system,"Segoe UI",sans-serif; color:var(--ink);
    background:linear-gradient(160deg,#FFF8F1 0%,#FFDDBD 22%,#F7F0E7 55%,#DDEDF2 100%);
    min-height:100vh; padding:20px; max-width:375px; margin:0 auto; font-size:14px;
  }
  .num{ font-family:"JetBrains Mono",ui-monospace,monospace; direction:ltr; unicode-bidi:isolate; }
  .glass{
    border-radius:32px; border:1px solid rgba(255,255,255,.6);
    background:rgba(255,248,241,.95);
    box-shadow:0 1px 0 rgba(255,255,255,.65),0 14px 36px rgba(80,61,45,.07);
    padding:20px;
  }
  @supports (backdrop-filter:blur(12px)){
    .glass{ background:rgba(255,255,255,.35); backdrop-filter:blur(12px); }
  }
  .charcoal{
    background-color:var(--charcoal);
    background-image:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,0) 60%);
    color:var(--paper);
  }
  .charcoal-shadow{ box-shadow:0 1px 0 rgba(255,255,255,.08),0 18px 45px rgba(41,42,40,.22); }
  .pill{ background:rgba(255,255,255,.7); color:var(--ink-2); }
  .inset-tone{ background:rgba(31,26,20,.04); }
  .chip{
    display:inline-flex; align-items:center; justify-content:center;
    border-radius:999px; padding:0 16px; min-height:44px; border:0;
    font:inherit; font-weight:500; font-size:14px;
  }
  .btn{
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    border-radius:999px; min-height:52px; padding:0 24px; border:0;
    font:inherit; font-weight:500; font-size:16px;
  }
  .stepper{ display:flex; align-items:center; border-radius:999px; min-height:52px; }
  .stepper .pm{ min-width:52px; text-align:center; font-size:20px; color:var(--ink-2); }
  .stepper .val{ flex:1; text-align:center; font-size:18px; font-weight:600; color:var(--ink); }
  h2{ font-size:17px; font-weight:700; margin-bottom:4px; }
  .cap{ font-size:12px; color:var(--ink-3); margin:14px 0 8px; }
  .cap:first-child{ margin-top:0; }
  .row{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
  .sw{ display:flex; align-items:center; gap:10px; margin-bottom:8px; font-size:13px; }
  .sw i{ width:36px; height:36px; border-radius:12px; flex:none; border:1px solid rgba(31,26,20,.06); }
  .sw code{ font-family:"JetBrains Mono",monospace; font-size:11px; color:var(--ink-3); direction:ltr; }
  .statelbl{ font-size:11px; color:var(--ink-3); display:block; margin-top:4px; text-align:center; }
  .focus-ring{ box-shadow:0 0 0 2px rgba(31,26,20,.2); }
  @keyframes press-demo { 0%,100%{transform:scale(1)} 50%{transform:scale(.965)} }
`;

function page(title, group, body, extraCss = "") {
  return `<!-- @dsCard group="${group}" name="${title}" -->
<!doctype html>
<html dir="rtl" lang="he">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>${CSS}${extraCss}</style>
</head>
<body>${body}</body>
</html>`;
}

const svgClock = (c) => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`;
const svgWheat = (c) => `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"><path d="M12 22V8"/><path d="M12 8c-3 0-5-2-5-5 3 0 5 2 5 5Z"/><path d="M12 8c3 0 5-2 5-5-3 0-5 2-5 5Z"/><path d="M12 14c-3 0-5-2-5-5 3 0 5 2 5 5Z"/><path d="M12 14c3 0 5-2 5-5-3 0-5 2-5 5Z"/></svg>`;

const cards = {};

/* ═══════════════ סקירה ═══════════════ */

cards["overview/index.html"] = page("מפת המערכת", "סקירה", `
  <div class="glass">
    <h2>כיכר — דזיין סיסטם</h2>
    <p style="font-size:13px;color:var(--ink-2);margin-bottom:12px">שפת הרידזיין (Discovery 22 + language.md). עברית-first, ‏RTL, מובייל 375px.</p>
    <p style="font-size:13px;line-height:1.8">
      <strong>עקרונות:</strong> היררכיה דרך משטח, לא צבע · שתי צורות (פיל, אריח) ·
      בחירה בהיפוך טונאלי · מספרים כגיבורים · צבע חי אחד למסך ·
      עומק בטון ושקיפות, לא בגבולות · בהיר לתכנון, כהה ל״עכשיו״.
    </p>
    <p class="cap">קבוצות: יסודות · כפתורים · בחירה · שדות · הרכבים · שכבות · מצבים · עולם כהה</p>
  </div>`);

/* ═══════════════ יסודות ═══════════════ */

cards["foundations/color/index.html"] = page("צבע", "יסודות", `
  <div class="glass">
    <p class="cap">משטחים</p>
    <div class="sw"><i style="background:linear-gradient(160deg,#FFF8F1,#FFDDBD,#F7F0E7,#DDEDF2)"></i>קנבס ambient<code>gradient 160deg</code></div>
    <div class="sw"><i style="background:#FFFFFF"></i>paper<code>#FFFFFF</code></div>
    <div class="sw"><i style="background:rgba(255,255,255,.7)"></i>פיל חלבי<code>paper/70</code></div>
    <div class="sw"><i style="background:rgba(31,26,20,.04)"></i>inset טון<code>ink/4%</code></div>
    <div class="sw"><i style="background:#292A28"></i>charcoal<code>#292A28</code></div>
    <p class="cap">דיו (טקסט) — ink על קנבס: ‏13.9:1</p>
    <div class="sw"><i style="background:#1F1A14"></i>ink — טקסט ראשי<code>#1F1A14</code></div>
    <div class="sw"><i style="background:#6E6457"></i>ink-2 — משני<code>#6E6457</code></div>
    <div class="sw"><i style="background:#A6997F"></i>ink-3 — תוויות שקטות<code>#A6997F</code></div>
    <p class="cap">אקסנט וסטטוס — orange: רגע חי אחד למסך, לעולם לא משטח/בקרה</p>
    <div class="sw"><i style="background:#E66B3D"></i>accent (חימר)<code>#E66B3D</code></div>
    <div class="sw"><i style="background:#D38D1B"></i>warn<code>#D38D1B</code></div>
    <div class="sw"><i style="background:#A14525"></i>danger<code>#A14525</code></div>
    <div class="sw"><i style="background:#8C9963"></i>sage — הצלחה<code>#8C9963</code></div>
  </div>`);

cards["foundations/surfaces/index.html"] = page("קומות המשטח", "יסודות", `
  <p class="cap">קנבס ← glass ← inset חלבי ← inset טון ← charcoal. כרטיס לעולם לא בתוך כרטיס; inset בלי צל ובלי גבול.</p>
  <div class="glass">
    <h2>כרטיס glass</h2>
    <p style="font-size:13px;color:var(--ink-2);margin-bottom:14px">rounded 32px · גבול paper/60 · blur 12 · צל חום רך</p>
    <div class="pill" style="border-radius:999px;padding:12px 16px;font-size:13px;margin-bottom:10px">inset חלבי paper/70 — בקרות ושדות</div>
    <div class="inset-tone" style="border-radius:14px;padding:12px 16px;font-size:13px;margin-bottom:10px">inset טון ink/4% — טיפים, נבחר של radio, אריחי אייקון</div>
    <div class="charcoal charcoal-shadow" style="border-radius:20px;padding:14px 16px;font-size:13px">charcoal + sheen — פעולה ראשית · נבחר · hero ״עכשיו״</div>
  </div>`);

cards["foundations/typography/index.html"] = page("טיפוגרפיה", "יסודות", `
  <p class="cap">Rubik ‏UI · JetBrains Mono למספרים. ניגוד משקלים במקום ניגוד צבע.</p>
  <div class="glass">
    <p style="font-size:28px;font-weight:800;line-height:1.2">display-md 28 — כותרת מסך</p>
    <p style="font-size:22px;font-weight:700;margin-top:10px">display-sm 22</p>
    <p style="font-size:17px;font-weight:700;margin-top:10px">heading 17 — כותרת כרטיס</p>
    <p style="font-size:16px;margin-top:10px">body-lg 16 — טקסט מודגש</p>
    <p style="font-size:14px;margin-top:8px">body/label 14 — טקסט רץ</p>
    <p style="font-size:12px;color:var(--ink-2);margin-top:8px">small 12 — משני</p>
    <p style="font-size:11px;color:var(--ink-3);margin-top:8px">tiny/eyebrow 11 — תוויות שקטות</p>
    <p class="cap">מספרים — mono, ‏LTR מבודד בתוך עברית</p>
    <p style="font-size:14px">הידרציה <span class="num" style="font-weight:600">72%</span> · טמפרטורה <span class="num" style="font-weight:600">25°C</span> · שעה <span class="num" style="font-weight:600">16:22</span></p>
  </div>`);

cards["foundations/space-radius/index.html"] = page("ריווח ורדיוס", "יסודות", `
  <p class="cap">בסיס 4px. שלושה רדיוסים חיים יחד לכל היותר: כרטיס 32 · אריח 16 · פיל מלא.</p>
  <div class="glass">
    <p class="cap">רדיוסים בשימוש</p>
    <div class="row" style="align-items:flex-end;margin-bottom:6px">
      <div style="width:64px;height:64px;border-radius:32px;background:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center;font-size:11px">32</div>
      <div style="width:56px;height:56px;border-radius:16px;background:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center;font-size:11px">16</div>
      <div style="width:52px;height:44px;border-radius:999px;background:rgba(255,255,255,.9);display:flex;align-items:center;justify-content:center;font-size:11px">פיל</div>
    </div>
    <p class="cap">ריווח: כרטיס p-20 · בין כרטיסים 16 · בין בקרות 8–12 · יעד מגע ≥44px</p>
    <div style="display:flex;gap:4px;align-items:flex-end">
      ${[4, 8, 12, 16, 20, 24, 32].map((s) => `<div style="width:${s}px;height:${s}px;background:var(--ink-3);border-radius:3px"></div>`).join("")}
    </div>
  </div>`);

cards["foundations/depth/index.html"] = page("צל ועומק", "יסודות", `
  <p class="cap">שני צללים בלבד במערכת. הפרדה בטון ושקיפות — לא בגבולות ולא בערימת צללים.</p>
  <div class="glass" style="margin-bottom:14px">
    <p style="font-size:13px"><strong>צל glass</strong><br><code class="num" style="font-size:10px;color:var(--ink-3)">0 1px 0 white/65 · 0 14px 36px brown/7%</code></p>
  </div>
  <div class="charcoal charcoal-shadow" style="border-radius:24px;padding:16px">
    <p style="font-size:13px"><strong>צל charcoal</strong> — לפעולה הראשית ול־hero בלבד<br><code class="num" style="font-size:10px;opacity:.6">0 1px 0 white/8 · 0 18px 45px charcoal/22%</code></p>
  </div>`);

cards["foundations/motion/index.html"] = page("תנועה", "יסודות", `
  <p class="cap">CSS בלבד, בלי ספריות. reduced-motion מבטל transform ומקצר מעברים.</p>
  <div class="glass">
    <p class="cap">press אוניברסלי — scale(.965) · ‏120ms ease-out (שורות: ‏.985 + ink/5%)</p>
    <button class="chip charcoal" style="animation:press-demo 1.6s ease-out infinite">לחיצה חיה</button>
    <p class="cap">משכים</p>
    <p style="font-size:13px;line-height:1.9">
      <span class="num">120ms</span> fast — press, צבע ·
      <span class="num">200ms</span> base — כניסת/יציאת שכבות ·
      <span class="num">300ms</span> slow — sheets ·
      <span class="num">450ms</span> deliberate — חגיגות שלב
    </p>
    <p class="cap">כניסה אטומית: loading ← resolved בהחלפה אחת, fade ‏120–200ms, בלי shimmer ובלי pop-in</p>
  </div>`);

cards["foundations/icons-photos/index.html"] = page("אייקונים וצילום", "יסודות", `
  <p class="cap">lucide קו בלבד. אייקון מוביל באריח; דקורטיבי aria-hidden; כיווני מתהפך ב־RTL.</p>
  <div class="glass">
    <div class="row" style="margin-bottom:14px">
      <span class="inset-tone" style="width:44px;height:44px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center">${svgWheat("#1F1A14")}</span>
      <span class="inset-tone" style="width:44px;height:44px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center">${svgClock("#1F1A14")}</span>
      <span style="font-size:12px;color:var(--ink-2)">אריח 44 · אייקון 24 · דיו, לא כתום</span>
    </div>
    <div class="charcoal" style="border-radius:20px;padding:12px;display:flex;gap:10px;align-items:center;margin-bottom:14px">
      <span style="width:44px;height:44px;border-radius:16px;background:rgba(255,255,255,.1);display:inline-flex;align-items:center;justify-content:center">${svgClock("#fff")}</span>
      <span style="font-size:13px">על כהה: paper/10 + לבן</span>
    </div>
    <p class="cap">צילום — חום אורגני. תמונות לחם באריחים מעוגלים; placeholder = אריח Wheat טון, לא ריק</p>
    <div class="row">
      <span style="width:64px;height:48px;border-radius:16px;background:linear-gradient(45deg,#C89B6D,#E8CBA0);display:inline-block"></span>
      <span class="inset-tone" style="width:64px;height:48px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center">${svgWheat("#A6997F")}</span>
    </div>
  </div>`);

/* ═══════════════ כפתורים ═══════════════ */

cards["buttons/index.html"] = page("כפתורים — וריאנטים ומצבים", "כפתורים", `
  <p class="cap">ראשי אחד למסך. מילוי כתום — רק CTA התקנה (חריג F28).</p>
  <div class="glass" style="display:flex;flex-direction:column;gap:10px">
    <button class="btn charcoal charcoal-shadow" style="width:100%">ראשי — התחל בייק</button>
    <button class="btn" style="width:100%;background:#fff;color:var(--ink)">משני — paper</button>
    <button class="btn" style="width:100%;background:transparent;color:var(--ink-2)">ghost — חזרה</button>
    <button class="btn" style="width:100%;background:var(--warn);color:#fff">warn — דיאלוגים בלבד</button>
    <p class="cap">מצבים</p>
    <div class="row">
      <button class="btn charcoal" style="transform:scale(.965)">לחוץ<span class="statelbl"></span></button>
      <button class="btn charcoal focus-ring" style="box-shadow:0 0 0 2px #fff,0 0 0 4px var(--ink-2)">focus</button>
      <button class="btn charcoal" style="opacity:.4">disabled</button>
    </div>
    <div class="row">
      <button class="btn charcoal" style="min-height:44px;font-size:14px;padding:0 16px">sm ‏44px</button>
      <button class="btn charcoal"><span style="width:14px;height:14px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:999px;display:inline-block"></span>loading</button>
    </div>
  </div>`);

/* ═══════════════ בחירה ═══════════════ */

cards["selection/chips/index.html"] = page("צ'יפים — היפוך טונאלי", "בחירה", `
  <p class="cap">נבחר = charcoal + sheen. לא נבחר = פיל חלבי. אפס מסגרות צבע. role=radio.</p>
  <div class="glass">
    <div class="row" style="margin-bottom:4px">
      <button class="chip pill">מהיר</button>
      <button class="chip charcoal">קלאסי</button>
      <button class="chip pill">קלאסי מאוחר</button>
      <button class="chip pill">ארוך</button>
    </div>
    <p class="cap">מצבים</p>
    <div class="row">
      <button class="chip pill" style="transform:scale(.965)">לחוץ</button>
      <button class="chip pill focus-ring">focus</button>
      <button class="chip pill" style="opacity:.4">disabled</button>
    </div>
    <p class="cap">שורת גלילה: bleed עד קצה הכרטיס (‎-mx בגובה ה־padding), בלי scrollbar</p>
  </div>`);

cards["selection/segmented/index.html"] = page("טוגל מפוצל", "בחירה", `
  <p class="cap">שתי אפשרויות שוות — flex-1, אותו דקדוק. תמיד אחת נבחרת.</p>
  <div class="glass">
    <div class="row" style="flex-wrap:nowrap">
      <button class="chip charcoal" style="flex:1">מתי להתחיל</button>
      <button class="chip pill" style="flex:1">מתי לסיים</button>
    </div>
  </div>`);

cards["selection/pills/index.html"] = page("פילי ימים ויחס", "בחירה", `
  <div class="glass">
    <p class="cap">ימים — גלילה אופקית, ״הכי מוקדם״ תווית שקטה מתחת</p>
    <div class="row" style="margin-bottom:2px">
      <button class="chip charcoal">היום</button>
      <button class="chip pill">מחר</button>
      <button class="chip pill">מחרתיים</button>
      <button class="chip pill">יום שבת, <span class="num">8.8</span></button>
    </div>
    <span style="font-size:11px;color:var(--ink-3)">הכי מוקדם</span>
    <p class="cap">יחס האכלה — flex-1, ערכים mono ‏LTR</p>
    <div class="row" style="flex-wrap:nowrap">
      <button class="chip pill num" style="flex:1;font-size:13px">1:1:1</button>
      <button class="chip charcoal num" style="flex:1;font-size:13px">1:2:2</button>
      <button class="chip pill num" style="flex:1;font-size:13px">1:3:3</button>
      <button class="chip pill num" style="flex:1;font-size:13px">1:4:4</button>
    </div>
  </div>`);

cards["selection/radio-cards/index.html"] = page("כרטיסי radio", "בחירה", `
  <p class="cap">בחירה עשירה (כותרת+תיאור): נבחר = טון + עיגול charcoal מלא; לא נבחר = חלבי + עיגול line-2.</p>
  <div class="glass" style="display:flex;flex-direction:column;gap:10px">
    <div class="inset-tone" style="border-radius:16px;padding:16px;display:flex;gap:12px">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#292A28" stroke-width="2" style="flex:none;margin-top:2px"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4" fill="#292A28" stroke="none"/></svg>
      <span><strong style="font-size:15px">סיר/כלי סגור</strong><br><span style="font-size:13px;color:var(--ink-2)">סיר ברזל יצוק (dutch oven), נירוסטה עם מכסה. הכלי אוטם את האדים.</span></span>
    </div>
    <div class="pill" style="border-radius:16px;padding:16px;display:flex;gap:12px">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DCD0B4" stroke-width="2" style="flex:none;margin-top:2px"><circle cx="12" cy="12" r="9"/></svg>
      <span><strong style="font-size:15px;color:var(--ink)">אפייה פתוחה + תבנית אדים</strong><br><span style="font-size:13px;color:var(--ink-2)">תבנית/אבן/פלדה ללא מכסה, מים נפרדים למטה.</span></span>
    </div>
    <p class="cap">focus: טבעת ink-2 ‏inset · press: ‏scale(.985)</p>
  </div>`);

/* ═══════════════ שדות ═══════════════ */

cards["fields/steppers/index.html"] = page("סטפרים", "שדות", `
  <p class="cap">פיל חלבי בלי גבול · ערך mono ‏18 ממורכז · ± ‏44px בקצוות · אינדיקטור דפדפן מוסתר.</p>
  <div class="glass" style="display:flex;flex-direction:column;gap:12px">
    <div>
      <p style="font-size:13px;color:var(--ink-2);margin-bottom:6px">מהי טמפרטורת החדר?</p>
      <div class="stepper pill"><span class="pm">+</span><span style="font-size:13px;color:var(--ink-3)" class="num">°C</span><span class="val num">25</span><span class="pm">−</span></div>
    </div>
    <div class="stepper pill focus-ring"><span class="pm">+</span><span class="val num">16:22</span><span class="pm">−</span><span class="statelbl"></span></div>
    <div class="stepper pill" style="box-shadow:0 0 0 2px rgba(161,69,37,.4)"><span class="pm">+</span><span class="val num" style="color:var(--danger)">55</span><span class="pm">−</span></div>
    <p style="font-size:11px;color:var(--danger)">שגיאה: טבעת danger/40 + הודעה מתחת</p>
    <div class="stepper pill" style="opacity:.4"><span class="pm">+</span><span class="val num">25</span><span class="pm">−</span></div>
  </div>`);

cards["fields/text-input/index.html"] = page("שדות טקסט", "שדות", `
  <p class="cap">קלט חופשי = מלבן מעוגל 16 (מבדיל מפיל הבחירה) · dir=auto · תווית מעל, hint מתחת.</p>
  <div class="glass" style="display:flex;flex-direction:column;gap:14px">
    <div>
      <label style="font-size:13px;color:var(--ink-2);display:block;margin-bottom:6px">שם המתכון</label>
      <div style="background:rgba(255,255,255,.7);border-radius:16px;min-height:52px;display:flex;align-items:center;padding:0 16px;font-size:15px">כפרי קלאסי</div>
    </div>
    <div>
      <div style="background:rgba(255,255,255,.7);border-radius:16px;min-height:52px;display:flex;align-items:center;padding:0 16px;font-size:15px;color:var(--ink-3)">placeholder — ink-3</div>
    </div>
    <div>
      <div class="focus-ring" style="background:rgba(255,255,255,.7);border-radius:16px;min-height:52px;display:flex;align-items:center;padding:0 16px;font-size:15px">focus — טבעת ink/20</div>
    </div>
    <div>
      <div style="background:rgba(255,255,255,.7);border-radius:16px;min-height:52px;display:flex;align-items:center;padding:0 16px;font-size:15px;box-shadow:0 0 0 2px rgba(161,69,37,.4)">שגיאה</div>
      <p style="font-size:12px;color:var(--danger);margin-top:6px">שדה חובה</p>
    </div>
  </div>`);

cards["fields/slider/index.html"] = page("סליידר", "שדות", `
  <p class="cap">מסילה מלאה כהה, ידית עגולה. תוויות קצה mono שקטות. accent-color: charcoal.</p>
  <div class="glass">
    <p style="font-size:13px;color:var(--ink-2);margin-bottom:10px">כמה זמן במקרר? <span class="num" style="font-weight:600;color:var(--ink)">12 שעות</span></p>
    <div style="position:relative;height:24px;display:flex;align-items:center">
      <div style="position:absolute;inset-inline:0;height:4px;border-radius:2px;background:var(--line-2)"></div>
      <div style="position:absolute;inset-inline-start:0;width:35%;height:4px;border-radius:2px;background:var(--charcoal)"></div>
      <div style="position:absolute;inset-inline-start:35%;width:20px;height:20px;border-radius:999px;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.25);transform:translateX(50%)"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--ink-3);margin-top:6px"><span><span class="num">8</span> שעות</span><span><span class="num">48</span> שעות</span></div>
  </div>`);

/* ═══════════════ הרכבים ═══════════════ */

cards["composites/glass-rows/index.html"] = page("קבוצות ושורות", "הרכבים", `
  <p class="cap">קבוצת glass אחת, שורות מלאות ≥64px, divider ‏ink/6%. press שורה: ‏scale(.985) + ink/5%.</p>
  <div class="glass" style="padding:0;overflow:hidden">
    <div style="padding:14px 20px;display:flex;gap:12px;align-items:center">
      <span class="inset-tone" style="width:44px;height:44px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;flex:none">${svgWheat("#1F1A14")}</span>
      <span style="flex:1"><strong style="font-size:15px">כפרי קלאסי</strong><br><span style="font-size:12px;color:var(--ink-2)">לבן · הידרציה <span class="num">72%</span></span></span>
      <span style="background:rgba(31,26,20,.85);color:#fff;border-radius:999px;padding:4px 8px;font-size:11px;font-weight:500">שלי</span>
    </div>
    <div style="height:1px;background:rgba(31,26,20,.06)"></div>
    <div style="padding:14px 20px;display:flex;gap:12px;align-items:center;background:rgba(31,26,20,.05);transform:scale(.985)">
      <span class="inset-tone" style="width:44px;height:44px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center;flex:none">${svgWheat("#1F1A14")}</span>
      <span style="flex:1"><strong style="font-size:15px">שיפון 40%</strong><br><span style="font-size:12px;color:var(--ink-2)">שורה לחוצה</span></span>
    </div>
  </div>`);

cards["composites/preset-tiles/index.html"] = page("אריחי מתכון", "הרכבים", `
  <p class="cap">גריד 2 עמודות · צילום 4:3 · בלי clamp — טקסט נשבר חופשי והשורה משתווה מה־grid.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div class="glass" style="padding:0;overflow:hidden;border-radius:24px">
      <div style="aspect-ratio:4/3;background:linear-gradient(45deg,#C89B6D,#E8CBA0)"></div>
      <div style="padding:12px"><strong style="font-size:14px">כפרי קלאסי</strong><br><span style="font-size:12px;color:var(--ink-2)">לבן · <span class="num">72%</span></span></div>
    </div>
    <div class="glass" style="padding:0;overflow:hidden;border-radius:24px">
      <div class="inset-tone" style="aspect-ratio:4/3;display:flex;align-items:center;justify-content:center">${svgWheat("#A6997F")}</div>
      <div style="padding:12px"><strong style="font-size:14px">מחמצת מלאה</strong><br><span style="font-size:12px;color:var(--ink-2)">מלא · <span class="num">75%</span></span></div>
    </div>
  </div>`);

cards["composites/timeline/index.html"] = page("ציר זמן", "הרכבים", `
  <p class="cap">רגע ה־orange היחיד: ״הלחם מוכן״. עבר = דיו שקט + ✓; עתידי = עיגול ריק; לילה = מקווקו.</p>
  <div class="glass">
    <div style="display:flex;gap:12px">
      <div style="display:flex;flex-direction:column;align-items:center;width:16px">
        <span style="width:10px;height:10px;border-radius:999px;background:var(--ink-3);margin-top:4px"></span>
        <span style="flex:1;border-inline-start:2px solid var(--line-2);margin:4px 0"></span>
        <span style="width:10px;height:10px;border-radius:999px;background:#F8F5EE;border:2px solid var(--ink-3)"></span>
        <span style="flex:1;border-inline-start:2px dashed var(--line-2);margin:4px 0"></span>
        <span style="width:14px;height:14px;border-radius:999px;background:var(--accent);box-shadow:0 0 0 4px rgba(230,107,61,.15)"></span>
      </div>
      <div style="flex:1">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:14px;color:var(--ink-3)">✓ בניית שאור (levain)</span><span style="text-align:left"><span style="font-size:11px;color:var(--ink-3);display:block">היום</span><span class="num" style="font-size:14px;font-weight:600;color:var(--ink-3)">15:47</span></span></div>
        <p style="font-size:11px;color:var(--ink-3);margin-bottom:14px">בין <span class="num">7</span> ל־<span class="num">9</span> שעות · ריענון הסטארטר עד לשיא</p>
        <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:14px;font-weight:500">התפחה במקרר</span><span style="text-align:left"><span style="font-size:11px;color:var(--ink-3);display:block">מחר</span><span class="num" style="font-size:14px;font-weight:600">04:27</span></span></div>
        <p style="font-size:11px;color:var(--ink-3);margin-bottom:14px">🌙 כ־<span class="num">12</span> שעות</p>
        <div style="display:flex;justify-content:space-between"><span style="font-size:14px;font-weight:500;color:var(--accent)">✓ הלחם מוכן</span><span style="text-align:left"><span style="font-size:11px;color:var(--ink-3);display:block">מחר</span><span class="num" style="font-size:14px;font-weight:600;color:var(--accent)">18:29</span></span></div>
      </div>
    </div>
    <div class="inset-tone" style="border-radius:14px;padding:10px 12px;margin-top:14px;font-size:12px;color:var(--ink-2)">💡 מומלץ לצנן כ-שעה לפני חיתוך — חיתוך חם הורס את הפירור</div>
  </div>`);

cards["composites/tags/index.html"] = page("תגים ומונים", "הרכבים", `
  <p class="cap">תג ״שלי״ = ink/85 על פיל · מונה = מספר שקט ב־logical end · orange בתג רק כשהוא רגע חי.</p>
  <div class="glass">
    <div class="row" style="margin-bottom:14px">
      <span style="background:rgba(31,26,20,.85);color:#fff;border-radius:999px;padding:4px 10px;font-size:11px;font-weight:500">שלי</span>
      <span class="inset-tone" style="border-radius:999px;padding:4px 10px;font-size:11px;color:var(--ink-2)">ניטרלי</span>
      <span style="background:var(--warn-bg);color:var(--warn);border-radius:999px;padding:4px 10px;font-size:11px;font-weight:500">אזהרה</span>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:15px">המתכונים שלי</span>
      <span class="num" style="font-size:14px;color:var(--ink-3)">3</span>
    </div>
  </div>`);

/* ═══════════════ שכבות ═══════════════ */

cards["overlays/dialog/index.html"] = page("דיאלוג", "שכבות", `
  <p class="cap">scrim ‏ink/35 + blur · פאנל glass בהיר rounded 28 · פעולות בגריד אנכי · focus trap, ‏Escape/scrim סוגרים.</p>
  <div style="background:rgba(31,26,20,.35);border-radius:24px;padding:24px;backdrop-filter:blur(2px)">
    <div style="border-radius:28px;background:rgba(255,248,241,.97);padding:20px;box-shadow:0 16px 40px rgba(31,26,20,.2)">
      <h2>להחליף את הבייק הפעיל?</h2>
      <p style="font-size:13px;color:var(--ink-2);margin:6px 0 18px">הבייק ״כפרי קלאסי״ ייעצר ויימחק מהמעקב.</p>
      <div style="display:grid;gap:10px">
        <button class="btn" style="background:var(--warn);color:#fff;width:100%">החלף בייק</button>
        <button class="btn" style="background:transparent;color:var(--ink-2);width:100%">ביטול</button>
      </div>
    </div>
  </div>`);

cards["overlays/bottom-sheet/index.html"] = page("Bottom Sheet", "שכבות", `
  <p class="cap">שתי קומות: peek ‏56% / full ‏88% · ידית גרירה · ambient = קנבס מלא בפאנל · scrim תמיד סוגר.</p>
  <div style="background:rgba(31,26,20,.35);border-radius:24px;padding:24px 0 0;overflow:hidden">
    <div style="border-radius:36px 36px 0 0;border-top:1px solid rgba(255,255,255,.7);background:linear-gradient(160deg,#FFF8F1 0%,#FFDDBD 22%,#F7F0E7 55%,#DDEDF2 100%);padding:10px 20px 20px">
      <div style="width:40px;height:4px;border-radius:2px;background:var(--line-2);margin:0 auto 14px"></div>
      <h2>מבחן ציפה (float test)</h2>
      <p style="font-size:13px;color:var(--ink-2);margin-top:6px">כפית מהסטארטר לכוס מים — אם היא צפה, השאור בשיא והבצק מוכן לערבוב.</p>
    </div>
  </div>`);

cards["overlays/toast/index.html"] = page("Toast", "שכבות", `
  <p class="cap">charcoal מלא, פיל · מחליף-לא-נערם · ‏2.4s (פעולה: ‏5s) · שורה אחת ~30 תווים.</p>
  <div style="display:flex;justify-content:center">
    <div class="charcoal charcoal-shadow" style="border-radius:999px;padding:12px 20px;display:flex;align-items:center;gap:8px">
      <span style="font-size:14px">המתכון נשמר</span>
      <button style="background:rgba(255,255,255,.1);border:0;color:#fff;border-radius:999px;padding:6px 14px;font:inherit;font-size:13px">בטל</button>
    </div>
  </div>`);

cards["overlays/fab/index.html"] = page("FAB משוב", "שכבות", `
  <p class="cap">‏44px, ‏paper, צל רך · bottom+88 ב־logical start · המסכים שומרים לו מרווח גלילה תחתון.</p>
  <div style="display:flex;justify-content:flex-start">
    <button style="width:44px;height:44px;border-radius:999px;background:#fff;border:0;box-shadow:0 1px 0 rgba(31,26,20,.04),0 6px 24px rgba(31,26,20,.12);display:flex;align-items:center;justify-content:center">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6E6457" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </button>
  </div>`);

/* ═══════════════ מצבים ═══════════════ */

cards["states/loading/index.html"] = page("Loading", "מצבים", `
  <p class="cap">placeholders דוממים בגאומטריה הפתורה — בלי shimmer, בלי טקסט · aria-busy · החלפה אטומית אחת.</p>
  <div style="display:grid;gap:14px">
    <div class="glass" style="min-height:120px"></div>
    <div class="glass" style="min-height:72px"></div>
  </div>`);

cards["states/empty-error/index.html"] = page("ריק ואזהרה", "מצבים", `
  <p class="cap">ריק מבני — המדור פשוט נעדר, בלי קופי ריק. אזהרות: טקסט warn, בלי משטח חדש.</p>
  <div class="glass">
    <p style="font-size:13px;color:var(--warn)" role="alert">מוקדם מדי — הזמן הקרוב ביותר: <span class="num">18:30</span> יום רביעי</p>
    <p class="cap">הודעת סטטוס (התראה רכה)</p>
    <p style="font-size:13px;color:var(--warn)">ההתפחה נדחתה ל־<span class="num">19:15</span> · מחר</p>
  </div>`);

/* ═══════════════ עולם כהה ═══════════════ */

cards["dark/hero/index.html"] = page("hero כהה — ״עכשיו״", "עולם כהה", `
  <p class="cap">בהיר לתכנון, כהה לרגע הפעיל. מסכי שלב: הטיימר הרץ חי על charcoal.</p>
  <div class="charcoal charcoal-shadow" style="border-radius:32px;padding:24px;text-align:center">
    <p style="font-size:13px;color:rgba(255,255,255,.65);margin-bottom:6px">תסיסה ראשונית (״באלק״)</p>
    <p class="num" style="font-size:44px;font-weight:600;letter-spacing:1px">02:35:10</p>
    <p style="font-size:13px;color:rgba(255,255,255,.65);margin:6px 0 18px">קיפול הבא בעוד כ־<span class="num">25</span> דק׳</p>
    <div style="display:flex;gap:10px;justify-content:center">
      <button class="chip" style="background:rgba(255,255,255,.1);color:#fff">השהיה</button>
      <button class="chip" style="background:#fff;color:var(--charcoal)">סיימתי קיפול</button>
    </div>
  </div>`);

cards["dark/controls/index.html"] = page("בקרות על כהה", "עולם כהה", `
  <p class="cap">היפוך: נבחר על כהה = הבהרה (מילוי לבן) · inset = paper/10 · טקסט משני white/65.</p>
  <div class="charcoal charcoal-shadow" style="border-radius:32px;padding:20px">
    <p class="cap" style="color:rgba(255,255,255,.65)">בחירה על כהה</p>
    <div class="row" style="margin-bottom:14px">
      <button class="chip" style="background:#fff;color:var(--charcoal)">נבחר</button>
      <button class="chip" style="background:rgba(255,255,255,.1);color:#fff">רגיל</button>
      <button class="chip" style="background:rgba(255,255,255,.1);color:#fff;opacity:.4">disabled</button>
    </div>
    <p class="cap" style="color:rgba(255,255,255,.65)">התקדמות — הרגע החי היחיד orange</p>
    <div style="height:6px;border-radius:3px;background:rgba(255,255,255,.12);overflow:hidden">
      <div style="width:62%;height:100%;border-radius:3px;background:linear-gradient(90deg,#E66B3D,#F2BC8E)"></div>
    </div>
  </div>`);

/* ═══════════════ build ═══════════════ */

rmSync(OUT, { recursive: true, force: true });
for (const [path, html] of Object.entries(cards)) {
  const full = join(OUT, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html);
}
console.log(`built ${Object.keys(cards).length} cards → ${OUT}`);
