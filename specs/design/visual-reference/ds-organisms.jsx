// Kikar DS — Organisms (Top bar, Tab bar, Stage header, Bottom sheet)

function OrgTopBar() {
  return (
    <div className="ds-card">
      <h3>Top bar</h3>
      <p className="ds-blurb">Three slots: <strong>back / context / sheet</strong>. Glass-backed iconbtns (44×44, 22 radius, blurred-glass fill) frame a center-aligned context pill. Each variant covers a different screen role.</p>

      <div className="ds-annot" style={{ marginBlockEnd: 10 }}>Variants</div>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {/* Home — wordmark + sheet */}
        <div className="ds-mini">
          <div className="s-topbar">
            <window.WordmarkS/>
            <button className="iconbtn"><window.I.Menu/></button>
          </div>
          <div className="ds-annot" style={{ paddingInline: 12, marginBlockStart: 8, direction:'ltr' }}>HOME — wordmark + sheet</div>
        </div>

        {/* Stage — back + counter + sheet */}
        <div className="ds-mini">
          <div className="s-topbar">
            <button className="iconbtn"><window.I.ChevronEnd/></button>
            <div className="ctx">
              <span className="num" style={{ fontWeight:700 }}>04</span>
              <span style={{ color:'#A6997F' }}> / </span>
              <span className="num">12</span>
              <span style={{ color:'#A6997F', marginInlineStart:6 }}>· תסיסה</span>
            </div>
            <button className="iconbtn"><window.I.Menu/></button>
          </div>
          <div className="ds-annot" style={{ paddingInline: 12, marginBlockStart: 8, direction:'ltr' }}>STAGE — back + counter + sheet</div>
        </div>

        {/* Modal — close-only on right */}
        <div className="ds-mini">
          <div className="s-topbar">
            <span style={{ width: 44 }}/>
            <div className="ctx">סקירה כללית</div>
            <button className="iconbtn"><window.I.Close/></button>
          </div>
          <div className="ds-annot" style={{ paddingInline: 12, marginBlockStart: 8, direction:'ltr' }}>OVERLAY — close-only</div>
        </div>
      </div>

      <div className="ds-note">
        <strong>Glass fill (iconbtn):</strong> <code>rgba(255,255,255,0.62) + backdrop-filter: blur(12px)</code>. Sits over the home gradient without fighting it.<br/>
        <strong>Context pill:</strong> same glass treatment. Centered. Tappable on stage screens — opens the cheat sheet.
      </div>
    </div>
  );
}

function OrgTabBar() {
  return (
    <div className="ds-card">
      <h3>Tab bar</h3>
      <p className="ds-blurb">Floating, glass-backed. Three tabs. Active tab fills with ink, inactive icons sit on transparent glass. Lives only on the home screen.</p>

      <div style={{ width: 360, padding: 12, position:'relative', background:'#F8F5EE', borderRadius: 20, border:'1px solid #ECE9E1' }}>
        <div style={{ height: 80 }}/>
        <div className="tab-bar" style={{ position:'static', insetInlineStart:0, insetInlineEnd:0, insetBlockEnd:0, marginInline: 0 }}>
          {[
            { l:'בית', a:true,  i:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M4 10l8-6 8 6v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-9z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg> },
            { l:'מתכונים', a:false, i:<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 4h11l3 3v13H5V4zM9 12h6M9 16h6M9 8h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg> },
            { l:'למידה', a:false, i:<window.I.Lightbulb size={20}/>},
          ].map((t,i)=>(
            <button key={i} style={{
              flex:1, padding:'10px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:4,
              background: t.a ? '#1F1A14' : 'transparent', color: t.a ? '#FFFCF4' : '#6E6457',
              border:0, borderRadius:16, cursor:'pointer', fontSize:11, fontWeight:600
            }}>{t.i}<span>{t.l}</span></button>
          ))}
        </div>
      </div>

      <div className="ds-note">
        <strong>States:</strong> <code>.active</code> uses ink fill. Hover (cursor only) raises non-active tab's bg to <code>rgba(31,26,20,.04)</code>. Pressed: <code>scale(0.965)</code>.
      </div>
    </div>
  );
}

