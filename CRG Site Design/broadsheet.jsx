// DIRECTION A — "The Broadsheet": traditional, hard-ruled, dense front page.
const { useState: useStateBS } = React;

function BroadsheetHeader({ nav, active, onNav, onSearch }) {
  const today = "Monday, June 1, 2026";
  return (
    <header className="dir-broadsheet__header">
      <div className="bs-ribbon">
        <div className="crg-wrap bs-ribbon__in">
          <span className="bs-ribbon__date">{today}</span>
          <div className="bs-ribbon__right">
            <button onClick={onSearch} aria-label="Search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Search
            </button>
            <button onClick={() => onNav({ name: "category", cat: "Subscribe" })}>Sign In</button>
          </div>
        </div>
      </div>

      <div className="crg-wrap">
        <div className="bs-masthead">
          <div className="bs-masthead__rule"><span className="bs-masthead__star">★ ★ ★</span></div>
          <h1 className="bs-masthead__name" onClick={() => onNav({ name: "home" })} style={{ cursor: "pointer" }}>
            {window.CRG_BRAND.name}
          </h1>
          <div className="bs-masthead__tag">{window.CRG_BRAND.tagline}</div>
        </div>
      </div>

      <nav className="bs-nav">
        <div className="crg-wrap bs-nav__in">
          {nav.map((c) => (
            <a
              key={c}
              className={active === c ? "is-active" : ""}
              onClick={() => onNav(c === "Featured" ? { name: "home" } : { name: "category", cat: c })}
            >
              {c}
            </a>
          ))}
          <a onClick={() => onNav({ name: "category", cat: "About" })}>About</a>
        </div>
      </nav>
    </header>
  );
}

function BroadsheetHome({ data, onOpen }) {
  const [lead, ...rest] = data.articles;
  const secondary = rest.slice(0, 2);
  const river = rest.slice(2, 7);
  const mostRead = data.articles.slice(0, 5);

  return (
    <div className="dir-broadsheet">
      <div className="bs-leader">
        <div className="crg-wrap"><AdSlot variant="leaderboard" /></div>
      </div>

      <div className="crg-wrap bs-front">
        {/* main column */}
        <div className="bs-main">
          <article className="bs-lead">
            <span className="crg-kicker bs-lead__kicker">{lead.kicker}</span>
            <h2 className="bs-lead__title" onClick={() => onOpen(lead)} style={{ cursor: "pointer" }}>{lead.title}</h2>
            <div className="bs-lead__img"><Placeholder label={lead.img} ratio="40 / 21" /></div>
            <p className="bs-lead__dek">{lead.dek}</p>
            <Byline a={lead} />
          </article>

          <div className="bs-sec">
            {secondary.map((a) => (
              <article className="bs-story" key={a.id}>
                <div className="bs-story__img"><Placeholder label={a.img} ratio="3 / 2" /></div>
                <span className="crg-kicker bs-story__kicker">{a.kicker}</span>
                <h3 className="bs-story__title" onClick={() => onOpen(a)} style={{ cursor: "pointer" }}>{a.title}</h3>
                <p className="bs-story__dek">{a.dek}</p>
                <Byline a={a} />
              </article>
            ))}
          </div>

          <section className="bs-river">
            <div className="bs-river__head">More From the Newsroom</div>
            {river.map((a) => (
              <article className="bs-riveritem" key={a.id}>
                <Placeholder label={a.kicker} ratio="3 / 2" />
                <div>
                  <span className="crg-kicker">{a.kicker}</span>
                  <h3 className="bs-riveritem__title" onClick={() => onOpen(a)} style={{ cursor: "pointer" }}>{a.title}</h3>
                  <p className="bs-riveritem__dek">{a.dek}</p>
                </div>
              </article>
            ))}
          </section>
        </div>

        {/* aside */}
        <aside className="bs-aside">
          <div className="bs-widget">
            <AdSlot variant="box" />
          </div>
          <div className="bs-widget">
            <div className="bs-widget__head">Most Read</div>
            <ol className="bs-mostread">
              {mostRead.map((a) => (
                <li key={a.id}><a onClick={() => onOpen(a)} style={{ cursor: "pointer" }}>{a.title}</a></li>
              ))}
            </ol>
          </div>
          <div className="bs-widget">
            <Newsletter compact />
          </div>
          <div className="bs-widget" style={{ position: "sticky", top: "88px" }}>
            <AdSlot variant="halfpage" />
          </div>
        </aside>
      </div>
    </div>
  );
}

Object.assign(window, { BroadsheetHeader, BroadsheetHome });
