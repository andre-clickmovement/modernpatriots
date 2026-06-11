// Shared views: Article reading page, Category index, Footer.

function Footer({ nav, onNav }) {
  return (
    <footer className="crg-footer">
      <div className="crg-wrap crg-footer__top">
        <div>
          <p className="crg-footer__brand">
            {window.CRG_BRAND.name.split(" ").map((w, i) => (
              <React.Fragment key={i}>
                {i > 0 ? " " : ""}
                {i === window.CRG_BRAND.footerAccentWord ? <span>{w}</span> : w}
              </React.Fragment>
            ))}
          </p>
          <p className="crg-footer__blurb">Independent reporting on the stories shaping the nation. Researched, written, and published daily.</p>
        </div>
        <div className="crg-footer__col">
          <h4>Sections</h4>
          <ul>
            {nav.map((c) => (
              <li key={c}><a onClick={() => onNav(c === "Featured" ? { name: "home" } : { name: "category", cat: c })} style={{ cursor: "pointer" }}>{c}</a></li>
            ))}
          </ul>
        </div>
        <div className="crg-footer__col">
          <h4>Company</h4>
          <ul>
            <li><a>About Us</a></li>
            <li><a>Contact</a></li>
            <li><a>Subscribe</a></li>
            <li><a>Report Spam</a></li>
          </ul>
        </div>
        <div className="crg-footer__col">
          <h4>Legal</h4>
          <ul>
            <li><a>Privacy Policy</a></li>
            <li><a>Terms of Use</a></li>
            <li><a>Editorial Standards</a></li>
          </ul>
        </div>
      </div>
      <div className="crg-wrap crg-footer__bar">
        <span>© 2026 {window.CRG_BRAND.name}. All Rights Reserved.</span>
        <span>Made for readers, not algorithms.</span>
      </div>
    </footer>
  );
}

function ShareRow() {
  const icons = [
    { k: "x", path: "M4 4l16 16M20 4L4 20" },
    { k: "fb", path: "M13 6h3V3h-3a4 4 0 00-4 4v2H6v3h3v8h3v-8h3l1-3h-4V7a1 1 0 011-1z" },
    { k: "link", path: "M9 15l6-6M8 13l-2 2a3 3 0 104 4l2-2M16 11l2-2a3 3 0 10-4-4l-2 2" },
  ];
  return (
    <div className="crg-share">
      {icons.map((i) => (
        <button key={i.k} aria-label={"Share " + i.k}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d={i.path} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function ArticleView({ data, article, dir, onOpen, onBack }) {
  const related = data.articles.filter((a) => a.id !== article.id).slice(0, 3);
  const trending = data.articles.filter((a) => a.id !== article.id).slice(0, 5);
  const body = article.body;

  return (
    <div className={"dir-" + dir}>
      <div className="crg-wrap crg-article">
        <div className="crg-article__grid">
          <article className="crg-article__main">
            <button className="crg-back" onClick={onBack}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Back
            </button>
            <span className="crg-kicker crg-article__kicker">{article.kicker}</span>
            <h1 className="crg-article__title">{article.title}</h1>
            <p className="crg-article__dek">{article.dek}</p>
            <div className="crg-article__meta">
              <Byline a={article} />
              <ShareRow />
            </div>

            <div className="crg-article__lead"><Placeholder label={article.img} ratio="40 / 21" rounded={dir === "modern"} /></div>
            <p className="crg-article__cap">{article.img} — photo to be supplied. Caption and credit go here.</p>

            <div className="crg-body">
              {body.map((p, i) => (
                <React.Fragment key={i}>
                  <p>{p}</p>
                  {i === 1 && (
                    <div className="crg-inline-ad"><AdSlot variant="inline" /></div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="crg-below-ad"><AdSlot variant="leaderboard" /></div>

            <section>
              <h3 className="crg-related__head">Related Stories</h3>
              <div className="crg-related">
                {related.map((a) => (
                  <article className="crg-relcard" key={a.id}>
                    <Placeholder label={a.kicker} ratio="3 / 2" rounded={dir === "modern"} />
                    <h4 className="crg-relcard__title" onClick={() => onOpen(a)} style={{ cursor: "pointer" }}>{a.title}</h4>
                  </article>
                ))}
              </div>
            </section>
          </article>

          <aside className="md-side">
            <div><AdSlot variant="box" /></div>
            <div className="md-trend">
              <h3 className="md-trend__head">Trending Now</h3>
              <ol>
                {trending.map((a) => (
                  <li key={a.id}><a onClick={() => onOpen(a)} style={{ cursor: "pointer" }}>{a.title}</a></li>
                ))}
              </ol>
            </div>
            <Newsletter compact />
            <div className="md-side__sticky"><AdSlot variant="halfpage" /></div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function CategoryView({ data, cat, dir, onOpen }) {
  // Pull a relevant set; fall back to all articles for non-news labels.
  const list = data.articles;
  const subs = {
    News: "The latest reporting from across the country and around the world.",
    Politics: "Campaigns, policy, and the people shaping Washington.",
    World: "Global events and what they mean back home.",
    Election: "Results, analysis, and the road ahead.",
    Opinion: "Commentary and argument from our contributors.",
    Subscribe: "Join the daily briefing and never miss a story.",
    About: "Who we are and how we report.",
  };

  return (
    <div className={"dir-" + dir}>
      <div className="crg-wrap" style={{ paddingTop: 8 }}>
        <div className="crg-cathead">
          <div className="crg-cathead__eyebrow">Section</div>
          <h1 className="crg-cathead__title">{cat}</h1>
          <p className="crg-cathead__sub">{subs[cat] || "The latest stories."}</p>
        </div>
      </div>

      <div className="crg-wrap" style={{ paddingBottom: 50 }}>
        <div className="md-leader" style={{ marginBottom: "calc(28px * var(--gap))" }}><AdSlot variant="leaderboard" /></div>
        <div className="md-grid">
          <div className="md-col">
            <div className="md-cards">
              {list.map((a) => (
                <article className="md-card" key={a.id}>
                  <div className="md-card__media">
                    <Placeholder label={a.img} ratio="16 / 9" rounded={false} />
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
            <div className="md-side__sticky"><AdSlot variant="box" /></div>
            <Newsletter compact />
            <div><AdSlot variant="halfpage" /></div>
          </aside>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Footer, ArticleView, CategoryView });