function OrgStageHeader() {
  return (
    <div className="ds-card">
      <h3>Stage header</h3>
      <p className="ds-blurb">The first three blocks on every stage screen: top bar → 12-segment progress strip → pill + title + blurb. Always identical structure across all 12 stages so the user never has to re-learn.</p>

      <div className="ds-mini" style={{ direction:'rtl' }}>
        <div className="s-topbar">
          <button className="iconbtn"><window.I.ChevronEnd/></button>
          <div className="ctx">
            <span className="num" style={{ fontWeight:700 }}>04</span>
            <span style={{ color:'#A6997F' }}> / </span>
            <span className="num">12</span>
            <span style={{ color:'#A6997F', marginInlineStart:6 }}>· תסיסה</span>
          </div>
          <button className="iconbtn"><window.I.Menu/></button>
        </div>
        <div style={{ padding:'16px 0 0' }}>
          <div className="progress-strip">
            {Array.from({length:12}).map((_,i)=>(<i key={i} className={i<3 ? 'done' : i===3 ? 'cur' : ''}/>))}
          </div>
        </div>
        <div style={{ padding:'18px 8px 4px' }}>
          <span className="pill">~ <span className="num">4</span> שעות · קיפולים <span className="num">×4</span></span>
          <div className="display" style={{ fontSize: 26, lineHeight: 1.1, marginBlockStart: 10 }}>תסיסה ראשונית.</div>
          <div style={{ fontSize: 13, color:'#6E6457', marginBlockStart: 6, lineHeight: 1.55 }}>
            הבצק מתחיל לחיות. כל <span className="num">30</span> דקות קיפול.
          </div>
        </div>
      </div>

      <div className="ds-note">
        <strong>Stage-type pill:</strong> always present. Indicates duration & cadence. For timer stages it becomes <code>טיימר · 12 שעות</code> with the clock icon.<br/>
        <strong>Title:</strong> always ends with a period — a small typographic decision that grounds it.
      </div>
    </div>
  );
}

function OrgBottomSheet() {
  return (
    <div className="ds-card">
      <h3>Bottom sheet</h3>
      <p className="ds-blurb">Modal that slides up over the current screen. Two heights: <strong>peek (~56%)</strong> for quick answers, <strong>full (~88%)</strong> for deep dives with media. Always dismissable by scrim tap, ✕, or drag-down-from-grip.</p>

      <div className="ds-grid-3">
        {/* Peek */}
        <div>
          <div className="ds-annot" style={{ marginBlockEnd: 8 }}>Peek · 56%</div>
          <div className="ds-sheet-mini">
            <div className="sheet" style={{ height: '56%', padding: 12 }}>
              <div style={{ width: 36, height: 4, background:'#DCD0B4', borderRadius: 999, margin:'0 auto 10px' }}/>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ font:'700 14px Rubik' }}>הבצק לא תופח. מה לעשות?</div>
                <button style={{ width:28, height:28, borderRadius:'50%', background:'#F2EAD8', border:0 }}><window.I.Close size={14}/></button>
              </div>
              <div style={{ marginBlockStart: 10, fontSize: 11, color:'#6E6457', lineHeight: 1.5 }}>
                ב-80% מהמקרים: סטארטר חלש או מטבח קר. בדקו את שני אלה לפני שתזרקו…
              </div>
            </div>
          </div>
        </div>

        {/* Full */}
        <div>
          <div className="ds-annot" style={{ marginBlockEnd: 8 }}>Full · 88%</div>
          <div className="ds-sheet-mini">
            <div className="sheet" style={{ height: '88%', padding: 12 }}>
              <div style={{ width: 36, height: 4, background:'#DCD0B4', borderRadius: 999, margin:'0 auto 10px' }}/>
              <div style={{ font:'700 14px Rubik' }}>הבצק לא תופח</div>
              <div style={{ marginBlockStart:10 }}>
                <div style={{ width:'100%', borderRadius: 10, overflow:'hidden', height: 70 }}>
                  <window.Photo tone="bowl" aspect="3/1"/>
                </div>
                <div style={{ marginBlockStart: 8, fontSize: 11, color:'#6E6457', lineHeight: 1.5 }}>
                  בקצרה: סטארטר חלש או מטבח קר…<br/>
                  1. בדקו שיא הסטארטר<br/>
                  2. מדדו טמפ׳ במטבח<br/>
                  3. תנו עוד זמן
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Open from question */}
        <div>
          <div className="ds-annot" style={{ marginBlockEnd: 8 }}>Triggered from Questions row</div>
          <div className="ds-sheet-mini" style={{ background:'rgba(31,26,20,0.5)' }}>
            <div style={{ position:'absolute', insetInlineStart: 12, insetInlineEnd: 12, insetBlockStart: 12, padding: 10, background:'#fff', borderRadius: 14, opacity:0.4 }}>
              <div style={{ font:'600 12px Rubik' }}>שאלות נפוצות בשלב הזה</div>
            </div>
            <div className="sheet" style={{ height: '56%', padding: 12 }}>
              <div style={{ width: 36, height: 4, background:'#DCD0B4', borderRadius: 999, margin:'0 auto 10px' }}/>
              <div style={{ font:'700 13px Rubik' }}>הבצק לא תופח</div>
              <div style={{ marginBlockStart: 8, fontSize: 10, color:'#6E6457' }}>הסקרים מטשטשים. גלילה רק בתוך השיט.</div>
            </div>
          </div>
        </div>
      </div>

      <div className="ds-note">
        <strong>Entry/exit:</strong> 300ms ease-out for translation. <strong>Scrim:</strong> <code>rgba(31,26,20,0.45)</code> with <code>backdrop-filter: blur(2px)</code>. Always dismiss on scrim tap.<br/>
        <strong>Grip:</strong> draggable downward only (not up — peek doesn't expand). The grip is decorative only at peek size.
      </div>
    </div>
  );
}

