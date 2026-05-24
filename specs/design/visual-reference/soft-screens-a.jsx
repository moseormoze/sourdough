// Kikar Soft — Home, Starter, Presets, Recipe, Completion
const {
  Phone: PhoneS, I: IconS, Term: TermS, Expand: ExpandS, Photo: PhotoS,
  RefGallery: RefGalleryS, VideoCard: VideoCardS, Questions: QuestionsS,
  BottomSheet: BottomSheetS, Briefing: BriefingS, ExpertTip: ExpertTipS,
  SectionHead: SectionHeadS,
} = window;

/* ─── Logo + wordmark (Soft Bake mark) ──────────────────────── */
function MarkS({ size = 32 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size*0.32, background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)', display: 'grid', placeItems: 'center', color: '#fff', font: '700 ' + Math.round(size*0.5) + 'px Rubik', letterSpacing: '-0.04em', boxShadow: '0 6px 16px rgba(230,107,61,.32)' }}>כ</div>
  );
}
function WordmarkS({ size=22, dark }) {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:10 }}>
      <MarkS size={size + 8}/>
      <span className="display" style={{ fontSize: size, color: dark ? '#F3E9D4' : 'var(--ink)' }}>כיכר</span>
    </div>
  );
}

/* ─── 1A · Home Fresh ────────────────────────────────────────── */
function HomeFresh() {
  return (
    <PhoneS height={812} label="01 בית · התחלה">
      <div className="s-topbar">
        <WordmarkS/>
        <button className="iconbtn"><IconS.Menu/></button>
      </div>

      <div style={{ padding: '36px 24px 0' }}>
        <div className="eyebrow">שבת בבוקר, <span className="num">9:24</span></div>
        <div className="display" style={{ fontSize: 36, lineHeight: 1.05, marginBlockStart: 6, marginBlockEnd: 0 }}>
          מה אופים<br/>היום?
        </div>
      </div>

      {/* Hero photo */}
      <div style={{ padding:'24px 16px 0' }}>
        <div className="card" style={{ position:'relative' }}>
          <PhotoS tone="baked" tag="לחם השבוע" caption="כפרי קלאסי · 75% הידרציה · אפייה אתמול"
            aspect="5/4"
            overlay={
              <div style={{ position:'absolute', insetInlineStart:14, insetBlockStart:48, color:'#fff', zIndex:2 }}>
                <div className="display" style={{ fontSize: 24, lineHeight: 1.1, textShadow:'0 2px 8px rgba(0,0,0,.4)' }}>תאפו לחם<br/>שמספר סיפור.</div>
              </div>
            }/>
          <div style={{ padding: 18 }}>
            <button className="btn btn-accent">
              <span>התחל אפייה חדשה</span>
              <IconS.ArrowEnd size={20}/>
            </button>
            <button className="btn btn-ghost" style={{ marginBlockStart: 6 }}>
              חזרה לבייק האחרון
            </button>
          </div>
        </div>
      </div>

      {/* Education + starter status */}
      <div style={{ padding: '16px 16px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10 }}>
        <div className="card-flat" style={{ padding: 14 }}>
          <div style={{ width:36, height:36, borderRadius:12, background:'var(--sage-bg)', display:'grid', placeItems:'center', color:'var(--sage-2)' }}>
            <IconS.Jar/>
          </div>
          <div style={{ fontSize:14, fontWeight:600, marginBlockStart: 10 }}>הסטארטר שלי</div>
          <div style={{ fontSize:11, color:'var(--ink-3)', marginBlockStart:3 }}>הוזן לפני <span className="num">8</span> שעות · פעיל</div>
        </div>
        <div className="card-flat" style={{ padding: 14 }}>
          <div style={{ width:36, height:36, borderRadius:12, background:'var(--accent-bg)', display:'grid', placeItems:'center', color:'var(--accent)' }}>
            <IconS.Lightbulb/>
          </div>
          <div style={{ fontSize:14, fontWeight:600, marginBlockStart: 10 }}>למידה</div>
          <div style={{ fontSize:11, color:'var(--ink-3)', marginBlockStart:3 }}>הסבר על הידרציה · <span className="num">3</span> דק׳</div>
        </div>
      </div>

      <div className="tab-bar">
        {[
          { l:'בית', a:true, i:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 10l8-6 8 6v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>},
          { l:'מתכונים', i:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 4h11l3 3v13H5V4zM9 12h6M9 16h6M9 8h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>},
          { l:'למידה', i:<IconS.Lightbulb size={20}/>},
        ].map((t,i)=>(
          <button key={i} style={{
            flex:1, padding:'10px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:4,
            background: t.a ? 'var(--ink)' : 'transparent', color: t.a ? '#FFFCF4' : 'var(--ink-2)',
            border:0, borderRadius:16, cursor:'pointer', fontSize:11, fontWeight:600
          }}>{t.i}<span>{t.l}</span></button>
        ))}
      </div>
    </PhoneS>
  );
}

/* ─── 1B · Home Resuming ─────────────────────────────────────── */
function HomeResume() {
  return (
    <PhoneS height={812} label="01 בית · ממשיכים">
      <div className="s-topbar">
        <WordmarkS/>
        <button className="iconbtn"><IconS.Menu/></button>
      </div>

      <div style={{ padding: '24px 24px 0' }}>
        <span className="pill"><span style={{width:6, height:6, borderRadius:'50%', background:'var(--accent)', display:'inline-block'}}/> בייק פעיל</span>
        <div className="display" style={{ fontSize: 32, lineHeight: 1.05, marginBlockStart: 12 }}>
          הבייק שלך<br/>ממשיך לנשום.
        </div>
      </div>

      <div style={{ padding: '20px 16px 0' }}>
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #FCE7D4 0%, #F8E4CA 60%, #F0DEB7 100%)', padding: 18, position:'relative' }}>
            <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
              <div>
                <div className="eyebrow" style={{color:'var(--ink-2)'}}>השלב הנוכחי</div>
                <div className="display" style={{ fontSize: 22, lineHeight: 1.1, marginBlockStart: 4 }}>תסיסה ראשונית</div>
                <div style={{ fontSize: 13, color:'var(--ink-2)', marginBlockStart: 4 }}>
                  קיפול <span className="num">2</span> מתוך <span className="num">4</span> · בעוד <span className="num">22</span> ד׳
                </div>
              </div>
              <div className="display" style={{ fontSize: 36, lineHeight: 1, color: 'var(--accent)' }}>
                <span className="num">04</span><span style={{ fontSize: 18, color:'rgba(31,26,20,0.3)' }}>/12</span>
              </div>
            </div>
            <div style={{ marginBlockStart: 14, height: 8, background:'rgba(255,255,255,0.6)', borderRadius:999, overflow:'hidden' }}>
              <div style={{ width:'30%', height:'100%', background:'linear-gradient(90deg, var(--accent), var(--accent-2))', borderRadius:999 }}/>
            </div>
          </div>
          <div style={{ padding: 18 }}>
            <button className="btn btn-accent">
              <span>המשך מהמקום הזה</span>
              <IconS.ArrowEnd size={20}/>
            </button>
            <button className="btn btn-ghost" style={{ marginBlockStart: 6, fontSize: 12, color:'var(--ink-3)' }}>
              התחל בייק חדש · יבטל את הקיים
            </button>
          </div>
        </div>
      </div>

      {/* "Why are we doing this stage?" - educational nudge */}
      <div style={{ padding:'14px 16px 0' }}>
        <div className="card-flat" style={{ padding: 16, display:'flex', gap: 12 }}>
          <div style={{ width:40, height:40, borderRadius:14, background:'var(--accent-bg)', display:'grid', placeItems:'center', color:'var(--accent)', flex:'0 0 40px' }}>
            <IconS.Lightbulb/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ font:'600 14px Rubik' }}>למה אנחנו מקפלים?</div>
            <div style={{ fontSize:12, color:'var(--ink-3)', marginBlockStart:3, lineHeight:1.45 }}>הקיפול בונה רשת גלוטן חזקה בלי לישה אגרסיבית. בלי זה, הלחם יתפוס מבנה שטוח.</div>
          </div>
          <button className="btn btn-soft btn-sm" style={{ width:'auto', alignSelf:'center' }}>קרא</button>
        </div>
      </div>

      <div style={{ padding:'14px 16px 0' }}>
        <SectionHeadS action={<button className="btn-ghost btn btn-sm" style={{width:'auto', minHeight: 32, fontSize: 12, padding: '0 10px'}}>הכל</button>}>הבייקים שלי</SectionHeadS>
        <div style={{ display:'flex', gap: 10, paddingInline: 4 }}>
          {[
            { n:'כפרי קלאסי', d:'18.05', tone:'baked' },
            { n:'שיפון 50%', d:'11.05', tone:'crumb' },
            { n:'לחם שישי', d:'03.05', tone:'shaped' },
          ].map((b,i)=>(
            <div key={i} className="card-flat" style={{ flex:1, padding:8, textAlign:'start' }}>
              <PhotoS tone={b.tone} aspect="1/1"/>
              <div style={{ font:'600 12px Rubik', marginBlockStart:8 }}>{b.n}</div>
              <div style={{ font:'500 10px Rubik', color:'var(--ink-3)', marginBlockStart:2 }} className="num">{b.d}</div>
            </div>
          ))}
        </div>
      </div>
    </PhoneS>
  );
}

