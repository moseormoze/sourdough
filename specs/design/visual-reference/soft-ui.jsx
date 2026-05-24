// Kikar Soft — primitives (Phone, education + media components)
const { useState, useRef, useEffect } = React;

/* ─── Status bar ─────────────────────────────────────────────── */
function Status({ time = "9:24", dark }) {
  const c = dark ? '#F3E9D4' : '#1F1A14';
  return (
    <div className="s-status" style={{color:c}}>
      <span>{time}</span>
      <span className="cluster">
        <svg width="18" height="11" viewBox="0 0 18 11"><g fill={c}><rect x="0" y="7" width="3" height="4" rx=".5"/><rect x="5" y="5" width="3" height="6" rx=".5"/><rect x="10" y="3" width="3" height="8" rx=".5"/><rect x="15" y="1" width="3" height="10" rx=".5"/></g></svg>
        <svg width="14" height="11" viewBox="0 0 14 11" fill="none"><path d="M7 9.5C8.4 8 9.7 7.2 11 7.2c1.3 0 2.6.8 4 2.3M3 6C4.9 4 6.7 3 9.4 3 12 3 13.8 4 15.7 6" stroke={c} strokeWidth="1.2" strokeLinecap="round" transform="translate(-1, 0)"/></svg>
        <span style={{width:26, height:12, border:`1.2px solid ${c}`, borderRadius:3, padding:'1.5px', display:'inline-block', position:'relative'}}>
          <span style={{display:'block', height:'100%', width:'78%', background:c, borderRadius:1}}/>
          <span style={{position:'absolute', insetInlineEnd:-3, top:3, width:1.5, height:4, background:c, borderRadius:'0 1px 1px 0'}}/>
        </span>
      </span>
    </div>
  );
}

/* ─── Phone frame ────────────────────────────────────────────── */
function Phone({ height = 812, children, dark, style, label }) {
  return (
    <div className={`s-phone ${dark ? 'dark' : ''}`} style={{ height, ...style }} data-screen-label={label}>
      <Status dark={dark}/>
      {children}
    </div>
  );
}

/* ─── Icon set (Lucide-style strokes) ────────────────────────── */
const I = {
  ChevronEnd:  (p)=> <svg {...p} width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ChevronStart:(p)=> <svg {...p} width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Down:        (p)=> <svg {...p} width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  ArrowEnd:    (p)=> <svg {...p} width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none"><path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Menu:        (p)=> <svg {...p} width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none"><path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  Close:       (p)=> <svg {...p} width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  Plus:        (p)=> <svg {...p} width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  Check:       (p)=> <svg {...p} width={p.size||14} height={p.size||14} viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Bell:        (p)=> <svg {...p} width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none"><path d="M6 16h12l-1.5-2v-3a4.5 4.5 0 00-9 0v3L6 16zM10 19a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Clock:       (p)=> <svg {...p} width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5"/><path d="M12 8v4l2.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>,
  Sparkle:     (p)=> <svg {...p} width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none"><path d="M12 4l1.4 4.6L18 10l-4.6 1.4L12 16l-1.4-4.6L6 10l4.6-1.4L12 4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  Play:        (p)=> <svg {...p} width={p.size||22} height={p.size||22} viewBox="0 0 24 24" fill="none"><path d="M8 5l12 7-12 7V5z" fill="currentColor"/></svg>,
  Drop:        (p)=> <svg {...p} width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none"><path d="M12 3.5s-6 6.4-6 11a6 6 0 0012 0c0-4.6-6-11-6-11z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  Thermo:      (p)=> <svg {...p} width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none"><path d="M14 4.5a2 2 0 10-4 0v9.2a4 4 0 104 0V4.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  Camera:      (p)=> <svg {...p} width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M8 6l1.5-2h5L16 6" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  Video:       (p)=> <svg {...p} width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M17 10l4-2v8l-4-2V10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  Question:    (p)=> <svg {...p} width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/><path d="M9.5 9.5a2.5 2.5 0 015 0c0 1.5-2.5 2-2.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill="currentColor"/></svg>,
  Star:        (p)=> <svg {...p} width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none"><path d="M12 3l2.6 5.5 6 .9-4.3 4.3 1 6-5.3-2.9-5.3 2.9 1-6L3.4 9.4l6-.9L12 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>,
  Bookmark:    (p)=> <svg {...p} width={p.size||16} height={p.size||16} viewBox="0 0 24 24" fill="none"><path d="M6 4h12v17l-6-4-6 4V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  Lightbulb:   (p)=> <svg {...p} width={p.size||18} height={p.size||18} viewBox="0 0 24 24" fill="none"><path d="M9 17h6m-5 3h4M9 12a6 6 0 116 0c0 1.5-1 2.5-1.5 3.5h-3C10 14.5 9 13.5 9 12z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>,
  Bowl:        (p)=> <svg {...p} width={p.size||24} height={p.size||24} viewBox="0 0 24 24" fill="none"><path d="M3 11h18l-2 7a3 3 0 01-3 2H8a3 3 0 01-3-2L3 11z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><path d="M3 11c0-2 4-3 9-3s9 1 9 3" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Jar:         (p)=> <svg {...p} width={p.size||20} height={p.size||20} viewBox="0 0 24 24" fill="none"><rect x="7" y="3" width="10" height="3" rx="1" stroke="currentColor" strokeWidth="1.5"/><path d="M8 6v12a4 4 0 008 0V6" stroke="currentColor" strokeWidth="1.5"/><circle cx="11" cy="14" r="1.4" stroke="currentColor" strokeWidth="1.2"/><circle cx="14" cy="11" r="1" stroke="currentColor" strokeWidth="1.2"/></svg>,
};

