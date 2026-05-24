// Kikar DS — Molecules (Photo, Expand, Briefing, Video, Questions, Toast)

/* ─── Photo card ─────────────────────────────────────────────── */
function PhotoCard() {
  return (
    <div className="ds-card">
      <h3>Photo</h3>
      <p className="ds-blurb">Photographs are first-class. Every photo is a typed slot — duotone placeholders in the design, swapped for real photography at handoff. Optional tag (top-start) + caption (bottom-start).</p>

      <div className="ds-annot" style={{ marginBlockEnd: 10 }}>Tones (duotones — placeholders for real photos)</div>
      <div className="ds-grid-4">
        {['dough','bowl','fold','shaped','banneton','baked','crumb','jar'].map(t=>(
          <div key={t} className="ds-cell" style={{ width:'100%' }}>
            <div style={{ width:'100%', borderRadius:14, overflow:'hidden' }}>
              <window.Photo tone={t} aspect="4/3"/>
            </div>
            <div className="ds-annot">photo-{t}</div>
          </div>
        ))}
      </div>

      <div className="ds-annot" style={{ marginBlock:'24px 10px' }}>With tag + caption</div>
      <div className="ds-grid-3">
        <div style={{ width:'100%', borderRadius:14, overflow:'hidden' }}>
          <window.Photo tone="bowl" tag="אחרי קיפול 2" caption="חלק, גמיש, תופח על עצמו" aspect="4/3"/>
        </div>
        <div style={{ width:'100%', borderRadius:14, overflow:'hidden' }}>
          <window.Photo tone="baked" tag="מוכן" caption="קרום כהה, צלילי הקשה חלולים" aspect="4/3"/>
        </div>
        <div style={{ width:'100%', borderRadius:14, overflow:'hidden' }}>
          <window.Photo tone="jar" caption="הסטארטר בשיא — לפני שיורד" aspect="4/3"/>
        </div>
      </div>

      <div className="ds-note">
        <strong>Aspect ratios:</strong> use <code>4/3</code> for stage hero, <code>16/10</code> for above-the-fold, <code>1/1</code> for gallery thumbs. Cards behind photos use <code>radius: 24</code>.<br/>
        <strong>Tag (top-start):</strong> short ALL-CAPS label.  <strong>Caption (bottom-start):</strong> one sentence, plain case.
      </div>
    </div>
  );
}

/* ─── Reference gallery ──────────────────────────────────────── */
function GalleryCard() {
  return (
    <div className="ds-card">
      <h3>Reference gallery</h3>
      <p className="ds-blurb">Horizontal scroll of comparison thumbnails. Two modes — <strong>strict-positive</strong> (default, what to look for) or <strong>comparative</strong> (good/bad, more educational).</p>

      <div className="ds-annot" style={{ marginBlockEnd: 8 }}>Mode: strict-positive (default)</div>
      <div style={{ background:'#F8F5EE', borderRadius:14, paddingBlock: 12, marginInline: -10 }}>
        <window.RefGallery items={[
          { tone:'bowl', text:'תפיחה אחידה' },
          { tone:'dough', text:'בועות קטנות' },
          { tone:'shaped', text:'מתח אחיד' },
          { tone:'crumb', text:'פירור פתוח' },
        ]}/>
      </div>

      <div className="ds-annot" style={{ marginBlock:'18px 8px' }}>Mode: comparative</div>
      <div style={{ background:'#F8F5EE', borderRadius:14, paddingBlock: 12, marginInline: -10 }}>
        <window.RefGallery items={[
          { tone:'bowl', label:'טוב', kind:'good', text:'תפיחה אחידה' },
          { tone:'dough', label:'טוב', kind:'good', text:'בועות קטנות' },
          { tone:'fold', label:'לא טוב', kind:'bad', text:'שטוח · עוד זמן' },
          { tone:'shaped', label:'תפח יתר', kind:'bad', text:'נופל לעצמו' },
        ]}/>
      </div>

      <div className="ds-note">
        <strong>When to use which:</strong> strict-positive when one image describes the goal well (e.g. ‘ready starter’). Comparative when failure modes are common and easy to confuse with success (e.g. ‘over-proofed dough’).
      </div>
    </div>
  );
}

/* ─── Expand ─────────────────────────────────────────────────── */
function ExpandCard() {
  return (
    <div className="ds-card">
      <h3>Expand · ״למה?״</h3>
      <p className="ds-blurb">Collapsed by default. The chevron rotates and the surface tints on open. Two tones: <strong>accent</strong> (explainer/reasoning) and <strong>question</strong> (FAQ-style).</p>

      <div className="ds-annot" style={{ marginBlockEnd: 10 }}>States</div>
      <div style={{ display:'flex', flexDirection:'column', gap:10, maxWidth: 460 }}>
        <window.Expand title="למה מקפלים ולא לשים?" tone="accent" defaultOpen={false}>
          לישה אגרסיבית קורעת את הגלוטן. הקיפול מארגן את הסיבים בלי לשבור — פירור פתוח במקום צפוף.
        </window.Expand>
        <window.Expand title="איך לדעת שתסיסה הסתיימה?" tone="question" defaultOpen={true}>
          תפיחה של 50–70%, בועות על פני השטח, מבנה כיפתי. לא להכפיל — זה שלב אחר.
        </window.Expand>
      </div>

      <div className="ds-note">
        <strong>Composition rule:</strong> ≤ 3 Expands per screen, otherwise the user is just scanning headlines without reading. Move overflow to the Questions module.
      </div>
    </div>
  );
}