/* ─── 2 · Starter Check ──────────────────────────────────────── */
function StarterSoft() {
  const [checks, setChecks] = useState({a:true,b:true,c:false});
  return (
    <PhoneS height={1240} label="02 בדיקת סטארטר">
      <div className="s-topbar">
        <button className="iconbtn"><IconS.ChevronEnd/></button>
        <div className="ctx">בדיקת סטארטר</div>
        <button className="iconbtn"><IconS.Menu/></button>
      </div>

      <div style={{ padding: '24px 24px 0' }}>
        <div className="eyebrow">לפני שמתחילים</div>
        <div className="display" style={{ fontSize: 32, lineHeight: 1.05, marginBlockStart: 8 }}>
          האם הסטארטר<br/>שלכם מוכן?
        </div>
        <div style={{ fontSize: 14, color:'var(--ink-2)', marginBlockStart: 10, lineHeight: 1.55 }}>
          ה<TermS title="סטארטר" body="התרבית החיה של שמרי בר וחיידקים שהבצק מבוסס עליה.">סטארטר</TermS> זה הלב של הלחם — בלי שהוא פעיל באמת, התסיסה לא תתפוס.
        </div>
      </div>

      {/* Reference photo: what 'ready' looks like */}
      <div style={{ padding:'20px 16px 0' }}>
        <div className="card" style={{ overflow:'hidden' }}>
          <PhotoS tone="jar" tag="מוכן" caption="הצדדים זרועים בועות. גובה כפול. ריח מתקתק-חמצמץ." aspect="4/3"/>
          <div style={{ padding:'14px 16px' }}>
            <div style={{ font:'600 14px Rubik' }}>איך נראה סטארטר מוכן?</div>
            <div style={{ fontSize:13, color:'var(--ink-2)', marginBlockStart:4, lineHeight:1.5 }}>השוו את שלכם לתמונה. השלב המתקבל בא בערך 4–6 שעות אחרי האכלה ב-25°C.</div>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div style={{ padding: '20px 16px 0' }}>
        <SectionHeadS>סימני חיים</SectionHeadS>
        <div style={{ display:'flex', flexDirection:'column', gap:8, paddingInline:4 }}>
          {[
            { k:'a', t:'הוכפל בנפח ב-4–12 השעות האחרונות', sub:'הסימן הכי חשוב' },
            { k:'b', t:'רואים בועות פעילות בפנים', sub:'מהצד של הצנצנת' },
            { k:'c', t:'עובר מבחן ציפה (float test)', sub:'חתיכה קטנה צפה במים פושרים' },
          ].map(it=>(
            <button key={it.k} className={`check-tile ${checks[it.k] ? 'is-checked' : ''}`}
              onClick={()=>setChecks(c=>({...c, [it.k]: !c[it.k]}))}>
              <div className="box">{checks[it.k] && <IconS.Check/>}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:600 }}>{it.t}</div>
                <div style={{ fontSize:11, color:'var(--ink-3)', marginBlockStart:2 }}>{it.sub}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Explanation expand */}
      <div style={{ padding:'14px 16px 0' }}>
        <ExpandS title="מה זה מבחן ציפה (float test)?" tone="question">
          לוקחים כפית סטארטר ומפילים לכוס מים פושרים. אם הוא צף — יש מספיק גזים בפנים והוא פעיל מספיק לאפייה. אם שוקע — תנו לו עוד שעה-שעתיים. <br/><br/>
          <em style={{ color:'var(--ink-3)' }}>הסטארטר חייב להיות לפחות בנקודת השיא — לא בעלייה ולא בירידה.</em>
        </ExpandS>
      </div>

      {/* Common questions */}
      <div style={{ padding:'14px 16px 0' }}>
        <QuestionsS
          heading="שאלות בשלב הזה"
          items={[
            { q: 'הסטארטר שלי כמעט לא תפח. מה לעשות?', icon:'?', tone:'icn-warn' },
            { q: 'מה ההבדל בין סטארטר ל-שאור (levain)?', icon:'?' },
            { q: 'באיזו תדירות מאכילים סטארטר?' },
            { q: 'אפשר להשתמש בסטארטר שיצא מהמקרר?' },
          ]}/>
      </div>

      <div style={{ padding:'20px 16px 16px' }}>
        <button className="btn btn-accent" disabled={Object.values(checks).filter(Boolean).length < 2}>
          <span>הסטארטר מוכן — בוא נמשיך</span>
          <IconS.ArrowEnd size={20}/>
        </button>
        <button className="btn btn-ghost" style={{ marginBlockStart: 4, fontSize: 14 }}>
          הסטארטר לא מוכן עדיין · הזן וחזור
        </button>
      </div>
    </PhoneS>
  );
}