/* ─── Term with (?) — inline tooltip ─────────────────────────── */
function Term({ children, title, body, mark = "?" }) {
  return (
    <span className="term">
      {children}
      <span className="q" aria-label={`הסבר: ${title}`}>{mark}</span>
    </span>
  );
}

/* ─── Expandable ─────────────────────────────────────────────── */
function Expand({ title, children, defaultOpen = false, tone = "accent" }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`expand ${open ? 'open' : ''}`}>
      <div className="head" onClick={()=>setOpen(o=>!o)}>
        <span style={{display:'inline-flex', alignItems:'center', gap:8}}>
          {tone==='accent' && <I.Sparkle size={16}/>}
          {tone==='question' && <I.Question size={16}/>}
          {title}
        </span>
        <span className="icn"><I.Down size={16}/></span>
      </div>
      {open && <div className="body">{children}</div>}
    </div>
  );
}

/* ─── Photo placeholder ──────────────────────────────────────── */
function Photo({ tone="dough", caption, tag, aspect="16/10", overlay, h }) {
  return (
    <div className={`photo photo-${tone}`} style={{ aspectRatio: aspect, height: h }}>
      {tag && <span className="tag-tl">{tag}</span>}
      {overlay}
      {caption && <span className="caption">{caption}</span>}
    </div>
  );
}

/* ─── Reference gallery ──────────────────────────────────────── */
function RefGallery({ items }) {
  return (
    <div className="gallery">
      {items.map((it, i)=>(
        <div key={i} className="cell card-flat" style={{ borderRadius: 14 }}>
          {it.label && <span className={`label ${it.kind || ''}`}>{it.label}</span>}
          <Photo tone={it.tone} aspect="1/1"/>
          <div className="caption-inline">{it.text}</div>
        </div>
      ))}
    </div>
  );
}

