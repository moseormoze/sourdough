// Kikar Soft — Stage screens (observation + timer) + Bottom Sheet showcase + Cheat sheet
const {
  Phone: PhoneSB, I: IconSB, Term: TermSB, Expand: ExpandSB, Photo: PhotoSB,
  RefGallery: RefGallerySB, VideoCard: VideoCardSB, Questions: QuestionsSB,
  BottomSheet: BottomSheetSB, Briefing: BriefingSB, ExpertTip: ExpertTipSB,
  SectionHead: SectionHeadSB,
} = window;

/* ─── Stage 4 · Bulk fermentation · FLAGSHIP ─────────────────── */
function StageBulk() {
  const [checks, setChecks] = useState({a:true,b:false,c:false});
  return (
    <PhoneSB height={2300} label="05 שלב 04 · תסיסה ראשונית">
      <div className="s-topbar">
        <button className="iconbtn"><IconSB.ChevronEnd/></button>
        <div className="ctx">
          <span className="num" style={{ fontWeight:700 }}>04</span>
          <span style={{ color:'var(--ink-3)' }}> / </span>
          <span className="num">12</span>
          <span style={{ color:'var(--ink-3)', marginInlineStart:6 }}>· תסיסה</span>
        </div>
        <button className="iconbtn"><IconSB.Menu/></button>
      </div>

      {/* Progress strip */}
      <div style={{ padding:'16px 20px 0' }}>
        <div className="progress-strip">
          {Array.from({length:12}).map((_,i)=>(
            <i key={i} className={i<3 ? 'done' : i===3 ? 'cur' : ''}/>
          ))}
        </div>
      </div>

      {/* Title */}
      <div style={{ padding:'20px 24px 0' }}>
        <span className="pill">~ <span className="num">4</span> שעות · קיפולים <span className="num">×4</span></span>
        <div className="display" style={{ fontSize: 32, lineHeight: 1.05, marginBlockStart: 12 }}>
          תסיסה ראשונית.
        </div>
        <div style={{ fontSize: 14, color:'var(--ink-2)', marginBlockStart:8, lineHeight: 1.55 }}>
          הבצק מתחיל לחיות. כל <span className="num">30</span> דקות מבצעים <TermSB title="קיפול" body="טכניקת בניית גלוטן בלי לישה">קיפול</TermSB>, ומחכים שהבצק יתפח ב-<span className="num">50–70%</span>.
        </div>
      </div>

      {/* Briefing card */}
      <div style={{ padding:'20px 16px 0' }}>
        <BriefingSB
          heading="זה השלב שבו הלחם מקבל את האופי שלו"
          blurb="התסיסה הראשונית בונה את שני הדברים שמשנים לחם רגיל ללחם מחמצת: מבנה הגלוטן (מה שמחזיק את הצורה) וטעם החמיצות (מה שמשמר אותו ימים)."
          takeaways={[
            "הקיפולים בונים חוזק בלי לישה אגרסיבית",
            "החום במטבח מאיץ או מאט את התסיסה",
            "לא הזמן קובע, אלא איך הבצק נראה ומרגיש",
          ]}/>
      </div>

      {/* Fold ladder */}
      <div style={{ padding:'24px 24px 0' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBlockEnd: 14, fontSize:12, color:'var(--ink-3)' }}>
          <span style={{ font:'600 13px Rubik', color:'var(--ink-2)' }}>קיפולים (stretch &amp; fold)</span>
          <span><span className="num">2</span> / <span className="num">4</span> · הבא בעוד <span className="num">22</span> ד׳</span>
        </div>
        <div className="fold-dots">
          <div className="dot done"><IconSB.Check size={12}/></div>
          <div className="line done"/>
          <div className="dot cur">2</div>
          <div className="line"/>
          <div className="dot">3</div>
          <div className="line"/>
          <div className="dot">4</div>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBlockStart: 10, fontSize: 10, color:'var(--ink-3)', fontFamily:'Rubik' }}>
          <span className="num">20:30</span>
          <span className="num">21:00</span>
          <span className="num">21:30</span>
          <span className="num">22:00</span>
        </div>
      </div>

      {/* Hero photo — what to look for NOW */}
      <div style={{ padding:'24px 16px 0' }}>
        <SectionHeadSB action={<button style={{ background:'transparent', border:0, color:'var(--accent)', font:'600 12px Rubik', cursor:'pointer' }}>כל ה-<span className="num">8</span> תמונות</button>}>איך הבצק שלי אמור להיראות עכשיו</SectionHeadSB>
        <div className="card" style={{ overflow:'hidden' }}>
          <PhotoSB tone="bowl" tag="אחרי קיפול 2"
            caption="חלק יותר. תופח על עצמו. ידיים רטובות לא נדבקות חזק."
            aspect="4/3"/>
        </div>
      </div>

      {/* Reference gallery — strict positive */}
      <div style={{ padding:'18px 0 0' }}>
        <SectionHeadSB action={<span style={{ fontSize:11, color:'var(--ink-3)' }}>← החליקו</span>}>איך זה צריך להיראות</SectionHeadSB>
        <RefGallerySB items={[
          { tone:'bowl',   text:'תופח, גמיש, שומר צורה' },
          { tone:'dough',  text:'בועות קטנות על השטח' },
          { tone:'fold',   text:'חלק וכיפתי, לא שטוח' },
          { tone:'shaped', text:'מתח אחיד בכל ההיקף' },
        ]}/>
      </div>

      {/* What to do */}
      <div style={{ padding:'24px 16px 0' }}>
        <div className="card" style={{ padding: 18 }}>
          <div className="eyebrow" style={{ color:'var(--ink-3)' }}>מה לעשות עכשיו</div>
          <div style={{ font:'600 18px Rubik', lineHeight:1.4, marginBlockStart: 8 }}>
            רטוב את הידיים. תפסו את ראש הבצק, משכו מעלה, וקפלו פנימה. סובבו רבע סיבוב וחזרו <span className="num">3</span> פעמים.
          </div>

          <div style={{ marginBlockStart: 14, padding:'14px 16px', background:'var(--bg-2)', borderRadius:14, fontSize:13, color:'var(--ink-2)', lineHeight:1.5 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBlockEnd:6 }}>
              <span style={{ width:24, height:24, borderRadius:8, background:'var(--accent-bg)', color:'var(--accent)', display:'grid', placeItems:'center' }}>
                <IconSB.Lightbulb size={14}/>
              </span>
              <span style={{ font:'600 12px Rubik', letterSpacing:'.04em', textTransform:'uppercase', color:'var(--ink-2)' }}>טיפ קצר</span>
            </div>
            ידיים רטובות זה הסוד. אם הן יבשות, הבצק יידבק והכל יתפרק. הטבילו בקערה קטנה ליד.
          </div>
        </div>

        <div style={{ marginBlockStart: 10 }}>
          <ExpandSB title="למה אנחנו מקפלים ולא לשים?" tone="accent" defaultOpen={false}>
            לישה אגרסיבית קורעת את ה<TermSB>גלוטן</TermSB> שכבר התחיל להיווצר באוטוליזה. קיפול עדין מארגן את הסיבים בלי לשבור אותם — והתוצאה: פירור פתוח ואוורירי במקום צפוף ולעיס.<br/><br/>
            בכל קיפול אתם בעצם <strong>מקפלים את כל הבצק על עצמו פעמיים</strong>. <span className="num">3-4</span> קיפולים בשעתיים הראשונות זה המתכון הקלאסי.
          </ExpandSB>
        </div>
        <div style={{ marginBlockStart: 8 }}>
          <ExpandSB title="איך לדעת שתסיסה ראשונית הסתיימה?" tone="question" defaultOpen={false}>
            סימן שיא: הבצק תפח ב-<span className="num">50-70%</span> (לא להכפיל!), פני השטח מלאי בועות, יש לו מבנה כיפתי קל ולא שטוח. אם תעצרו מוקדם מדי — הלחם יהיה צפוף. אם תחכו יותר מדי — יהיה שטוח וחמוץ מדי.
          </ExpandSB>
        </div>
      </div>

      {/* Embedded video */}
      <div style={{ padding:'18px 16px 0' }}>
        <SectionHeadSB>צפו בטכניקה</SectionHeadSB>
        <VideoCardSB
          tone="fold"
          title="קיפול בצק חמצמץ · 4 וריאציות"
          source="The Sourdough Journey"
          duration="3:42"
          chapters={[
            { t:'0:00', label:'הקיפול הבסיסי' },
            { t:'0:48', label:'קיפול מעטפה', current:true },
            { t:'1:35', label:'קיפול עצמי' },
            { t:'2:30', label:'מתי להפסיק' },
          ]}/>
      </div>

      {/* Common questions */}
      <div style={{ padding:'18px 16px 0' }}>
        <QuestionsSB
          heading="שאלות נפוצות בשלב הזה"
          items={[
            { q: 'מה אם פספסתי קיפול ב-30 דקות?', icon:'?', tone:'icn-warn' },
            { q: 'הבצק שלי לא תופח. מה לעשות?', icon:'?', tone:'icn-warn' },
            { q: 'איך לדעת אם המטבח שלי חם מדי או קר מדי?' },
            { q: 'מותר לעצור באמצע ולחזור אחר כך?' },
            { q: 'הבצק נדבק לידיים שלי. עזרה.' },
          ]}/>
      </div>

      {/* Checklist */}
      <div style={{ padding:'24px 16px 0' }}>
        <SectionHeadSB>עשיתי טוב?</SectionHeadSB>
        <div style={{ display:'flex', flexDirection:'column', gap:8, paddingInline:4 }}>
          {[
            { k:'a', t:'הבצק תפח בכ-60%' },
            { k:'b', t:'רואים בועות על פני השטח' },
            { k:'c', t:'מרגיש קליל וגמיש למגע' },
          ].map(it=>(
            <button key={it.k} className={`check-tile ${checks[it.k] ? 'is-checked' : ''}`}
              onClick={()=>setChecks(c=>({...c, [it.k]: !c[it.k]}))}>
              <div className="box">{checks[it.k] && <IconSB.Check/>}</div>
              <div style={{ flex:1, fontSize:15, fontWeight:500 }}>{it.t}</div>
            </button>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div style={{ padding:'24px 16px 16px' }}>
        <button className="btn btn-accent">
          <span>סיימתי קיפול 02</span>
          <IconSB.ArrowEnd size={20}/>
        </button>
        <div style={{ display:'flex', gap: 8, marginBlockStart: 8 }}>
          <button className="btn btn-soft btn-sm" style={{ flex:1 }}>
            <IconSB.Bell size={14}/> תזכורת בעוד <span className="num">5</span> ד׳
          </button>
          <button className="btn btn-ghost btn-sm" style={{ flex:1 }}>
            הצץ בשלב הבא
          </button>
        </div>
      </div>
    </PhoneSB>
  );
}

/* ─── Stage 7 · Cold retard · TIMER ──────────────────────────── */
function StageTimerCold() {
  const r = 92; const c = 2*Math.PI*r; const pct = 0.62;
  return (
    <PhoneSB height={1620} label="05 שלב 07 · התפחה במקרר">
      <div className="s-topbar">
        <button className="iconbtn"><IconSB.ChevronEnd/></button>
        <div className="ctx">
          <span className="num" style={{ fontWeight:700 }}>07</span>
          <span style={{ color:'var(--ink-3)' }}> / </span>
          <span className="num">12</span>
          <span style={{ color:'var(--ink-3)', marginInlineStart:6 }}>· התפחה</span>
        </div>
        <button className="iconbtn"><IconSB.Menu/></button>
      </div>

      <div style={{ padding:'16px 20px 0' }}>
        <div className="progress-strip">
          {Array.from({length:12}).map((_,i)=>(<i key={i} className={i<6 ? 'done' : i===6 ? 'cur' : ''}/>))}
        </div>
      </div>

      <div style={{ padding:'20px 24px 0' }}>
        <span className="pill"><IconSB.Clock size={12}/> טיימר · <span className="num">12</span> שעות</span>
        <div className="display" style={{ fontSize: 32, lineHeight: 1.05, marginBlockStart: 12 }}>
          התפחה במקרר.
        </div>
        <div style={{ fontSize:14, color:'var(--ink-2)', marginBlockStart: 8, lineHeight:1.55 }}>
          הבצק נח במקרר. ה<TermSB>התפחה</TermSB> הקרה מפתחת טעם ומאפשרת לכם לאפות מחר בנוחות.
        </div>
      </div>

      {/* Timer */}
      <div style={{ padding:'24px 20px 0', display:'grid', placeItems:'center' }}>
        <div className="timer-ring" style={{ width:220, height:220 }}>
          <svg width="220" height="220" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r={r} stroke="var(--line)" strokeWidth="7" fill="none"/>
            <defs>
              <linearGradient id="ringg" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0" stopColor="#F2BC8E"/>
                <stop offset="1" stopColor="#E66B3D"/>
              </linearGradient>
            </defs>
            <circle cx="110" cy="110" r={r} stroke="url(#ringg)" strokeWidth="7" fill="none"
              strokeDasharray={c} strokeDashoffset={c*(1-pct)} strokeLinecap="round"/>
          </svg>
          <div className="lbl">
            <div className="display num" style={{ fontSize: 52, lineHeight:1 }}>7:24</div>
            <div className="eyebrow" style={{ marginBlockStart: 6 }}>שעות:דקות נותרו</div>
          </div>
        </div>
        <div style={{ marginBlockStart: 14, display:'flex', gap:8, alignItems:'center', fontSize:12, color:'var(--ink-3)' }} className="num">
          <span>התחיל 22:30</span><span style={{ color:'var(--line-2)' }}>·</span><span>צפי 10:30</span>
        </div>
      </div>

      {/* Hero photo */}
      <div style={{ padding:'24px 16px 0' }}>
        <div className="card" style={{ overflow:'hidden' }}>
          <PhotoSB tone="banneton" tag="במקרר" caption="הבצק עטוף בסלסלה ומחכה. אין מה לעשות עכשיו." aspect="4/3"/>
        </div>
      </div>

      <div style={{ padding:'18px 16px 0' }}>
        <BriefingSB
          heading="זה זמן השינה של הבצק"
          blurb="הקור עוצר את התסיסה כמעט לחלוטין, אבל החיידקים ממשיכים לעבוד אט-אט. התוצאה: טעם עמוק יותר, קליפה פריכה יותר, ולחם שאפשר לפרוס יותר יפה."
          takeaways={[
            "אפשר להישאר בין 8 ל-24 שעות — אורך משפיע על חמיצות",
            "אם המקרר חם (>5°C) — קצרו את הזמן",
            "כסו טוב כדי שהפנים לא יתייבש",
          ]}/>
      </div>

      <div style={{ padding:'14px 16px 0' }}>
        <ExpandSB title="אפשר להאריך ל-24 שעות?" tone="question">
          כן. ככל שמאריכים, הטעם נעשה יותר חמצמץ ועוצמתי. הגבול הוא <span className="num">~36</span> שעות — מעבר לזה הגלוטן (gluten) מתחיל להתפרק והלחם יוצא דחוס.
        </ExpandSB>
      </div>

      <div style={{ padding:'14px 16px 0' }}>
        <QuestionsSB
          heading="שאלות בשלב הזה"
          items={[
            { q: 'אני צריך לקצר. מה הזמן המינימלי?', icon:'?' },
            { q: 'איך לכסות בלי שהבצק יידבק?' },
            { q: 'המקרר שלי קר מאוד. זה בעיה?', tone:'icn-warn' },
            { q: 'אפשר לדלג על השלב הזה?', tone:'icn-warn' },
          ]}/>
      </div>

      <div style={{ padding:'24px 16px 16px' }}>
        <button className="btn btn-accent" disabled>
          <span>הטיימר עוד פעיל</span>
          <IconSB.Clock size={18}/>
        </button>
        <div style={{ display:'flex', gap:8, marginBlockStart: 8 }}>
          <button className="btn btn-soft btn-sm" style={{ flex:1 }}>השהה</button>
          <button className="btn btn-soft btn-sm" style={{ flex:1 }}>+<span className="num">30</span> ד׳</button>
          <button className="btn btn-soft btn-sm" style={{ flex:1 }}>−<span className="num">30</span> ד׳</button>
        </div>
      </div>
    </PhoneSB>
  );
}

/* ─── Bottom sheet OPEN · Q&A flavor ─────────────────────────── */
function SheetOpen() {
  return (
    <PhoneSB height={812} label="פתח · שאלה ׳הבצק שלי לא תופח׳">
      {/* Faded background */}
      <div style={{ filter:'blur(2px)' }}>
        <div className="s-topbar">
          <button className="iconbtn"><IconSB.ChevronEnd/></button>
          <div className="ctx"><span className="num">04</span> / <span className="num">12</span> · תסיסה</div>
          <button className="iconbtn"><IconSB.Menu/></button>
        </div>
        <div style={{ padding:'20px 24px 0' }}>
          <span className="pill">~ 4 שעות</span>
          <div className="display" style={{ fontSize: 32, lineHeight: 1.05, marginBlockStart: 12 }}>תסיסה ראשונית.</div>
        </div>
      </div>

      <BottomSheetSB title="הבצק שלי לא תופח. מה לעשות?" height="56%" showScrim>
        <div style={{ marginBlockStart: 0 }}>
          <div className="card-tint" style={{ padding: 14, marginBlockEnd: 16 }}>
            <div style={{ font:'600 14px Rubik' }}>בקצרה</div>
            <div style={{ fontSize: 13, color:'var(--ink-2)', marginBlockStart:6, lineHeight:1.55 }}>
              ב-<span className="num">80%</span> מהמקרים הסיבה היא <strong>סטארטר חלש</strong> או <strong>מטבח קר מדי</strong>.
              לפני שאתם זורקים את הבייק, בדקו את שני אלה.
            </div>
          </div>

          <div style={{ font:'600 14px Rubik', marginBlockEnd: 10 }}>שלוש בדיקות מהירות</div>
          {[
            { n:1, h:'הסטארטר היה באמת בשיא?', body:'אם הוא עבר את השיא והתחיל לרדת, הוא איבד כוח. בפעם הבאה השתמשו בו לפני שהוא מתחיל לרדת.', tone:'fold' },
            { n:2, h:'מה הטמפ׳ במטבח?', body:'מתחת ל-22°C התסיסה תיקח הרבה יותר זמן. שימו את הקערה ליד תנור חם או על המקרר (יותר חם למעלה).', tone:'bowl' },
            { n:3, h:'עברו לפחות 4 שעות?', body:'תסיסה ראשונית רוצה זמן. אם לא תפח אחרי 5–6 שעות בטמפ׳ 25°C, יש בעיה — כנראה הסטארטר.', tone:'dough' },
          ].map((s)=>(
            <div key={s.n} className="card-flat" style={{ padding:0, marginBlockEnd:8, overflow:'hidden', display:'flex' }}>
              <div style={{ flex:'0 0 84px' }}>
                <PhotoSB tone={s.tone} aspect="1/1"/>
              </div>
              <div style={{ padding:'10px 12px', flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ width:18, height:18, borderRadius:'50%', background:'var(--ink)', color:'#fff', font:'700 11px Rubik', display:'grid', placeItems:'center' }} className="num">{s.n}</span>
                  <span style={{ font:'600 13px Rubik' }}>{s.h}</span>
                </div>
                <div style={{ fontSize: 12, color:'var(--ink-2)', marginBlockStart: 4, lineHeight: 1.5 }}>{s.body}</div>
              </div>
            </div>
          ))}

          <div style={{ marginBlockStart: 14 }}>
            <VideoCardSB
              tone="jar"
              title="איך נראה סטארטר באמת חזק"
              source="Kikar Library"
              duration="1:48"/>
          </div>

          <div style={{ display:'flex', gap:8, marginBlockStart: 16 }}>
            <button className="btn btn-soft btn-sm" style={{ flex:1 }}>
              <IconSB.Bookmark size={14}/> שמור לבייקים הבאים
            </button>
            <button className="btn btn-soft btn-sm" style={{ flex:1 }}>
              עוד שאלות בנושא
            </button>
          </div>
        </div>
      </BottomSheetSB>
    </PhoneSB>
  );
}

/* ─── Cheat sheet — full journey ─────────────────────────────── */
function CheatSheetSoft() {
  return (
    <PhoneSB height={1280} label="צ׳יט שיט · סקירה כללית">
      <div className="s-topbar">
        <button className="iconbtn"><IconSB.Close/></button>
        <div className="ctx">סקירה כללית</div>
        <span style={{ width:44 }}/>
      </div>

      <div style={{ padding:'16px 24px 0' }}>
        <div className="eyebrow">הבייק הפעיל שלי</div>
        <div className="display" style={{ fontSize: 22, marginBlockStart: 6 }}>כפרי קלאסי · <span className="num">75%</span></div>
        <div style={{ fontSize:12, color:'var(--ink-3)', marginBlockStart: 4 }} className="num">התחיל אתמול ב-19:00 · ~16 שעות לסיום</div>
      </div>

      <div style={{ padding:'18px 20px 0' }}>
        <div className="progress-strip" style={{ gap:4 }}>
          {Array.from({length:12}).map((_,i)=>(<i key={i} className={i<3 ? 'done' : i===3 ? 'cur' : ''}/>))}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBlockStart:8, fontSize:11, color:'var(--ink-3)' }}>
          <span><span className="num">3</span> הושלמו</span>
          <span><span className="num">8</span> נותרו</span>
        </div>
      </div>

      <div style={{ padding:'20px 20px 0' }}>
        {window.KIKAR_STAGES.map((s,i)=>{
          const done = i<3; const cur = i===3;
          return (
            <div key={s.n} style={{ display:'flex', gap:14, paddingBlock: 12, position:'relative' }}>
              <div style={{ flex:'0 0 28px', display:'flex', flexDirection:'column', alignItems:'center' }}>
                <div style={{
                  width:28, height:28, borderRadius:'50%',
                  background: done ? 'var(--ink)' : cur ? 'var(--accent)' : 'var(--paper)',
                  color: done || cur ? '#fff' : 'var(--ink-3)',
                  border: done || cur ? 'none' : '1.5px solid var(--line-2)',
                  display:'grid', placeItems:'center',
                  font:'600 12px Rubik',
                  boxShadow: cur ? '0 0 0 5px var(--accent-bg)' : 'none',
                }} className="num">
                  {done ? '✓' : s.n}
                </div>
                {i < 11 && <div style={{ flex:1, width:1.5, background: done ? 'var(--ink)' : 'var(--line)', marginBlockStart:4 }}/>}
              </div>
              <div style={{ flex:1, paddingBlockEnd: 4 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                  <div style={{ font: cur ? '700 15px Rubik' : '500 14px Rubik', color: done ? 'var(--ink-3)' : 'var(--ink)', textDecoration: done ? 'line-through' : 'none' }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: 11, color:'var(--ink-3)' }} className="num">{s.time}</div>
                </div>
                {cur && <div style={{ fontSize:11, color:'var(--accent)', marginBlockStart: 3, fontWeight:600 }}>אתם כאן · הקש כדי לפתוח</div>}
                {s.hint && !done && <div style={{ fontSize: 11, color:'var(--ink-3)', marginBlockStart: 2 }}>{s.hint}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </PhoneSB>
  );
}

/* ─── Patterns showcase ──────────────────────────────────────── */
function PatternsShowcase() {
  return (
    <div style={{ width: 760, padding: '24px 24px 24px', background:'#fff', borderRadius: 24 }}>
      <div style={{ font:'700 18px Rubik', letterSpacing:'-0.015em' }}>דפוסי הסבר ומדיה</div>
      <div style={{ fontSize: 13, color: '#666', marginBlockStart: 4, marginBlockEnd: 18 }}>הרכיבים החדשים — כל אחד שמיש בכל שלב</div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap: 16 }}>
        {/* Term chip */}
        <div className="card-flat" style={{ padding: 18 }}>
          <div className="eyebrow" style={{marginBlockEnd: 10}}>1 · מונח עם (?)</div>
          <div style={{ fontSize: 14, lineHeight: 1.6 }}>
            הבצק עובר <TermSB title="אוטוליזה" body="מים+קמח נחים יחד">אוטוליזה</TermSB> במשך <span className="num">30</span> דקות לפני שמוסיפים את ה<TermSB>שאור</TermSB>.
          </div>
          <div style={{ fontSize: 11, color:'#888', marginBlockStart: 12 }}>הקש על המונח → פופאובר עם הסבר קצר</div>
        </div>

        {/* Expandable */}
        <div className="card-flat" style={{ padding: 18 }}>
          <div className="eyebrow" style={{marginBlockEnd: 10}}>2 · ״למה?״ מתפרש</div>
          <ExpandSB title="למה רק 30 דקות?" tone="accent">
            כי אחרי 30 דקות הגלוטן התחיל להתפתח בעצמו והשאור יתערבב בו טוב יותר. יותר זמן = הבצק מתחיל לחמצמץ יותר מדי לפני התסיסה הראשונית.
          </ExpandSB>
        </div>

        {/* Photo */}
        <div className="card-flat" style={{ padding: 18 }}>
          <div className="eyebrow" style={{marginBlockEnd: 10}}>3 · תמונה רפרנס</div>
          <PhotoSB tone="dough" tag="אחרי קיפול" caption="חלק, גמיש, תופח על עצמו" aspect="4/3"/>
        </div>

        {/* Video */}
        <div className="card-flat" style={{ padding: 18 }}>
          <div className="eyebrow" style={{marginBlockEnd: 10}}>4 · קלטת וידאו עם פרקים</div>
          <VideoCardSB tone="fold" title="טכניקת קיפול" source="Kikar Library" duration="2:14" chapters={[{t:'0:00',label:'מבוא', current:true},{t:'0:48',label:'קיפול'}]}/>
        </div>

        {/* Gallery — strict positive vs good/bad */}
        <div className="card-flat" style={{ padding: 18, gridColumn: '1 / -1' }}>
          <div className="eyebrow" style={{marginBlockEnd: 10}}>5 · גלריית רפרנס — שני מצבים</div>
          <div style={{ fontSize: 12, color:'#666', marginBlockEnd: 10 }}>בררת מחדל: רק טוב (פשוט, ידידותי). אופציה: טוב/לא טוב (יותר חינוכי, פחות "סטרילי").</div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBlockEnd: 6 }}>
            <span className="pill pill-sage" style={{ fontSize:10, padding:'3px 8px' }}>STRICT POSITIVE · מומלץ</span>
            <span style={{ fontSize: 11, color:'#888' }}>בררת מחדל</span>
          </div>
          <div style={{ marginInline: -18 }}>
            <RefGallerySB items={[
              { tone:'bowl', text:'תפיחה אחידה, גמיש' },
              { tone:'dough', text:'בועות קטנות' },
              { tone:'shaped', text:'מתח אחיד' },
              { tone:'crumb', text:'פירור פתוח' },
            ]}/>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBlock: '16px 6px' }}>
            <span className="pill pill-warn" style={{ fontSize:10, padding:'3px 8px' }}>COMPARATIVE · עם דוגמאות שליליות</span>
          </div>
          <div style={{ marginInline: -18 }}>
            <RefGallerySB items={[
              { tone:'bowl', label:'טוב', kind:'good', text:'תפיחה אחידה' },
              { tone:'dough', label:'טוב', kind:'good', text:'בועות קטנות' },
              { tone:'fold', label:'לא טוב', kind:'bad', text:'שטוח · עוד זמן' },
              { tone:'shaped', label:'תפח יתר', kind:'bad', text:'נופל לעצמו' },
            ]}/>
          </div>
        </div>

        {/* Questions */}
        <div className="card-flat" style={{ padding: 18 }}>
          <div className="eyebrow" style={{marginBlockEnd: 10}}>6 · שאלות נפוצות</div>
          <QuestionsSB items={[
            { q: 'הבצק לא תופח. מה לעשות?', tone:'icn-warn' },
            { q: 'אפשר לעצור באמצע?' },
            { q: 'איך נראה גלוטן מפותח?' },
          ]}/>
        </div>

        {/* Briefing */}
        <div className="card-flat" style={{ padding: 18, gridColumn:'1 / -1' }}>
          <div className="eyebrow" style={{marginBlockEnd: 10}}>7 · תקציר בתחילת שלב</div>
          <BriefingSB
            heading="עיצוב סופי בונה את הקרום"
            blurb="הצורה הסופית קובעת איך הלחם יתפח ויקבל קרום. מתח אחיד = עליה זקופה, חיתוך נקי."
            takeaways={['השאירו תפר ברור', 'אל תרסקו את הבועות', 'מקמחים מעט, לא יותר מדי']}/>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StageBulk, StageTimerCold, SheetOpen, CheatSheetSoft, PatternsShowcase });
