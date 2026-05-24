// Kikar DS — Tokens (Colors, Type, Spacing, Radius, Shadow, Motion)
const { useState: useStateT } = React;

/* ─── Color palette ──────────────────────────────────────────── */
function ColorPalette() {
  const groups = [
    {
      title: "Surfaces",
      items: [
        { name:"bg",       hex:"#F8F5EE", v:"--bg",       use:"page background, default phone bg" },
        { name:"bg-2",     hex:"#F2EAD8", v:"--bg-2",     use:"raised section, dough tint" },
        { name:"paper",    hex:"#FFFFFF", v:"--paper",    use:"card surface, elevated content" },
        { name:"line",     hex:"#EDE5D2", v:"--line",     use:"subtle dividers, default border" },
        { name:"line-2",   hex:"#DCD0B4", v:"--line-2",   use:"stronger divider, input border" },
      ]
    },
    {
      title: "Ink (text)",
      items: [
        { name:"ink",   hex:"#1F1A14", v:"--ink",   use:"primary text, primary CTA bg" },
        { name:"ink-2", hex:"#6E6457", v:"--ink-2", use:"secondary text" },
        { name:"ink-3", hex:"#A6997F", v:"--ink-3", use:"placeholders, metadata" },
      ]
    },
    {
      title: "Accent — Clay (primary action, current step)",
      items: [
        { name:"accent",     hex:"#E66B3D", v:"--accent",     use:"CTA, current stage marker" },
        { name:"accent-2",   hex:"#F2BC8E", v:"--accent-2",   use:"gradient highlights" },
        { name:"accent-bg",  hex:"#FCE7D4", v:"--accent-bg",  use:"pill bg, soft hint surface" },
      ]
    },
    {
      title: "Sage — secondary (success, checked)",
      items: [
        { name:"sage",     hex:"#BFC7A0", v:"--sage",     use:"check-tile border when checked" },
        { name:"sage-2",   hex:"#8C9963", v:"--sage-2",   use:"text on sage surfaces" },
        { name:"sage-bg",  hex:"#ECEFDC", v:"--sage-bg",  use:"success pill, checked tile bg" },
      ]
    },
    {
      title: "Status",
      items: [
        { name:"warn",       hex:"#D38D1B", v:"--warn",       use:"warnings (timer near end)" },
        { name:"warn-bg",    hex:"#FBEFD0", v:"--warn-bg",    use:"warning surface" },
        { name:"danger",     hex:"#A14525", v:null,           use:"errors, destructive" },
        { name:"danger-bg",  hex:"#F8D8CE", v:null,           use:"error surface" },
      ]
    },
  ];
  return (
    <div className="ds-card">
      <h3>Color</h3>
      <p className="ds-blurb">A warm, low-saturation palette built around clay + cream. Accent (clay) carries every active state. Sage is the only secondary — used for ‘good’ / checked.</p>
      {groups.map((g,i)=>(
        <div key={i} style={{ marginBlockStart: i===0 ? 0 : 24 }}>
          <div className="ds-annot" style={{ marginBlockEnd: 10 }}>{g.title}</div>
          <div className="ds-grid-6">
            {g.items.map(c=>(
              <div key={c.name} className="ds-swatch">
                <div className="chip" style={{ background: c.hex }}/>
                <div className="meta">
                  <div className="name">{c.name}</div>
                  <div className="hex">{c.hex}</div>
                  {c.v && <div className="var">{c.v}</div>}
                  <div className="use">{c.use}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Type ramp ──────────────────────────────────────────────── */
function TypeRamp() {
  const rows = [
    { k:'display-lg',  size:36, lh:1.05, w:600, t:'-0.025em', sample:'מה אופים היום?', use:'hero on home' },
    { k:'display-md',  size:28, lh:1.1,  w:600, t:'-0.025em', sample:'תסיסה ראשונית.', use:'stage titles' },
    { k:'display-sm',  size:22, lh:1.15, w:600, t:'-0.02em',  sample:'כפרי קלאסי', use:'card titles' },
    { k:'heading',     size:17, lh:1.3,  w:700, t:'-0.015em', sample:'הבצק שלי לא תופח', use:'sheet titles' },
    { k:'body-lg',     size:16, lh:1.5,  w:400, sample:'הבצק מתחיל לחיות. כל 30 דקות מבצעים קיפול.', use:'instruction body' },
    { k:'body',        size:14, lh:1.5,  w:400, sample:'הקיפול בונה חוזק בלי לישה אגרסיבית.', use:'card body' },
    { k:'label',       size:14, lh:1.4,  w:500, sample:'התחל אפייה חדשה', use:'buttons, list rows' },
    { k:'small',       size:12, lh:1.45, w:500, sample:'הוזן לפני 8 שעות · פעיל', use:'captions' },
    { k:'tiny',        size:11, lh:1.4,  w:500, sample:'STAGE 04 / 12', use:'metadata, footer chips' },
    { k:'eyebrow',     size:11, lh:1,    w:600, t:'0.08em', upper:true, sample:'מה לעשות', use:'section eyebrows' },
    { k:'mono-sm',     size:11, lh:1.4,  w:500, mono:true, sample:'07:14 → 11:30', use:'numeric tags, timers' },
  ];
  return (
    <div className="ds-card">
      <h3>Typography</h3>
      <p className="ds-blurb">Rubik throughout — full Hebrew + Latin coverage, slightly rounded, modern but warm. JetBrains Mono for numerics that need to feel like instruments (timers, time-of-day, percentages in metadata).</p>
      <div>
        {rows.map(r=>(
          <div key={r.k} className="ds-type-row">
            <div className="ds-label-col">
              <div style={{ font:'700 12px Rubik', color:'#1F1A14' }}>{r.k}</div>
              <div style={{ font:'500 10px "JetBrains Mono", monospace', color:'#A6997F', marginBlockStart:2 }}>{r.use}</div>
            </div>
            <div className="ds-spec">
              {r.size}px · lh {r.lh} · {r.w}<br/>
              {r.t && `track ${r.t}`}{r.t && r.upper && ' · '}{r.upper && 'UPPER'}<br/>
              {r.mono ? "family: mono" : ""}
            </div>
            <div className="ds-sample" style={{
              fontFamily: r.mono ? "'JetBrains Mono', monospace" : "'Rubik', sans-serif",
              fontSize: r.size,
              lineHeight: r.lh,
              fontWeight: r.w,
              letterSpacing: r.t || 'normal',
              textTransform: r.upper ? 'uppercase' : 'none',
              color: '#1F1A14',
              direction: 'rtl',
              textAlign: 'start',
            }}>
              {r.sample}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Spacing scale ──────────────────────────────────────────── */
function SpacingScale() {
  const scale = [
    {l:'0',  v:0  },
    {l:'1',  v:4  },
    {l:'2',  v:8  },
    {l:'3',  v:12 },
    {l:'4',  v:16, hint:'default screen inline padding' },
    {l:'5',  v:20 },
    {l:'6',  v:24, hint:'section gap' },
    {l:'8',  v:32 },
    {l:'10', v:40 },
    {l:'12', v:48 },
    {l:'16', v:64 },
  ];
  return (
    <div className="ds-card">
      <h3>Spacing</h3>
      <p className="ds-blurb">4-px base. Use named steps, not arbitrary pixels. Inline padding on a phone screen is <strong>16px (4)</strong> by default; sections gap <strong>24px (6)</strong>.</p>
      <div className="ds-spacing">
        {scale.map(s=>(
          <div key={s.l} className="ds-cell">
            <div className="bar" style={{ height: s.v + 8 }}/>
            <div className="l">{s.l}</div>
            <div className="v">{s.v}px</div>
          </div>
        ))}
      </div>
      <div className="ds-note">
        <strong>RTL note:</strong> always use logical properties — <code style={{font:'500 11px "JetBrains Mono"', color:'#B16A39'}}>padding-inline-start</code>, <code style={{font:'500 11px "JetBrains Mono"', color:'#B16A39'}}>margin-block-end</code>, Tailwind <code style={{font:'500 11px "JetBrains Mono"', color:'#B16A39'}}>ps-4 me-2</code>. Never <code style={{font:'500 11px "JetBrains Mono"', color:'#A14525'}}>pl-/ml-/left/right</code>.
      </div>
    </div>
  );
}

/* ─── Radius + Shadow ────────────────────────────────────────── */
function RadiusShadow() {
  const radii = [
    { name:'xs',   v:6,  use:'tags, small chips' },
    { name:'sm',   v:10, use:'compact controls' },
    { name:'md',   v:14, use:'inputs, secondary cards' },
    { name:'lg',   v:18, use:'check tiles' },
    { name:'xl',   v:22, use:'buttons, tab bar' },
    { name:'2xl',  v:24, use:'primary cards' },
    { name:'3xl',  v:28, use:'bottom sheet top corners' },
  ];
  const shadows = [
    { name:'sm',   css:'0 1px 0 rgba(31,26,20,.04), 0 4px 12px rgba(31,26,20,.04)',  use:'subtle lift' },
    { name:'md',   css:'0 1px 0 rgba(31,26,20,.04), 0 6px 24px rgba(31,26,20,.06)',  use:'default card' },
    { name:'lg',   css:'0 1px 0 rgba(31,26,20,.04), 0 16px 40px rgba(31,26,20,.10)', use:'hover / focus card' },
    { name:'cta',  css:'0 1px 0 rgba(0,0,0,.06), 0 10px 24px rgba(230,107,61,.32)',  use:'accent CTA' },
    { name:'sheet',css:'0 -10px 40px rgba(0,0,0,.18)',                                use:'bottom sheet' },
  ];
  return (
    <div className="ds-card">
      <h3>Radius &amp; Shadow</h3>
      <p className="ds-blurb">Generous corners are core to the visual language — <strong>cards at 24px, buttons at 22px</strong>. Shadows are restrained, low-contrast, never harsh.</p>

      <div className="ds-annot" style={{ marginBlockEnd: 12 }}>Radius</div>
      <div className="ds-grid-4 ds-radius">
        {radii.map(r=>(
          <div key={r.name} className="ds-cell" style={{ alignItems:'center' }}>
            <div className="demo" style={{ borderRadius: r.v }}/>
            <div style={{ font:'600 12px Rubik' }}>{r.name}</div>
            <div className="ds-annot">{r.v}px · {r.use}</div>
          </div>
        ))}
      </div>

      <div className="ds-annot" style={{ marginBlock: '24px 12px' }}>Shadow</div>
      <div className="ds-grid-4 ds-shadow" style={{ background:'#F2EAD8', padding: '24px 18px', borderRadius: 14 }}>
        {shadows.map(s=>(
          <div key={s.name} className="ds-cell" style={{ alignItems:'center' }}>
            <div className="demo" style={{ boxShadow: s.css, background: s.name==='cta' ? '#E66B3D' : '#fff' }}/>
            <div style={{ font:'600 12px Rubik' }}>{s.name}</div>
            <div className="ds-annot">{s.use}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Motion ─────────────────────────────────────────────────── */
function MotionTokens() {
  const ds = [
    { n:'instant',    v:'0ms',    use:'state changes, no animation' },
    { n:'fast',       v:'120ms',  use:'press / hover transitions' },
    { n:'base',       v:'200ms',  use:'default UI transitions' },
    { n:'slow',       v:'300ms',  use:'modal / sheet entry' },
    { n:'deliberate', v:'450ms',  use:'reveal / orchestration' },
  ];
  const es = [
    { n:'out',     v:'cubic-bezier(0.22, 1, 0.36, 1)',  use:'default — feels confident' },
    { n:'in-out',  v:'cubic-bezier(0.4, 0, 0.2, 1)',    use:'fades, content swaps' },
    { n:'spring',  v:'cubic-bezier(0.34, 1.56, 0.64, 1)', use:'release after swipe (slight overshoot)' },
  ];
  const ps = [
    { n:'press',          v:'scale(0.965) 120ms ease-out',  use:'tap feedback on any button/card' },
    { n:'spring-release', v:'250ms spring',                 use:'after swipe gesture release' },
    { n:'sheet-open',     v:'300ms ease-out',               use:'bottom sheet entry' },
    { n:'fade',           v:'200ms in-out',                 use:'opacity transitions' },
  ];
  return (
    <div className="ds-card">
      <h3>Motion</h3>
      <p className="ds-blurb">Calm and consistent. <strong>Tap feedback is always <code>scale(0.965)</code> over 120ms</strong>. Respect <code>prefers-reduced-motion</code> — disable transforms when set.</p>

      <div className="ds-annot" style={{ marginBlockEnd: 10 }}>Durations</div>
      <div className="ds-grid-3">
        {ds.map(d=>(
          <div key={d.n} className="ds-motion-card">
            <div className="swatch"/>
            <div>
              <div className="name">{d.n}</div>
              <div className="val">{d.v}</div>
              <div className="val" style={{color:'#A6997F'}}>{d.use}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ds-annot" style={{ marginBlock: '24px 10px' }}>Easing</div>
      <div className="ds-grid-3">
        {es.map(d=>(
          <div key={d.n} className="ds-motion-card">
            <div className="swatch" style={{ background:'linear-gradient(135deg, #BFC7A0, #8C9963)' }}/>
            <div>
              <div className="name">{d.n}</div>
              <div className="val">{d.v}</div>
              <div className="val" style={{color:'#A6997F'}}>{d.use}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ds-annot" style={{ marginBlock: '24px 10px' }}>Patterns</div>
      <div className="ds-grid-3">
        {ps.map(p=>(
          <div key={p.n} className="ds-motion-card">
            <div className="swatch" style={{ background:'linear-gradient(135deg, #1F1A14, #6E6457)' }}/>
            <div>
              <div className="name">{p.n}</div>
              <div className="val">{p.v}</div>
              <div className="val" style={{color:'#A6997F'}}>{p.use}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ds-note">
        <strong>prefers-reduced-motion:</strong> when set, durations → <code>0ms</code> and transforms are removed. The design still works without animation.
      </div>
    </div>
  );
}

Object.assign(window, { ColorPalette, TypeRamp, SpacingScale, RadiusShadow, MotionTokens });