/* ─── Video card ─────────────────────────────────────────────── */
function VideoCard({ tone="fold", title, source, duration="2:14", chapters }) {
  return (
    <div className="video card">
      <div className="frame">
        <div className={`photo photo-${tone}`} style={{ aspectRatio:'16/9', position:'absolute', inset:0 }}/>
        <div className="play">
          <div className="btn-circle"><I.Play size={26} style={{color:'#1F1A14', marginInlineStart: 3}}/></div>
        </div>
        <div className="src">{source}</div>
        <div className="duration">{duration}</div>
      </div>
      <div className="meta">
        <div style={{flex:1}}>
          <div className="title">{title}</div>
          <div className="sub" style={{marginTop:2}}>{chapters?.length || 0} פרקים · YouTube</div>
        </div>
        <button className="btn btn-soft btn-sm" style={{width:'auto', minHeight:36}}>
          <I.Bookmark size={14}/> שמור
        </button>
      </div>
      {chapters && (
        <div className="chapters">
          {chapters.map((c, i)=>(
            <div key={i} className={`chapter ${c.current ? 'current' : ''}`}>
              <span className="time">{c.t}</span>
              <span>{c.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Questions list ─────────────────────────────────────────── */
function Questions({ heading="שאלות נפוצות בשלב הזה", items, onOpen }) {
  return (
    <div className="questions">
      <div className="heading">
        <h3>{heading}</h3>
        <span className="count"><span className="num">{items.length}</span> שאלות</span>
      </div>
      {items.map((q, i)=>(
        <div key={i} className="q-row" onClick={()=>onOpen?.(q)}>
          <div className={`icn ${q.tone || ''}`}>{q.icon || '?'}</div>
          <div className="text">{q.q}</div>
          <I.ChevronStart size={18}/>
        </div>
      ))}
    </div>
  );
}

/* ─── Bottom Sheet ───────────────────────────────────────────── */
function BottomSheet({ title, children, height='66%', onClose, showScrim=true }) {
  return (
    <>
      {showScrim && <div className="scrim" onClick={onClose}/>}
      <div className="sheet" style={{maxHeight: height}}>
        <div className="grip"/>
        <div className="head">
          <div className="title">{title}</div>
          <button className="close" onClick={onClose}><I.Close/></button>
        </div>
        <div className="body" style={{maxHeight: `calc(${height} - 80px)`}}>
          {children}
        </div>
      </div>
    </>
  );
}

/* ─── Pre-stage briefing card ────────────────────────────────── */
function Briefing({ heading, blurb, takeaways }) {
  return (
    <div className="card-tint" style={{ padding: 18 }}>
      <div className="eyebrow" style={{color:'#8A4F25'}}>בקצרה · על השלב</div>
      <div className="display" style={{ fontSize: 17, lineHeight: 1.3, marginBlock: '8px 8px' }}>{heading}</div>
      <div style={{ fontSize: 14, lineHeight: 1.5, color:'var(--ink)' }}>{blurb}</div>
      {takeaways && (
        <div style={{ marginBlockStart: 14, display:'flex', flexDirection:'column', gap:6 }}>
          {takeaways.map((t,i)=>(
            <div key={i} style={{ display:'flex', gap:8, alignItems:'flex-start', fontSize:13, color:'var(--ink)' }}>
              <span style={{ flex:'0 0 6px', width:6, height:6, borderRadius:'50%', background:'var(--accent)', marginBlockStart:7 }}/>
              <span>{t}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Expert tip ─────────────────────────────────────────────── */
function ExpertTip({ name, role, quote }) {
  return (
    <div className="card-sage" style={{ padding: 18 }}>
      <div style={{ display:'flex', alignItems:'center', gap: 12, marginBlockEnd: 10 }}>
        <div style={{ width:40, height:40, borderRadius:'50%', background:'linear-gradient(135deg, #BFC7A0, #6B7438)', display:'grid', placeItems:'center', color:'#fff', font:'700 16px Rubik' }}>
          {name[0]}
        </div>
        <div>
          <div style={{ font:'600 14px Rubik' }}>{name}</div>
          <div style={{ font:'500 11px Rubik', color:'var(--sage-2)' }}>{role}</div>
        </div>
        <span className="pill pill-sage" style={{ marginInlineStart:'auto' }}>טיפ מומחה</span>
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.5, fontStyle:'italic', color:'var(--ink)' }}>
        ״{quote}״
      </div>
    </div>
  );
}

/* ─── Section eyebrow ────────────────────────────────────────── */
function SectionHead({ children, action }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'0 20px', marginBlockEnd: 10 }}>
      <div className="eyebrow">{children}</div>
      {action}
    </div>
  );
}

Object.assign(window, {
  Status, Phone, I, Term, Expand, Photo, RefGallery, VideoCard, Questions, BottomSheet,
  Briefing, ExpertTip, SectionHead,
});
