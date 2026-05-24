// Kikar DS — Atoms (Buttons, Inputs, Pills, Term, Icons, Controls)
const { useState: useStateA } = React;

/* State badge helper */
function StateBadge({ kind="default", label }) {
  return <span className={`ds-state is-${kind}`}>{label || kind}</span>;
}

/* ─── Buttons ────────────────────────────────────────────────── */
function ButtonsCard() {
  const Variants = [
    { v:'primary',  cls:'btn',           label:'התחל אפייה' },
    { v:'accent',   cls:'btn btn-accent', label:'המשך הבייק' },
    { v:'soft',     cls:'btn btn-soft',   label:'שמור לבייקים' },
    { v:'ghost',    cls:'btn btn-ghost',  label:'דלג בכל זאת' },
    { v:'warn',     cls:'btn btn-warn',   label:'תזכורת בעוד 5 ד׳' },
  ];
  const States = [
    { k:'default',  dsi:'' },
    { k:'hover',    dsi:'dsi-hover' },
    { k:'pressed',  dsi:'dsi-pressed' },
    { k:'focus',    dsi:'dsi-focus' },
    { k:'disabled', dsi:'', disabled:true },
  ];
  return (
    <div className="ds-card">
      <h3>Button</h3>
      <p className="ds-blurb">Five variants. Same height (56px), same radius (22px), same internal padding. Touch target ≥44px guaranteed by minimum height.</p>

      {Variants.map(V=>(
        <div key={V.v} style={{ marginBlockStart: 18, paddingBlockStart: 18, borderBlockStart: '1px solid #ECE9E1' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBlockEnd: 12 }}>
            <div style={{ font:'700 13px Rubik' }}>{V.v}</div>
            <div className="ds-annot">{V.cls}</div>
          </div>
          <div className="ds-row" style={{ direction:'rtl' }}>
            {States.map(s=>(
              <div key={s.k} className="ds-cell">
                <div className={s.dsi} style={{ width: 200 }}>
                  <button className={V.cls} disabled={s.disabled}>{V.label}</button>
                </div>
                <StateBadge kind={s.disabled ? 'disabled' : s.k}/>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="ds-note">
        <strong>Press feedback (universal):</strong> on any tap, scale to 0.965 over 120ms ease-out, then release. Combined with the inherent `transform: scale(1)` rest state.<br/>
        <strong>Focus ring:</strong> 3px halo using accent-soft for accent buttons, lavender for ink buttons. <strong>Focus-visible only</strong> — never on mouse click.<br/>
        <strong>Disabled:</strong> 40% opacity, pointer-events: none. Never describe a disabled button with copy ("you can't do this") — instead let the screen explain (e.g. "הטיימר עוד פעיל").
      </div>

      <div className="ds-code">
        <span className="com">// Standard CTA</span>{'\n'}
        <span className="tag">&lt;button</span> <span className="attr">className</span>=<span className="str">"btn btn-accent"</span><span className="tag">&gt;</span>{'\n  '}
        <span className="tag">&lt;span&gt;</span>סיימתי קיפול<span className="tag">&lt;/span&gt;</span>{'\n  '}
        <span className="tag">&lt;ArrowEnd</span> <span className="attr">size</span>=<span className="str">{`{20}`}</span> <span className="tag">/&gt;</span>{'\n'}
        <span className="tag">&lt;/button&gt;</span>
      </div>
    </div>
  );
}

/* ─── Inputs ─────────────────────────────────────────────────── */
function InputsCard() {
  const States = [
    { k:'rest',     val:'',         placeholder:'לחם של שישי' },
    { k:'filled',   val:'לחם של שישי', placeholder:'' },
    { k:'focus',    val:'לחם של',     placeholder:'', dsi:'dsi-focus' },
    { k:'error',    val:'82',       placeholder:'', err:'הידרציה מקסימלית: 100%' },
    { k:'disabled', val:'',         placeholder:'לחם של שישי', disabled:true },
  ];
  return (
    <div className="ds-card">
      <h3>Input — text</h3>
      <p className="ds-blurb">Border-only by default — no fill. Focus is a darker border + halo. Errors render inline <em>only after blur</em>, never while typing.</p>

      <div className="ds-row" style={{ direction:'rtl', alignItems:'flex-start' }}>
        {States.map(s=>(
          <div key={s.k} className="ds-cell" style={{ width: 200 }}>
            <div className={s.dsi || ''} style={{ width:'100%' }}>
              <input className="input"
                style={{ borderColor: s.err ? '#A14525' : undefined }}
                value={s.val} placeholder={s.placeholder} disabled={s.disabled}
                onChange={()=>{}}/>
            </div>
            {s.err && <div style={{ font:'500 11px Rubik', color:'#A14525' }}>{s.err}</div>}
            <StateBadge kind={s.k}/>
          </div>
        ))}
      </div>

      <div className="ds-annot" style={{ marginBlock: '24px 10px' }}>Stepper (numeric)</div>
      <div className="ds-row" style={{ direction:'rtl' }}>
        <div className="ds-cell">
          <div className="card-flat" style={{ padding:'14px 16px', width: 220 }}>
            <div style={{ font:'500 12px Rubik', color:'#A6997F' }}>הידרציה</div>
            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBlockStart: 4 }}>
              <span style={{ font:'600 28px Rubik', letterSpacing:'-0.02em' }} className="num">76<span style={{ fontSize:14, color:'#A6997F', marginInlineStart:4 }}>%</span></span>
              <div style={{ display:'flex', gap: 6 }}>
                <button style={{ width:34, height:34, borderRadius:10, border:'1px solid #EDE5D2', background:'#fff' }}>−</button>
                <button style={{ width:34, height:34, borderRadius:10, border:'1px solid #EDE5D2', background:'#fff' }}>+</button>
              </div>
            </div>
          </div>
          <StateBadge label="stepper"/>
        </div>
        <div className="ds-cell">
          <div className="card-flat" style={{ padding:'14px 16px', width: 220 }}>
            <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
              <span style={{ font:'600 28px Rubik' }} className="num">100<span style={{ fontSize:14, color:'#A14525' }}>%</span></span>
            </div>
            <div className="ds-annot" style={{ marginBlockStart: 6, color:'#A14525' }}>at max — − allowed, + disabled</div>
          </div>
          <StateBadge kind="error" label="at max"/>
        </div>
      </div>

      <div className="ds-note">
        <strong>Validation timing:</strong> errors only appear after the field has been blurred (touched) AND has an invalid value. Never block typing. Errors clear instantly when the value becomes valid.
      </div>
    </div>
  );
}

/* ─── Pills / Chips ──────────────────────────────────────────── */
function PillsCard() {
  return (
    <div className="ds-card">
      <h3>Pill / Chip</h3>
      <p className="ds-blurb">Small, semantic. Status, metadata, suggestions. <strong>Never use as a tappable primary action</strong> — that's a button.</p>

      <div className="ds-annot" style={{ marginBlockEnd: 12 }}>Variants</div>
      <div className="ds-row" style={{ direction:'rtl' }}>
        {[
          { cls:'pill',         label:'~ 4 שעות',            badge:'accent (default)' },
          { cls:'pill pill-sage', label:'הושלם · קיפול 1',    badge:'sage (success)' },
          { cls:'pill pill-warn', label:'תפח יתר',            badge:'warn' },
          { cls:'pill pill-ink',  label:'בייק פעיל',          badge:'ink (high emphasis)' },
          { cls:'pill pill-ghost',label:'שלב 4 / 12',         badge:'ghost (on tinted surface)' },
        ].map(p=>(
          <div key={p.badge} className="ds-cell">
            <span className={p.cls}>{p.label}</span>
            <div className="ds-annot">{p.badge}</div>
          </div>
        ))}
      </div>

      <div className="ds-annot" style={{ marginBlock: '24px 12px' }}>Sizes</div>
      <div className="ds-row" style={{ direction:'rtl' }}>
        <div className="ds-cell"><span className="pill" style={{padding:'3px 8px', fontSize:10}}>שלי</span><div className="ds-annot">xs · 10/3·8</div></div>
        <div className="ds-cell"><span className="pill" style={{padding:'4px 10px', fontSize:11}}>~ 4 שעות</span><div className="ds-annot">sm · 11/4·10</div></div>
        <div className="ds-cell"><span className="pill">~ 4 שעות</span><div className="ds-annot">md (default) · 12/6·12</div></div>
      </div>
    </div>
  );
}

/* ─── Term ───────────────────────────────────────────────────── */
function TermCard() {
  return (
    <div className="ds-card">
      <h3>Term · inline (?)</h3>
      <p className="ds-blurb">A vocabulary marker. Hebrew terms with technical meaning (אוטוליזה, שאור, גלוטן) get a dotted underline + small (?). Tap → small popover with 1–2 sentence definition.</p>

      <div style={{ background:'#FBF7EE', borderRadius: 14, padding: 18, direction:'rtl' }}>
        <div style={{ fontSize: 14, lineHeight: 1.7, color:'#1F1A14' }}>
          הבצק עובר <window.Term title="אוטוליזה" body="מים+קמח נחים יחד">אוטוליזה</window.Term> במשך <span className="num" style={{fontFeatureSettings:'"tnum"'}}>30</span> דקות לפני שמוסיפים את ה<window.Term>שאור</window.Term>. אחר כך מתחילה ה<window.Term>תסיסה ראשונית</window.Term>.
        </div>
      </div>

      <div className="ds-annot" style={{ marginBlock: '18px 10px' }}>States</div>
      <div className="ds-row" style={{ direction:'rtl', alignItems:'flex-start' }}>
        <div className="ds-cell">
          <div style={{ width:140, padding:10 }}><window.Term>שאור</window.Term></div>
          <StateBadge kind="default"/>
        </div>
        <div className="ds-cell">
          <div style={{ width:140, padding:10 }}><span className="term" style={{ color:'#E66B3D', borderColor:'#E66B3D'}}>שאור<span className="q" style={{ background:'#E66B3D'}}>?</span></span></div>
          <StateBadge kind="hover"/>
        </div>
        <div className="ds-cell">
          <div style={{ position:'relative', width:240, height:120, padding:10 }}>
            <span className="term" style={{ color:'#E66B3D', borderColor:'#E66B3D'}}>שאור<span className="q" style={{ background:'#E66B3D'}}>?</span></span>
            <div className="popover" style={{ insetBlockStart: 36, insetInlineStart: 4 }}>
              <div className="heading">שאור · levain</div>
              הבילד הספציפי לבייק הזה. מערבבים סטארטר עם קמח ומים, ומחכים שיוכפל. עובדים איתו במקום עם הסטארטר עצמו.
            </div>
          </div>
          <StateBadge kind="default" label="open"/>
        </div>
      </div>

      <div className="ds-note">
        <strong>When to use:</strong> the FIRST time a term appears on a given screen. Not every occurrence. Bring the English alongside (e.g. ‘שאור (levain)’) the first time in copy too.
      </div>
    </div>
  );
}

/* ─── Controls — Check tile, switch, radio ───────────────────── */
function ControlsCard() {
  return (
    <div className="ds-card">
      <h3>Selection controls</h3>
      <p className="ds-blurb">Check tile is the workhorse for stage checklists. Touch target spans the whole tile, not just the box.</p>

      <div className="ds-annot" style={{ marginBlockEnd: 12 }}>Check tile · states</div>
      <div className="ds-row" style={{ direction:'rtl', alignItems:'flex-start' }}>
        {[
          { k:'rest',     checked:false },
          { k:'hover',    checked:false, sty:{ background:'#FBF7EE' } },
          { k:'checked',  checked:true },
          { k:'disabled', checked:false, sty:{ opacity:0.4 } },
        ].map(s=>(
          <div key={s.k} className="ds-cell">
            <div className={`check-tile ${s.checked ? 'is-checked' : ''}`} style={{ width: 220, ...(s.sty||{}) }}>
              <div className="box">{s.checked && <window.I.Check/>}</div>
              <div style={{ flex:1, fontSize:14, fontWeight:600 }}>הבצק תפח בכ-60%</div>
            </div>
            <StateBadge kind={s.k}/>
          </div>
        ))}
      </div>

      <div className="ds-annot" style={{ marginBlock: '24px 12px' }}>Switch · binary state</div>
      <div className="ds-row" style={{ direction:'rtl' }}>
        {[
          { on:false, k:'off' },
          { on:true,  k:'on' },
          { on:false, k:'disabled', dis:true },
        ].map((s,i)=>(
          <div key={i} className="ds-cell">
            <div style={{
              width: 50, height: 30, borderRadius: 999,
              background: s.on ? '#1F1A14' : '#DCD0B4',
              position:'relative',
              opacity: s.dis ? 0.4 : 1,
              cursor: s.dis ? 'not-allowed' : 'pointer',
              transition: 'background 200ms ease-out'
            }}>
              <span style={{
                position:'absolute', width:24, height:24, borderRadius:'50%',
                background:'#fff', insetBlockStart:3,
                insetInlineStart: s.on ? 23 : 3,
                boxShadow:'0 2px 6px rgba(0,0,0,.15)',
                transition: 'inset-inline-start 200ms ease-out'
              }}/>
            </div>
            <StateBadge kind={s.k}/>
          </div>
        ))}
      </div>

      <div className="ds-annot" style={{ marginBlock: '24px 12px' }}>Radio group · single choice</div>
      <div className="ds-row" style={{ direction:'rtl' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:8, width: 240 }}>
          {[
            { l:'אינסטינקטיבי · מבוסס הסתכלות', sel:true },
            { l:'מדויק · עם טיימרים מדויקים', sel:false },
            { l:'מקצועי · ללא רמזים', sel:false },
          ].map((o,i)=>(
            <label key={i} style={{
              display:'flex', alignItems:'center', gap:12, padding:14,
              background: o.sel ? '#FCE7D4' : '#fff',
              border:`1.5px solid ${o.sel ? '#E66B3D' : '#EDE5D2'}`,
              borderRadius:14, cursor:'pointer'
            }}>
              <span style={{
                width:20, height:20, borderRadius:'50%',
                border:`1.5px solid ${o.sel ? '#E66B3D' : '#A6997F'}`,
                background: o.sel ? '#E66B3D' : '#fff',
                position:'relative'
              }}>
                {o.sel && <span style={{ position:'absolute', inset:5, borderRadius:'50%', background:'#fff' }}/>}
              </span>
              <span style={{ fontSize: 14 }}>{o.l}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Icon library ───────────────────────────────────────────── */
function IconLibrary() {
  const I = window.I;
  const icons = [
    ['ChevronStart', 'chevron-start'],
    ['ChevronEnd',   'chevron-end'],
    ['Down',         'down'],
    ['ArrowEnd',     'arrow-end'],
    ['Menu',         'menu'],
    ['Close',        'close'],
    ['Plus',         'plus'],
    ['Check',        'check'],
    ['Bell',         'bell'],
    ['Clock',        'clock'],
    ['Sparkle',      'sparkle'],
    ['Play',         'play'],
    ['Drop',         'drop'],
    ['Thermo',       'thermo'],
    ['Camera',       'camera'],
    ['Video',        'video'],
    ['Question',     'question'],
    ['Star',         'star'],
    ['Bookmark',     'bookmark'],
    ['Lightbulb',    'lightbulb'],
    ['Bowl',         'bowl'],
    ['Jar',          'jar'],
  ];
  return (
    <div className="ds-card">
      <h3>Icons</h3>
      <p className="ds-blurb">Monoline 1.5–1.8 stroke, rounded caps/joins. Lucide-style. <strong>Directional icons auto-mirror</strong> in RTL via parent <code>dir="rtl"</code>. Default size 18px; touch targets 44px when interactive.</p>
      <div className="ds-icons">
        {icons.map(([name, kebab])=>{
          const Cmp = I[name];
          return Cmp ? (
            <div key={name} className="icn">
              <Cmp size={22}/>
              <div className="name">{kebab}</div>
            </div>
          ) : null;
        })}
      </div>
      <div className="ds-note">
        <strong>RTL note for arrows/chevrons:</strong> use <code>ChevronEnd</code> when the next action goes "forward" in reading flow. In RTL, "forward" is leftward — the icon should point left, which is what <code>ChevronEnd</code> renders. Don't manually mirror; use the right semantic icon.
      </div>
    </div>
  );
}

/* ─── Progress strips ────────────────────────────────────────── */
function ProgressCard() {
  return (
    <div className="ds-card">
      <h3>Progress</h3>
      <p className="ds-blurb">Three progress vocabularies. Use <strong>strip</strong> at the top of every stage screen.</p>

      <div className="ds-annot" style={{ marginBlockEnd: 10 }}>Strip · 12 segments</div>
      <div style={{ padding:'12px 16px', background:'#FBF7EE', borderRadius: 12 }}>
        <div className="progress-strip">
          {Array.from({length:12}).map((_,i)=>(<i key={i} className={i<3 ? 'done' : i===3 ? 'cur' : ''}/>))}
        </div>
      </div>

      <div className="ds-annot" style={{ marginBlock:'18px 10px' }}>Fold dots · sub-step progress (within a stage)</div>
      <div style={{ padding:'14px 16px', background:'#FBF7EE', borderRadius: 12, width: 360 }}>
        <div className="fold-dots">
          <div className="dot done"><window.I.Check size={12}/></div>
          <div className="line done"/>
          <div className="dot cur">2</div>
          <div className="line"/>
          <div className="dot">3</div>
          <div className="line"/>
          <div className="dot">4</div>
        </div>
      </div>

      <div className="ds-annot" style={{ marginBlock:'18px 10px' }}>Bar · within-card (e.g. overall bake %)</div>
      <div style={{ padding:'14px 16px', background:'#FBF7EE', borderRadius: 12, width: 360 }}>
        <div style={{ height: 8, background:'#FCE7D4', borderRadius: 999, overflow:'hidden' }}>
          <div style={{ width:'30%', height:'100%', background:'linear-gradient(90deg, #E66B3D, #F2BC8E)', borderRadius:999 }}/>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ButtonsCard, InputsCard, PillsCard, TermCard, ControlsCard, IconLibrary, ProgressCard });
