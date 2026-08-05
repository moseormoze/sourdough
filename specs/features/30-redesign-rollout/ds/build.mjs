// Generates the Claude Design (DesignSync) preview cards for the rollout
// language — self-contained RTL HTML per card, real app values only.
// Run: node specs/features/30-redesign-rollout/ds/build.mjs
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "dist");

const CSS = `
  * { margin:0; padding:0; box-sizing:border-box; }
  :root{
    --paper:#FFFFFF; --ink:#1F1A14; --ink-2:#6E6457; --ink-3:#A6997F;
    --line:#EDE5D2; --line-2:#DCD0B4; --accent:#E66B3D; --warn:#D38D1B;
    --charcoal:#292A28;
  }
  body{
    font-family:Rubik,-apple-system,"Segoe UI",sans-serif; color:var(--ink);
    background:linear-gradient(160deg,#FFF8F1 0%,#FFDDBD 22%,#F7F0E7 55%,#DDEDF2 100%);
    min-height:100vh; padding:20px; max-width:375px; margin:0 auto;
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
    font:inherit; font-weight:500; font-size:15px;
  }
  .btn{
    display:inline-flex; align-items:center; justify-content:center; gap:8px;
    border-radius:999px; min-height:52px; padding:0 24px; border:0;
    font:inherit; font-weight:500; font-size:17px;
  }
  h2{ font-size:17px; font-weight:700; margin-bottom:4px; }
  .cap{ font-size:12px; color:var(--ink-3); margin:14px 0 8px; }
  .row{ display:flex; gap:8px; flex-wrap:wrap; align-items:center; }
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

const cards = {
  "foundations/surfaces/index.html": page("קומות המשטח", "יסודות", `
    <p class="cap">קנבס ← glass ← inset חלבי ← inset טון ← charcoal. היררכיה דרך משטח, לא צבע.</p>
    <div class="glass">
      <h2>כרטיס glass</h2>
      <p style="font-size:13px;color:var(--ink-2);margin-bottom:14px">גבול לבן עדין, blur, צל חום רך — לעולם לא כרטיס בתוך כרטיס</p>
      <div class="pill" style="border-radius:999px;padding:12px 16px;font-size:14px;margin-bottom:10px">inset חלבי — rgba(255,255,255,.7) — בקרות ושדות</div>
      <div class="inset-tone" style="border-radius:14px;padding:12px 16px;font-size:14px;margin-bottom:10px">inset טון — ink 4% — טיפים ומצב נבחר של radio</div>
      <div class="charcoal charcoal-shadow" style="border-radius:20px;padding:14px 16px;font-size:14px">charcoal #292A28 + sheen — הפעולה הראשית, נבחר, ו־hero של ״עכשיו״</div>
    </div>`),

  "foundations/numbers/index.html": page("מספרים כגיבורים", "יסודות", `
    <p class="cap">הערך בולט, התווית שקטה. הדרמה ממשקל — לא מצבע.</p>
    <div class="glass">
      <p style="font-size:13px;color:var(--ink-2);margin-bottom:6px">מתי מתחילים?</p>
      <div class="pill" style="display:flex;align-items:center;border-radius:999px;min-height:52px">
        <span style="min-width:52px;text-align:center;font-size:20px;color:var(--ink-2)">+</span>
        <span class="num" style="flex:1;text-align:center;font-size:18px;font-weight:600;color:var(--ink)">16:22</span>
        <span style="min-width:52px;text-align:center;font-size:20px;color:var(--ink-2)">−</span>
      </div>
      <p class="cap">בציר הזמן: שעה mono מודגשת, תיאור שקט</p>
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <span style="font-size:15px;font-weight:500">עיצוב הבצק</span>
        <span style="text-align:left"><span style="font-size:12px;color:var(--ink-3);display:block">מחר</span><span class="num" style="font-size:15px;font-weight:600">03:52</span></span>
      </div>
    </div>`),

  "foundations/icons/index.html": page("אריחי אייקון", "יסודות", `
    <p class="cap">אייקון קו בתוך אריח מעוגל. על בהיר: טון + דיו. על כהה: paper/10 + לבן. לא כתום.</p>
    <div class="glass">
      <div class="row" style="margin-bottom:16px">
        <span class="inset-tone" style="width:44px;height:44px;border-radius:16px;display:inline-flex;align-items:center;justify-content:center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1F1A14" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
        </span>
        <span style="font-size:14px;color:var(--ink-2)">אריח 44px · אייקון 24px · שורות</span>
      </div>
      <div class="charcoal" style="border-radius:20px;padding:14px;display:flex;gap:12px;align-items:center">
        <span style="width:44px;height:44px;border-radius:16px;background:rgba(255,255,255,.1);display:inline-flex;align-items:center;justify-content:center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
        </span>
        <span style="font-size:14px">על משטח כהה</span>
      </div>
    </div>`),

  "buttons/index.html": page("כפתורים", "כפתורים", `
    <p class="cap">ראשי אחד למסך. orange לעולם לא משטח.</p>
    <div class="glass" style="display:flex;flex-direction:column;gap:12px">
      <button class="btn charcoal charcoal-shadow" style="width:100%">ראשי — התחל בייק</button>
      <button class="btn" style="width:100%;background:#fff;color:var(--ink)">משני — paper</button>
      <button class="btn" style="width:100%;background:transparent;color:var(--ink-2)">ghost — חזרה</button>
      <button class="btn" style="width:100%;background:var(--warn);color:#fff">warn — דיאלוגים בלבד</button>
      <button class="btn charcoal" style="width:100%;opacity:.4">disabled — opacity 40%</button>
    </div>`),

  "selection/chips/index.html": page("צ'יפים — היפוך טונאלי", "בחירה", `
    <p class="cap">נבחר = charcoal מלא + sheen. לא נבחר = פיל חלבי. אפס מסגרות צבע.</p>
    <div class="glass">
      <p style="font-size:13px;color:var(--ink-3);margin-bottom:8px">התחל מתבנית</p>
      <div class="row">
        <button class="chip pill">מהיר</button>
        <button class="chip charcoal">קלאסי</button>
        <button class="chip pill">קלאסי מאוחר</button>
        <button class="chip pill">ארוך</button>
      </div>
      <p class="cap">press: ‏scale(.965) ‏120ms ease-out</p>
      <div class="row"><button class="chip pill" style="transform:scale(.965)">לחוץ</button></div>
    </div>`),

  "selection/toggle-pills/index.html": page("טוגלים ופילים", "בחירה", `
    <p class="cap">אותו דקדוק בכל בקרת בחירה — טוגל כיוון, ימים, יחס האכלה.</p>
    <div class="glass">
      <div class="row" style="margin-bottom:16px">
        <button class="chip charcoal" style="flex:1">מתי להתחיל</button>
        <button class="chip pill" style="flex:1">מתי לסיים</button>
      </div>
      <div class="row" style="margin-bottom:16px">
        <button class="chip charcoal">היום</button>
        <button class="chip pill">מחר</button>
        <button class="chip pill">מחרתיים</button>
      </div>
      <div class="row">
        <button class="chip pill num" style="flex:1;font-size:13px">1:1:1</button>
        <button class="chip charcoal num" style="flex:1;font-size:13px">1:2:2</button>
        <button class="chip pill num" style="flex:1;font-size:13px">1:3:3</button>
      </div>
    </div>`),

  "selection/radio-cards/index.html": page("כרטיסי radio", "בחירה", `
    <p class="cap">radio עשיר: נבחר = טון + עיגול charcoal מלא. לא נבחר = חלבי + עיגול ריק.</p>
    <div class="glass" style="display:flex;flex-direction:column;gap:10px">
      <div class="inset-tone" style="border-radius:16px;padding:16px;display:flex;gap:12px">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#292A28" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4" fill="#292A28" stroke="none"/></svg>
        <span><strong style="font-size:15px">סיר/כלי סגור</strong><br><span style="font-size:13px;color:var(--ink-2)">סיר ברזל יצוק, סיר נירוסטה עם מכסה</span></span>
      </div>
      <div class="pill" style="border-radius:16px;padding:16px;display:flex;gap:12px">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DCD0B4" stroke-width="2"><circle cx="12" cy="12" r="9"/></svg>
        <span><strong style="font-size:15px;color:var(--ink)">אפייה פתוחה + תבנית אדים</strong><br><span style="font-size:13px;color:var(--ink-2)">תבנית/אבן/פלדה ללא מכסה</span></span>
      </div>
    </div>`),

  "fields/steppers/index.html": page("סטפרים ושדות", "שדות", `
    <p class="cap">פיל חלבי בלי גבול. ערך mono ‏18px ממורכז. ‏± בקצוות, 44px.</p>
    <div class="glass">
      <p style="font-size:13px;color:var(--ink-2);margin-bottom:8px">מהי טמפרטורת החדר?</p>
      <div class="pill" style="display:flex;align-items:center;border-radius:999px;min-height:52px;margin-bottom:16px">
        <span style="min-width:52px;text-align:center;font-size:20px;color:var(--ink-2)">+</span>
        <span style="font-size:14px;color:var(--ink-3)" class="num">°C</span>
        <span class="num" style="flex:1;text-align:center;font-size:18px;font-weight:600;color:var(--ink)">25</span>
        <span style="min-width:52px;text-align:center;font-size:20px;color:var(--ink-2)">−</span>
      </div>
      <p style="font-size:13px;color:var(--ink-2);margin-bottom:8px">focus: טבעת ink/20 — לא כתומה</p>
      <div class="pill" style="display:flex;align-items:center;border-radius:999px;min-height:52px;box-shadow:0 0 0 2px rgba(31,26,20,.2)">
        <span style="min-width:52px;text-align:center;font-size:20px;color:var(--ink-2)">+</span>
        <span class="num" style="flex:1;text-align:center;font-size:18px;font-weight:600;color:var(--ink)">16:22</span>
        <span style="min-width:52px;text-align:center;font-size:20px;color:var(--ink-2)">−</span>
      </div>
    </div>`),

  "timeline/index.html": page("ציר זמן — רגע חי אחד", "ציר זמן", `
    <p class="cap">ה־orange היחיד במסך: צומת ״הלחם מוכן״. כל השאר דיו וקו.</p>
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
          <div style="display:flex;justify-content:space-between;margin-bottom:22px"><span style="font-size:15px;color:var(--ink-3)">✓ בניית שאור</span><span class="num" style="font-size:15px;font-weight:600;color:var(--ink-3)">15:47</span></div>
          <div style="display:flex;justify-content:space-between;margin-bottom:22px"><span style="font-size:15px;font-weight:500">התפחה במקרר</span><span class="num" style="font-size:15px;font-weight:600">04:27</span></div>
          <div style="display:flex;justify-content:space-between"><span style="font-size:15px;font-weight:500;color:var(--accent)">✓ הלחם מוכן</span><span class="num" style="font-size:15px;font-weight:600;color:var(--accent)">18:29</span></div>
        </div>
      </div>
      <div class="inset-tone" style="border-radius:14px;padding:10px 12px;margin-top:14px;font-size:12px;color:var(--ink-2)">💡 מומלץ לצנן כ-שעה לפני חיתוך — חיתוך חם הורס את הפירור</div>
    </div>`),

  "future/charcoal-hero/index.html": page("hero כהה — ״עכשיו״ (עתידי)", "עתיד", `
    <p class="cap">מסכי השלב: הרגע הפעיל חי על משטח כהה. בקרות בהירות בתוכו — paper/10.</p>
    <div class="charcoal charcoal-shadow" style="border-radius:32px;padding:24px;text-align:center">
      <p style="font-size:13px;color:rgba(255,255,255,.65);margin-bottom:6px">תסיסה ראשונית (״באלק״)</p>
      <p class="num" style="font-size:44px;font-weight:600;letter-spacing:1px">02:35:10</p>
      <p style="font-size:13px;color:rgba(255,255,255,.65);margin:6px 0 18px">קיפול הבא בעוד כ־25 דק׳</p>
      <div style="display:flex;gap:10px;justify-content:center">
        <button class="chip" style="background:rgba(255,255,255,.1);color:#fff">השהיה</button>
        <button class="chip" style="background:#fff;color:var(--charcoal)">סיימתי קיפול</button>
      </div>
    </div>`),
};

for (const [path, html] of Object.entries(cards)) {
  const full = join(OUT, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, html);
}
console.log(`built ${Object.keys(cards).length} cards → ${OUT}`);