/* ─── 3 · Preset gallery ─────────────────────────────────────── */
function PresetsSoft() {
  const all = [...window.KIKAR_USER_PRESETS, ...window.KIKAR_PRESETS];
  const photos = ['baked', 'crumb', 'shaped', 'baked', 'crumb', 'shaped', 'banneton'];
  return (
    <PhoneS height={1320} label="03 בחירת מתכון">
      <div className="s-topbar">
        <button className="iconbtn"><IconS.ChevronEnd/></button>
        <div className="ctx">בחירת מתכון</div>
        <button className="iconbtn"><IconS.Menu/></button>
      </div>

      <div style={{ padding:'20px 24px 0' }}>
        <div className="eyebrow">שלב 1 · מתכון</div>
        <div className="display" style={{ fontSize: 30, lineHeight: 1.05, marginBlockStart: 8 }}>
          מאיפה להתחיל?
        </div>
        <div style={{ fontSize:14, color:'var(--ink-2)', marginBlockStart:10, lineHeight:1.55 }}>
          מתכון מוכן או משלכם. כל אחד מההצעות כולל את מה ש<TermS title="הידרציה">הידרציה</TermS>, אחוז המלח והשאור (levain) צריכים להיות.
        </div>
      </div>

      <div style={{ padding:'18px 14px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {all.map((p, i)=>(
          <div key={p.id} className="card" style={{ position:'relative' }}>
            <PhotoS tone={photos[i % photos.length]} aspect="4/3"/>
            {p.mine && <span className="pill pill-sage" style={{ position:'absolute', top: 10, insetInlineEnd: 10, fontSize: 10 }}>שלי</span>}
            <div style={{ padding:'12px 14px' }}>
              <div style={{ font:'700 15px Rubik', letterSpacing:'-0.015em' }}>{p.name}</div>
              <div style={{ fontSize: 12, color:'var(--ink-3)', marginBlockStart:4, lineHeight:1.4, minHeight:34 }}>{p.blurb}</div>
              <div style={{ display:'flex', gap:6, marginBlockStart:10, flexWrap:'wrap' }}>
                <span className="pill pill-paper" style={{ fontSize:10, padding:'4px 8px' }}><span className="num">{p.hydration}%</span></span>
                <span className="pill pill-paper" style={{ fontSize:10, padding:'4px 8px' }}>{p.flours.split('·')[0].trim()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding:'18px 16px 0' }}>
        <button className="card" style={{ padding: 16, width:'100%', display:'flex', gap:12, alignItems:'center', textAlign:'start', border:0, cursor:'pointer', background:'var(--paper)' }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'var(--accent-bg)', display:'grid', placeItems:'center', color:'var(--accent)' }}>
            <IconS.Plus size={22}/>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ font:'600 15px Rubik' }}>התחל מאפס</div>
            <div style={{ fontSize:12, color:'var(--ink-3)', marginBlockStart:2 }}>מתכון מותאם — אתם מגדירים הכל</div>
          </div>
          <IconS.ChevronStart size={20}/>
        </button>
      </div>

      <div style={{ padding:'14px 16px 0' }}>
        <ExpandS title="איך לבחור מתכון מתאים?" tone="question">
          הטעות הכי נפוצה של מתחילים: בחירה במתכון של 100% קמח מלא או הידרציה <span className="num">82%</span> כי הוא נראה ״רציני יותר״.<br/><br/>
          התחילו ב<strong>״כפרי קל למתחילים״</strong> או <strong>״לבן בסיסי״</strong> — נמוכים בהידרציה, סלחנים לטעויות. אחרי שני בייקים מוצלחים, התקדמו ל-75% ולמעלה.
        </ExpandS>
      </div>
    </PhoneS>
  );
}

