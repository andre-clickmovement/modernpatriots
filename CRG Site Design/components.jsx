// Shared primitives for both design directions.
// Exported to window at the bottom so other Babel scripts can use them.
const { useState, useEffect, useRef } = React;

/* ----------------------------------------------------------------------------
   Image placeholder — striped SVG with a monospace caption telling the editor
   what photo belongs here. (No real photography in the prototype.)
---------------------------------------------------------------------------- */
function Placeholder({ label, ratio = "16 / 9", rounded = false, dark = false }) {
  const fg = dark ? "rgba(255,255,255,.16)" : "rgba(15,28,58,.10)";
  const bg = dark ? "#101b32" : "#eef1f6";
  const stripes =
    `repeating-linear-gradient(45deg, ${fg} 0 1px, transparent 1px 11px)`;
  return (
    <div
      className="crg-ph"
      style={{
        aspectRatio: ratio,
        background: `${bg}`,
        backgroundImage: stripes,
        borderRadius: rounded ? "6px" : 0,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "flex-end",
        width: "100%",
      }}
    >
      <span
        style={{
          font: "600 10px/1 var(--font-ui)",
          letterSpacing: ".09em",
          textTransform: "uppercase",
          color: dark ? "rgba(255,255,255,.55)" : "rgba(15,28,58,.5)",
          background: dark ? "rgba(0,0,0,.35)" : "rgba(255,255,255,.78)",
          padding: "5px 8px",
          margin: "10px",
          borderRadius: "3px",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   AdSense slot — labeled placeholder for a Google AdSense unit.
   variant: "leaderboard" | "box" | "inline" | "halfpage"
---------------------------------------------------------------------------- */
const AD_SIZES = {
  leaderboard: { label: "Leaderboard \u00b7 728\u00d790", h: 90, max: 728 },
  inline: { label: "In-Article \u00b7 responsive", h: 124, max: 680 },
  box: { label: "Medium Rectangle \u00b7 300\u00d7250", h: 250, max: 300 },
  halfpage: { label: "Half Page \u00b7 300\u00d7600", h: 600, max: 300 },
};
function AdSlot({ variant = "box", sticky = false }) {
  const s = AD_SIZES[variant] || AD_SIZES.box;
  return (
    <div
      className="crg-ad"
      data-ad={variant}
      style={{
        position: sticky ? "sticky" : "static",
        top: sticky ? "92px" : "auto",
        width: "100%",
        maxWidth: s.max,
        margin: "0 auto",
      }}
    >
      <div className="crg-ad__tag">Advertisement</div>
      <div className="crg-ad__box" style={{ minHeight: s.h }}>
        <div className="crg-ad__inner">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3v18M3 12h18" stroke="currentColor" strokeWidth="1.2" opacity=".35" />
            <rect x="3.5" y="3.5" width="17" height="17" rx="2" stroke="currentColor" strokeWidth="1.2" opacity=".35" />
          </svg>
          <span className="crg-ad__size">{s.label}</span>
          <span className="crg-ad__by">Google AdSense</span>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Byline — author + date + read time, used in both directions.
---------------------------------------------------------------------------- */
function Byline({ a, className = "" }) {
  return (
    <div className={"crg-byline " + className}>
      <span className="crg-byline__by">By {a.author}</span>
      <span className="crg-byline__dot">·</span>
      <span>{a.date}</span>
      {a.readMins ? (
        <>
          <span className="crg-byline__dot">·</span>
          <span>{a.readMins} min read</span>
        </>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Search overlay — shared modal triggered from either header.
---------------------------------------------------------------------------- */
function SearchOverlay({ open, onClose }) {
  const inputRef = useRef(null);
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  if (!open) return null;
  const data = window.CRG_DATA;
  return (
    <div className="crg-search" onMouseDown={onClose}>
      <div className="crg-search__panel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="crg-search__row">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <input ref={inputRef} placeholder={"Search " + window.CRG_BRAND.name + "\u2026"} />
          <button onClick={onClose} aria-label="Close search">Esc</button>
        </div>
        <div className="crg-search__hint">Popular</div>
        <ul className="crg-search__list">
          {data.articles.slice(0, 5).map((a) => (
            <li key={a.id}>
              <span className="crg-search__cat">{a.kicker}</span>
              {a.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------------------
   Newsletter signup block — shared.
---------------------------------------------------------------------------- */
function Newsletter({ compact = false }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  return (
    <div className={"crg-news" + (compact ? " crg-news--compact" : "")}>
      <div className="crg-news__eyebrow">Daily Briefing</div>
      <h3 className="crg-news__title">Get the headlines that matter, every morning.</h3>
      {!compact && (
        <p className="crg-news__sub">Join our mailing list for a free daily digest of the day\u2019s top stories.</p>
      )}
      {done ? (
        <div className="crg-news__done">✓ You’re subscribed. Check your inbox.</div>
      ) : (
        <form
          className="crg-news__form"
          onSubmit={(e) => { e.preventDefault(); if (email) setDone(true); }}
        >
          <input
            type="email"
            required
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Subscribe</button>
        </form>
      )}
    </div>
  );
}

Object.assign(window, { Placeholder, AdSlot, Byline, SearchOverlay, Newsletter });
