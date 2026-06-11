// DIRECTION B — "Modern Authority": airy, soft separators, card-driven.
function ModernHeader({ nav, active, onNav, onSearch }) {
  return (
    <header className="md-header">
      <div className="crg-wrap md-header__in">
        <div className="md-brand" onClick={() => onNav({ name: "home" })} style={{ cursor: "pointer" }}>
          <div className="md-brand__mark">
            {window.CRG_BRAND.mark.split("").map((ch, i) =>
              i === window.CRG_BRAND.markAccent
                ? <span key={i}>{ch}</span>
                : <React.Fragment key={i}>{ch}</React.Fragment>
            )}
          </div>
          <div className="md-brand__name">{window.CRG_BRAND.name}</div>
        </div>
        <nav className="md-nav">
          {nav.map((c) => (
            <a
              key={c}
              className={active === c ? "is-active" : ""}
              onClick={() => onNav(c === "Featured" ? { name: "home" } : { name: "category", cat: c })}
            >
              {c}
            </a>
          ))}
        </nav>
        <div className="md-header__right">
          <button className="md-iconbtn" onClick={onSearch} aria-label="Search">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button className="md-subscribe" onClick={() => onNav({ name: "category", cat: "Subscribe" })}>Subscribe</button>
        </div>
      </div>
    </header>
  );
}

function ModernHome({ data, onOpen }) {
  const [hero, ...rest] = data.articles;
  const cards = rest.slice(0, 6);
  const trending = data.articles.slice(0, 5);

  return (
    <div className="dir-modern">
      <div className="crg-wrap md-page">
        <div className="md-leader"><AdSlot variant="leaderboard" /></div>

        {/* hero */}
        <article className="md-hero">
          <div className="md-hero__media"><Placeholder label={hero.img} ratio="4 / 3" rounded /></div>
          <div className="md-hero__body">
            <span className="crg-kicker md-hero__kicker">{hero.kicker} · Top Story</span>
            <h2 className="md-hero__title" onClick={() => onOpen(hero)} style={{ cursor: "pointer" }}>{hero.title}</h2>
            <p className="md-hero__dek">{hero.dek}</p>
            <Byline a={hero} />
          </div>
        </article>

        <div className="md-grid">
          <div className="md-col">
            <div className="md-sectionhead">
              <span className="md-sectionhead__dot"></span>
              <h2>Latest</h2>
            </div>
            <div className="md-cards">
              {cards.map((a) => (
                <article className="md-card" key={a.id}>
                  <div className="md-card__media">
                    <Placeholder label={a.img} ratio="16 / 9" />
                    <span className="md-card__chip">{a.kicker}</span>
                  </div>
                  <div className="md-card__body">
                    <h3 className="md-card__title" onClick={() => onOpen(a)} style={{ cursor: "pointer" }}>{a.title}</h3>
                    <p className="md-card__dek">{a.dek}</p>
                    <Byline a={a} />
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="md-side">
            <div className="md-trend">
              <h3 className="md-trend__head">Trending Now</h3>
              <ol>
                {trending.map((a) => (
                  <li key={a.id}><a onClick={() => onOpen(a)} style={{ cursor: "pointer" }}>{a.title}</a></li>
                ))}
              </ol>
            </div>
            <Newsletter compact />
            <div className="md-side__sticky"><AdSlot variant="box" /></div>
          </aside>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { ModernHeader, ModernHome });