/* ─── 4 · Recipe Form ────────────────────────────────────────── */
function RecipeSoft() {
  const [name, setName] = useState("");
  const [flours, setFlours] = useState({white:80, whole:20, rye:0, other:0});
  const [hydration, setHyd] = useState(76);
  const sum = flours.white + flours.whole + flours.rye + flours.other;
  return (
    <PhoneS height={1480} label="04 מתכון מותאם">
      <div className="s-topbar">
        <button className="iconbtn"><IconS.ChevronEnd/></button>
        <div className="ctx">מתכון מותאם</div>
        <button className="iconbtn"><IconS.Menu/></button>
      </div>

      <div style={{ padding:'24px 24px 0' }}>
        <div className="eyebrow">שדה <span className="num">1</span></div>
        <div className="display" style={{ fontSize: 24, lineHeight: 1.1, marginBlockStart: 6 }}>שם המתכון</div>
        <input className="input" placeholder="לחם של שישי" value={name} onChange={e=>setName(e.target.value)} style={{ marginBlockStart:12 }}/>
      </div>

      <div style={{ padding:'20px 16px 0' }}>
        <SectionHeadS
          action={<span style={{ fontSize:13, color: sum===100 ? 'var(--sage-2)' : '#A14525', fontWeight:600 }}>סה״כ: <span className="num">{sum}%</span> {sum===100 ? '✓' : `· חסר ${100-sum}%`}</span>}
        >קמחים</SectionHeadS>
        <div style={{ paddingInline:4, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {[
            {k:'white', l:'לבן'},
            {k:'whole', l:'מלא'},
            {k:'rye', l:'שיפון'},
            {k:'other', l:'אחר'},
          ].map(f=>(
            <div key={f.k} className="card-flat" style={{ padding:'12px 14px' }}>
              <div style={{ fontSize:12, color:'var(--ink-3)', fontWeight:500 }}>{f.l}</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:4, marginBlockStart:4 }}>
                <input type="number" value={flours[f.k]} onChange={e=>setFlours({...flours, [f.k]:+e.target.value || 0})}
                  className="num" style={{ border:0, background:'transparent', font:'600 24px Rubik', width:'100%', color:'var(--ink)', outline:'none' }}/>
                <span style={{ fontSize:14, color:'var(--ink-2)' }}>%</span>
              </div>
            </div>
          ))}
        </div>
        <ExpandS title="איך אחוזי הקמח עובדים?" tone="question" defaultOpen={false}>
          המתמטיקה: כל ה<strong>אחוזים בנוסחה</strong> (הידרציה, מלח, שאור) הם ביחס לכמות הקמח הכוללת. למשל אם הקמח הכולל הוא <span className="num">500</span>ג׳ ו-<span className="num">75%</span> הידרציה, אז המים = <span className="num">375</span>ג׳.
          <br/><br/>
          זה נקרא <em>baker's percentage</em> ומאפשר לכם להגדיל או להקטין מנה בלי לחשב מחדש.
        </ExpandS>
      </div>

      {/* Hydration card with expand */}
      <div style={{ padding:'20px 16px 0' }}>
        <SectionHeadS
          action={<button className="pill" style={{ cursor:'pointer', fontSize:11 }}>מומלץ: 78% · עדכן</button>}
        ><TermS>הידרציה</TermS></SectionHeadS>
        <div className="card-flat" style={{ padding:'14px 16px', marginInline:4 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <span className="display num" style={{ fontSize: 32 }}>{hydration}<span style={{ fontSize:18, color:'var(--ink-3)', marginInlineStart:4 }}>%</span></span>
            <div style={{ display:'flex', gap: 6 }}>
              <button onClick={()=>setHyd(Math.max(50, hydration-1))} style={{ width:36, height:36, borderRadius:12, border:'1px solid var(--line)', background:'var(--paper)', cursor:'pointer' }}>−</button>
              <button onClick={()=>setHyd(Math.min(100, hydration+1))} style={{ width:36, height:36, borderRadius:12, border:'1px solid var(--line)', background:'var(--paper)', cursor:'pointer' }}>+</button>
            </div>
          </div>
          <div style={{ marginBlockStart:14, position:'relative', height:6, background:'var(--bg-2)', borderRadius:999 }}>
            <div style={{ position:'absolute', insetBlock:0, insetInlineStart:0, width:`${(hydration-50)/50*100}%`, background:'linear-gradient(90deg, var(--accent), var(--accent-2))', borderRadius:999 }}/>
            <div style={{ position:'absolute', insetBlockStart:-7, insetInlineStart:`${(hydration-50)/50*100}%`, width:20, height:20, borderRadius:'50%', background:'#fff', border:'2px solid var(--ink)', transform:'translateX(-50%)' }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBlockStart:6, fontSize:10, color:'var(--ink-3)' }}>
            <span>קל למתחילים<br/>50%</span>
            <span style={{ textAlign:'end' }}>קשה ועתיר אוויר<br/>100%</span>
          </div>
        </div>
        <div style={{ marginBlockStart:10, paddingInline:4 }}>
          <ExpandS title="מה ההידרציה עושה לבצק?" tone="question">
            יותר מים = פירור (crumb) פתוח ואוורירי, אבל בצק נדבק יותר, וצריך טכניקת עבודה רטובה.<br/>
            פחות מים = בצק קל לעיצוב, פירור צפוף, קרום (crust) פחות פריך.<br/><br/>
            למתחילים: התחילו ב-<span className="num">70–75%</span>. תעלו אחרי שאתם מצליחים לעצב בלי שהבצק נדבק.
          </ExpandS>
        </div>
      </div>

      <div style={{ padding: '24px 16px 16px' }}>
        <button className="btn btn-accent">
          <span>התחל לאפות</span>
          <IconS.ArrowEnd size={20}/>
        </button>
      </div>
    </PhoneS>
  );
}

/* ─── 6 · Completion ─────────────────────────────────────────── */
function CompletionSoft() {
  return (
    <PhoneS height={1100} label="12 הלחם מוכן">
      <div className="s-topbar">
        <span style={{ width:44 }}/>
        <span className="pill"><span style={{width:6, height:6, borderRadius:'50%', background:'var(--sage-2)', display:'inline-block'}}/> בייק 12 הושלם</span>
        <button className="iconbtn"><IconS.Close/></button>
      </div>

      <div style={{ padding:'20px 24px 0', textAlign:'center' }}>
        <div className="eyebrow" style={{ color:'var(--accent-ink, #8A4F25)' }}>שלב <span className="num">12</span> מתוך <span className="num">12</span></div>
        <div className="display" style={{ fontSize: 36, lineHeight: 1.05, marginBlockStart: 10 }}>
          הלחם שלך<br/>מוכן.
        </div>
        <div style={{ fontSize: 14, color:'var(--ink-2)', marginBlockStart: 14, lineHeight: 1.55 }}>
          תנו לו שעה לנוח. הריח עכשיו הוא תזכורת לסבלנות.
        </div>
      </div>

      {/* Hero photo */}
      <div style={{ padding:'20px 16px 0' }}>
        <div className="card" style={{ overflow:'hidden' }}>
          <PhotoS tone="baked" aspect="4/3" caption="כפרי קלאסי · אפייה מס׳ 12"
            overlay={
              <button style={{ position:'absolute', insetBlockEnd:14, insetInlineEnd:14, background:'rgba(255,252,244,0.92)', border:0, padding:'8px 12px', borderRadius:12, font:'600 12px Rubik', display:'inline-flex', alignItems:'center', gap:6, zIndex:3, cursor:'pointer' }}>
                <IconS.Camera size={14}/> החליפו לתמונה שלכם
              </button>
            }/>
        </div>
      </div>

      {/* Recipe recap */}
      <div style={{ padding:'18px 16px 0' }}>
        <div className="card-flat" style={{ padding:16 }}>
          <div className="eyebrow">המתכון</div>
          <div className="display" style={{ fontSize: 18, marginBlockStart: 4 }}>כפרי קלאסי</div>
          <div style={{ height:1, background:'var(--line)', marginBlock:14 }}/>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, fontSize:13 }}>
            {[
              { l:'התחלת', v:'אתמול · 19:00' },
              { l:'סיימת', v:'היום · 11:42' },
              { l:'זמן כולל', v:'16ש׳ 42ד׳' },
              { l:'קיפולים', v:'4 / 4' },
              { l:'הידרציה', v:'75%' },
              { l:'טמפ׳ מטבח', v:'25°C' },
            ].map((s,i)=>(
              <div key={i}>
                <div style={{ color:'var(--ink-3)', fontSize: 11 }}>{s.l}</div>
                <div style={{ fontWeight:600, marginBlockStart: 2 }} className="num">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reflection card */}
      <div style={{ padding:'14px 16px 0' }}>
        <div className="card-sage" style={{ padding:18 }}>
          <div className="eyebrow" style={{ color:'var(--sage-2)' }}>פתק לעצמכם</div>
          <div style={{ font:'600 15px Rubik', marginBlockStart:6 }}>איך יצא הפעם?</div>
          <div style={{ fontSize:12, color:'var(--ink-2)', marginBlockStart:4, lineHeight:1.5 }}>
            רשמו <span className="num">2-3</span> מילים על הבייק. נדפיס את ההערה ליד המתכון בפעם הבאה שתאפו אותו.
          </div>
          <textarea className="input" placeholder="קרום פצלצל · קצת ירד באמצע · להוסיף 30ד׳ לתסיסה" style={{ marginBlockStart:10, minHeight:80, resize:'none', background:'rgba(255,255,255,0.65)', fontSize:14 }}/>
        </div>
      </div>

      <div style={{ padding:'20px 16px 16px' }}>
        <button className="btn btn-accent">
          <span>שמור והתחל בייק חדש</span>
          <IconS.ArrowEnd size={20}/>
        </button>
        <button className="btn btn-ghost" style={{ marginBlockStart: 4 }}>חזור למסך הבית</button>
      </div>
    </PhoneS>
  );
}

Object.assign(window, {
  HomeFresh, HomeResume, StarterSoft, PresetsSoft, RecipeSoft, CompletionSoft,
  MarkS, WordmarkS,
});
