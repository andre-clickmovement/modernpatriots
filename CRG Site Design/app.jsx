// Main app — routing between home / article / category, both directions,
// and the Tweaks panel that drives the CSS-variable token system live.
const { useState: useAppState, useEffect: useAppEffect } = React;

const FONT_PAIRS = {
  traditional: {
    label: "Traditional",
    head: '"Libre Caslon Display", Georgia, serif',
    sub: '"Source Serif 4", Georgia, serif',
    body: '"Source Serif 4", Georgia, serif',
    ui: '"Libre Franklin", system-ui, sans-serif',
  },
  slab: {
    label: "Editorial Slab",
    head: '"Zilla Slab", Georgia, serif',
    sub: '"Source Serif 4", Georgia, serif',
    body: '"Source Serif 4", Georgia, serif',
    ui: '"Public Sans", system-ui, sans-serif',
  },
  modern: {
    label: "Modern Sans",
    head: '"Libre Franklin", system-ui, sans-serif',
    sub: '"Lora", Georgia, serif',
    body: '"Lora", Georgia, serif',
    ui: '"Public Sans", system-ui, sans-serif',
  },
};

const ACCENTS = ["#b4151f", "#1b3a8c", "#9a7b1f", "#8c0d1a"];
const DENSITY = { compact: 0.72, regular: 1, comfy: 1.32 };

const TWEAK_DEFAULTS = window.CRG_TWEAK_DEFAULTS || /*EDITMODE-BEGIN*/{
  "direction": "broadsheet",
  "fontPair": "traditional",
  "accent": "#b4151f",
  "readSize": 19,
  "density": "regular"
}/*EDITMODE-END*/;

function App() {
  const data = window.CRG_DATA;
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useAppState({ name: "home" });
  const [searchOpen, setSearchOpen] = useAppState(false);

  const dir = t.direction;
  const pair = FONT_PAIRS[t.fontPair] || FONT_PAIRS.traditional;

  const navigate = (r) => {
    setRoute(r);
    window.scrollTo({ top: 0, behavior: "auto" });
  };
  const openArticle = (a) => navigate({ name: "article", id: a.id });

  // active nav label
  const active =
    route.name === "home" ? "Featured" :
    route.name === "category" ? route.cat :
    route.name === "article" ? "News" : "";

  const rootStyle = {
    "--font-head": pair.head,
    "--font-sub": pair.sub,
    "--font-body": pair.body,
    "--font-ui": pair.ui,
    "--accent": t.accent,
    "--read": t.readSize + "px",
    "--gap": String(DENSITY[t.density] || 1),
  };

  const Header = dir === "broadsheet" ? BroadsheetHeader : ModernHeader;

  let body;
  if (route.name === "home") {
    body = dir === "broadsheet"
      ? <BroadsheetHome data={data} onOpen={openArticle} />
      : <ModernHome data={data} onOpen={openArticle} />;
  } else if (route.name === "article") {
    const article = data.articles.find((a) => a.id === route.id) || data.articles[0];
    body = <ArticleView data={data} article={article} dir={dir} onOpen={openArticle} onBack={() => navigate({ name: "home" })} />;
  } else {
    body = <CategoryView data={data} cat={route.cat} dir={dir} onOpen={openArticle} />;
  }

  return (
    <div id="crg-root" className={"dir-" + dir} data-density={t.density} style={rootStyle}>
      <Header
        nav={data.categories}
        active={active}
        onNav={navigate}
        onSearch={() => setSearchOpen(true)}
      />
      {body}
      <Footer nav={data.categories} onNav={navigate} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <TweaksPanel>
        <TweakSection label="Direction" />
        <TweakRadio
          label="Layout"
          value={t.direction}
          options={[
            { value: "broadsheet", label: "Broadsheet" },
            { value: "modern", label: "Modern" },
          ]}
          onChange={(v) => setTweak("direction", v)}
        />
        <TweakSection label="Typography" />
        <TweakSelect
          label="Type pairing"
          value={t.fontPair}
          options={Object.keys(FONT_PAIRS).map((k) => ({ value: k, label: FONT_PAIRS[k].label }))}
          onChange={(v) => setTweak("fontPair", v)}
        />
        <TweakSlider
          label="Reading size"
          value={t.readSize}
          min={16}
          max={24}
          step={1}
          unit="px"
          onChange={(v) => setTweak("readSize", v)}
        />
        <TweakSection label="Color" />
        <TweakColor
          label="Accent"
          value={t.accent}
          options={ACCENTS}
          onChange={(v) => setTweak("accent", v)}
        />
        <TweakSection label="Density" />
        <TweakRadio
          label="Spacing"
          value={t.density}
          options={["compact", "regular", "comfy"]}
          onChange={(v) => setTweak("density", v)}
        />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