/* ─── A11y / RTL appendix ────────────────────────────────────── */
function A11yAppendix() {
  return (
    <div className="ds-card">
      <h3>RTL &amp; Accessibility — rules of the road</h3>
      <p className="ds-blurb">Non-negotiables that affect every component implementation.</p>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        {[
          { h:'Logical properties only',
            b:<>Every spacing, position, and border directive uses <code>inline-start/end</code>, <code>block-start/end</code>. Tailwind: <code>ms-/me-/ps-/pe-/start-/end-</code>. <strong>Never</strong> <code>ml-/mr-/left/right</code>.</> },
          { h:'Numbers stay LTR',
            b:<>Wrap numeric runs: <code>{'<span dir="ltr">75%</span>'}</code>. Same for <code>°C</code>, <code>g</code>, <code>HH:MM</code>. Otherwise punctuation flips.</> },
          { h:'Touch targets ≥ 44×44',
            b:<>Every interactive element. If visual size is smaller (a chevron), pad the hit area.</> },
          { h:'Focus visible',
            b:<>Use <code>:focus-visible</code>, not <code>:focus</code> — only show the ring for keyboard users. Ring color matches the variant.</> },
          { h:'prefers-reduced-motion',
            b:<>Drop transforms entirely, durations → <code>0ms</code>. State changes still happen; they just snap.</> },
          { h:'Color contrast',
            b:<>Body copy on cream: ink (#1F1A14) on #F8F5EE = 14.2:1 ✓. Secondary (#6E6457) = 5.8:1 ✓. Never use accent on light alone for small text — fails AA.</> },
          { h:'Direction-aware icons',
            b:<>Use <code>ChevronStart</code> / <code>ChevronEnd</code> (semantic). The renderer rotates inside RTL containers automatically — don't manually mirror.</> },
          { h:'Hebrew + English mix',
            b:<>Tag mixed phrases with <code>{'<bdi>'}</code> when needed. First mention of a Hebrew-only term may include English in parens — e.g. ‘שאור (levain)’.</> },
        ].map(r=>(
          <div key={r.h} className="card-flat" style={{ padding: 14, background:'#FBF7EE' }}>
            <div style={{ font:'700 13px Rubik' }}>{r.h}</div>
            <div style={{ fontSize: 12, color:'#6E6457', marginBlockStart: 6, lineHeight: 1.55 }}>{r.b}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { OrgTopBar, OrgTabBar, OrgStageHeader, OrgBottomSheet, A11yAppendix });