/* ─── Briefing ───────────────────────────────────────────────── */
function BriefingCard() {
  return (
    <div className="ds-card">
      <h3>Briefing card</h3>
      <p className="ds-blurb">Peach-gradient card placed at the top of every stage. One-line ‘why this stage matters’ + 2–3 takeaway bullets. Sets context before instructions.</p>

      <div style={{ maxWidth: 480 }}>
        <window.Briefing
          heading="זה השלב שבו הלחם מקבל את האופי שלו"
          blurb="התסיסה הראשונית בונה את שני הדברים שמשנים לחם רגיל למחמצת: מבנה גלוטן, וטעם החמיצות."
          takeaways={[
            "הקיפולים בונים חוזק בלי לישה אגרסיבית",
            "החום במטבח מאיץ או מאט את התסיסה",
            "לא הזמן קובע, אלא איך הבצק נראה ומרגיש",
          ]}/>
      </div>
    </div>
  );
}

/* ─── Video card ─────────────────────────────────────────────── */
function VideoMolecule() {
  return (
    <div className="ds-card">
      <h3>Video card</h3>
      <p className="ds-blurb">Photo thumbnail + play overlay + duration. Below: title, source, optional <strong>chapter timeline</strong> (chips) for navigating long clips.</p>

      <div style={{ maxWidth: 480 }}>
        <window.VideoCard tone="fold" title="קיפול בצק חמצמץ · 4 וריאציות" source="The Sourdough Journey"
          duration="3:42"
          chapters={[
            { t:'0:00', label:'הקיפול הבסיסי' },
            { t:'0:48', label:'קיפול מעטפה', current:true },
            { t:'1:35', label:'קיפול עצמי' },
            { t:'2:30', label:'מתי להפסיק' },
          ]}/>
      </div>

      <div className="ds-note">
        <strong>Source attribution required:</strong> show channel / publisher name. We embed external content; respect provenance.<br/>
        <strong>Chapters:</strong> highlight the current chapter with accent fill — chip becomes a navigation control. Up to 6 chapters; if more, collapse into a sheet.
      </div>
    </div>
  );
}

/* ─── Questions module ──────────────────────────────────────── */
function QuestionsMolecule() {
  return (
    <div className="ds-card">
      <h3>Questions module</h3>
      <p className="ds-blurb">At the bottom of every stage. Lists 3–5 stage-specific FAQs. Each row is a tappable trigger → bottom sheet opens with the rich answer.</p>

      <div style={{ maxWidth: 480 }}>
        <window.Questions items={[
          { q: 'מה אם פספסתי קיפול ב-30 דקות?', tone:'icn-warn' },
          { q: 'הבצק שלי לא תופח. מה לעשות?', tone:'icn-warn' },
          { q: 'איך לדעת אם המטבח שלי חם מדי?' },
          { q: 'מותר לעצור באמצע ולחזור?' },
        ]}/>
      </div>

      <div className="ds-note">
        <strong>Icon tone:</strong> use <code>icn-warn</code> (amber) for questions that signal something could be wrong; default accent otherwise. Don't use <code>icn-sage</code> — green here would read as ‘good question’ which is patronizing.<br/>
        <strong>Count chip:</strong> shows in the header. Drop it if there are ≤ 2 questions — feels overengineered.
      </div>
    </div>
  );
}

/* ─── Toast ──────────────────────────────────────────────────── */
function ToastCard() {
  return (
    <div className="ds-card">
      <h3>Toast</h3>
      <p className="ds-blurb">Bottom inset. Slides up, holds 2.4s, slides down. <strong>Replace-don't-stack</strong> — a new toast cancels the previous one mid-display.</p>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap', direction:'rtl' }}>
        <div className="toast" style={{ position:'static' }}>
          <window.I.Check size={16}/> <span>המתכון נשמר כפריסט</span>
        </div>
        <div className="toast" style={{ position:'static', background:'#E66B3D' }}>
          <window.I.Bell size={16}/> <span>תזכורת נקבעה לעוד <span className="num">20</span> דקות</span>
        </div>
        <div className="toast" style={{ position:'static', background:'#fff', color:'#1F1A14', border:'1px solid #EDE5D2', boxShadow:'0 6px 20px rgba(0,0,0,.08)' }}>
          <span style={{ display:'inline-block', width:18, height:18, borderRadius:'50%', background:'#ECEFDC', color:'#5C6E36', textAlign:'center', lineHeight:'18px', fontSize:11, fontWeight:700 }}>i</span>
          <span>זוהי תזכורת בלבד</span>
        </div>
      </div>

      <div className="ds-note">
        <strong>Action toasts:</strong> may include an inline button (e.g. ‘ביטול’) — extends hold to 5s. Otherwise no actions; the toast is purely confirmation.
      </div>
    </div>
  );
}

Object.assign(window, { PhotoCard, GalleryCard, ExpandCard, BriefingCard, VideoMolecule, QuestionsMolecule, ToastCard });
