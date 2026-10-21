const { useState, useEffect, useMemo, useRef, createContext, useContext, useCallback } = React;
const {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ReferenceLine, LineChart, Line, Legend, LabelList,
} = Recharts;
const L = LucideReact;

// ---------- helpers ----------
const fmtE = (v, d = 2) => (v == null ? "—" : v.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }) + " €");
const fmtP = (v, d = 1) => (v == null || !isFinite(v) ? "∞" : (v * 100).toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d }) + " %");
const fmtPr = (v) => v.toLocaleString("fr-FR", { minimumFractionDigits: v % 1 ? 2 : 0, maximumFractionDigits: 2 });
const fmtN = (v, d = 1) => v.toLocaleString("fr-FR", { minimumFractionDigits: d, maximumFractionDigits: d });
const ecoScore = (b) => b.eco.reduce((a, c) => a + c, 0);

function useTokens() {
  const read = () => {
    const s = getComputedStyle(document.documentElement);
    const g = (n) => s.getPropertyValue(n).trim();
    return {
      ink: g("--ink"), muted: g("--muted"), line: g("--line"), surface: g("--surface"), paper: g("--paper"),
      forest: g("--forest"), sage: g("--sage"), ocre: g("--ocre"), slate: g("--slate"), sand: g("--sand"),
      good: g("--good"), warn: g("--warn"), bad: g("--bad"), surface2: g("--surface2"),
    };
  };
  const [t, setT] = useState(read);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const up = () => setT(read());
    mq.addEventListener ? mq.addEventListener("change", up) : mq.addListener(up);
    const mo = new MutationObserver(up);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });
    return () => { mo.disconnect(); mq.removeEventListener && mq.removeEventListener("change", up); };
  }, []);
  return t;
}

// ---------- Traçabilité ----------
const CalcCtx = createContext(() => {});

function Src({ href, children, className = "" }) {
  if (!href) return <span className={className}>{children}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={"src-link " + className} title="Ouvrir la source dans un nouvel onglet">
      {children}<L.ExternalLink size={11} strokeWidth={2.2} aria-hidden="true" />
    </a>
  );
}

function Est({ calc, title, children, className = "" }) {
  const open = useContext(CalcCtx);
  return (
    <span className={"est-wrap " + className}>
      {children}
      <button type="button" className="est-badge" onClick={() => open({ title: title || "Détail du calcul", value: children, ...calc })}
        title="Chiffre estimé : voir la formule et le calcul">
        <L.Info size={11} strokeWidth={2.4} aria-hidden="true" />Estimé
      </button>
    </span>
  );
}

function CalcModal({ data, onClose }) {
  useEffect(() => {
    if (!data) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [data]);
  if (!data) return null;
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-label="Détail du calcul" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="eyebrow">Détail du calcul</div>
            <h3 className="font-display text-xl font-semibold mt-1">{data.title}</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer"><L.X size={18} /></button>
        </div>
        {data.formula && (
          <div className="mt-4">
            <div className="label">Formule</div>
            <div className="formula">{data.formula}</div>
          </div>
        )}
        {data.assumptions && data.assumptions.length > 0 && (
          <div className="mt-4">
            <div className="label">Hypothèses retenues</div>
            <ul className="list-disc pl-5 space-y-1 text-sm">{data.assumptions.map((a, i) => <li key={i}>{a}</li>)}</ul>
          </div>
        )}
        {data.steps && data.steps.length > 0 && (
          <div className="mt-4">
            <div className="label">Calcul pas à pas</div>
            <ol className="steps">{data.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
          </div>
        )}
        {data.extra}
      </div>
    </div>
  );
}

function Legendary() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
      <span className="flex items-center gap-1.5"><span className="src-link pointer-events-none">Chiffre sourcé<L.ExternalLink size={11} /></span> ouvre la source officielle</span>
      <span className="flex items-center gap-1.5"><span className="est-badge pointer-events-none"><L.Info size={11} />Estimé</span> ouvre la formule et le calcul</span>
    </div>
  );
}

function Section({ eyebrow, title, children, aside }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h2 className="font-display text-2xl md:text-[1.7rem] font-semibold leading-tight text-balance">{title}</h2>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

const Panel = ({ className = "", children }) => <div className={"panel " + className}>{children}</div>;

// =========================================================
// Onglet 1 — Présentation
// =========================================================
function JacketViewer({ img }) {
  const mount = useRef(null);
  const uni = useRef(null);
  const texRef = useRef(null);
  const [spots, setSpots] = useState([]);
  const [active, setActive] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!window.THREE) { setErr(true); return; }
    const T = window.THREE;
    const el = mount.current;
    let renderer;
    try { renderer = new T.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { setErr(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0, 4.6);

    // Photo produit plaquée sur une surface incurvée (épouse la forme du buste)
    const H = 2.45, W = H * 900 / 1151, BEND = 0.38;
    const geo = new T.PlaneGeometry(W, H, 64, 1);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i) / (W / 2); pos.setZ(i, -BEND * x * x); }
    geo.computeVertexNormals();
    const loader = new T.TextureLoader();
    const cache = {};
    const getTex = (src) => { if (!cache[src]) { const tx = loader.load(src); tx.anisotropy = 8; if (T.sRGBEncoding) tx.encoding = T.sRGBEncoding; cache[src] = tx; } return cache[src]; };
    PRODUCT.colors.forEach((c) => getTex(c.img));
    const u = { map: { value: getTex(img) }, uColor: { value: new T.Color(0xffffff) }, uTint: { value: 0 }, uLight: { value: 0 } };
    uni.current = u; texRef.current = getTex;
    const mat = new T.ShaderMaterial({
      uniforms: u, transparent: true, side: T.DoubleSide,
      vertexShader: "varying vec2 vUv; varying vec3 vN; void main(){ vUv=uv; vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
      fragmentShader: "uniform sampler2D map; uniform vec3 uColor; uniform float uTint; uniform float uLight; varying vec2 vUv; varying vec3 vN;" +
        "void main(){ vec2 uv=vUv; if(!gl_FrontFacing) uv.x=1.0-uv.x; vec4 t=texture2D(map,uv); if(t.a<0.02) discard;" +
        "float l=dot(t.rgb,vec3(0.299,0.587,0.114)); vec3 c=t.rgb;" +
        "if(uTint>0.5){ float sh=clamp(l*3.2,0.0,1.6); c=mix(uColor*(0.35+sh), t.rgb, smoothstep(0.42,0.62,l)); }" +
        "float d=0.82+0.18*clamp(dot(normalize(vN),normalize(vec3(0.4,0.5,1.0))),0.0,1.0); if(!gl_FrontFacing) d*=0.7; gl_FragColor=vec4(c*d,t.a); }",
    });
    const g = new T.Group();
    g.add(new T.Mesh(geo, mat));
    // ombre au sol
    const sc = document.createElement("canvas"); sc.width = sc.height = 128; const cx = sc.getContext("2d");
    const gr = cx.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, "rgba(0,0,0,0.28)"); gr.addColorStop(1, "rgba(0,0,0,0)"); cx.fillStyle = gr; cx.fillRect(0, 0, 128, 128);
    const shadow = new T.Mesh(new T.PlaneGeometry(1.9, 0.5), new T.MeshBasicMaterial({ map: new T.CanvasTexture(sc), transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, -H / 2 - 0.04, -0.2); g.add(shadow);
    scene.add(g);

    let controls = null, touched = false;
    if (T.OrbitControls) {
      controls = new T.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true; controls.enablePan = false; controls.minDistance = 2.4; controls.maxDistance = 6.5;
      controls.minAzimuthAngle = -0.75; controls.maxAzimuthAngle = 0.75; controls.minPolarAngle = 1.2; controls.maxPolarAngle = 1.95;
      controls.addEventListener("start", () => { touched = true; });
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h, false); renderer.domElement.style.width = w + "px"; renderer.domElement.style.height = h + "px";
      camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(el);

    const toV = (uv) => { const x = (uv[0] - 0.5) * W, xn = x / (W / 2); return { v: new T.Vector3(x, (0.5 - uv[1]) * H, -BEND * xn * xn + 0.01), n: new T.Vector3(2 * BEND * xn / (W / 2) * 0.5, 0, 1).normalize() }; };
    const pts = PRODUCT.hotspots.map((h) => ({ ...h, ...toV(h.uv) }));
    let raf, frame = 0; const t0 = performance.now();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!touched && !reduce) g.rotation.y = Math.sin((performance.now() - t0) / 2600) * 0.32;
      controls && controls.update();
      renderer.render(scene, camera);
      if (frame++ % 2 === 0) {
        const w = el.clientWidth, h = el.clientHeight, camDir = new T.Vector3();
        setSpots(pts.map((p) => {
          const wp = p.v.clone().applyMatrix4(g.matrixWorld);
          camDir.copy(camera.position).sub(wp).normalize();
          const vis = camDir.dot(p.n.clone().transformDirection(g.matrixWorld)) > 0.1;
          const s = wp.clone().project(camera);
          return { id: p.id, label: p.label, text: p.text, x: (s.x * 0.5 + 0.5) * w, y: (-s.y * 0.5 + 0.5) * h, vis };
        }));
      }
    };
    loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); controls && controls.dispose(); renderer.dispose(); el.innerHTML = ""; };
  }, []);

  useEffect(() => { if (uni.current && texRef.current) uni.current.map.value = texRef.current(img); }, [img]);

  if (err) return <div className="viewer grid place-items-center p-4"><img src={img} alt="Veste Abstral 2.5L" className="max-h-full" /></div>;
  return (
    <div className="viewer">
      <div ref={mount} className="absolute inset-0" />
      {spots.map((s) => (
        <button key={s.id} type="button" className={"hotspot" + (s.vis ? "" : " is-hidden") + (active === s.id ? " is-active" : "")}
          style={{ transform: `translate(${s.x}px, ${s.y}px)` }} onClick={() => setActive(active === s.id ? null : s.id)}
          aria-label={s.label} tabIndex={s.vis ? 0 : -1}>
          <span className="dot" />
          {active === s.id && (
            <span className="hs-card"><strong>{s.label}</strong><span>{s.text}</span></span>
          )}
        </button>
      ))}
      <div className="viewer-hint"><L.Rotate3d size={14} /> Glisser pour tourner · molette ou pincement pour zoomer · cliquer un point</div>
    </div>
  );
}

function TabPresentation() {
  const [col, setCol] = useState(PRODUCT.colors.find((c) => c.id === "black"));
  const fin = PICTURE_FIN[PICTURE_FIN.length - 1];
  return (
    <div className="flex flex-col gap-10">
      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-6 items-start">
        <Panel className="p-0 overflow-hidden">
          <JacketViewer img={col.img} />
          <div className="p-4 flex flex-wrap items-center gap-3 border-t border-line">
            <span className="label m-0">Coloris</span>
            {PRODUCT.colors.map((c) => (
              <button key={c.id} type="button" onClick={() => setCol(c)} className={"swatch" + (col.id === c.id ? " is-on" : "")} aria-pressed={col.id === c.id}>
                <span className="chip" style={{ background: `linear-gradient(135deg, ${c.hex} 55%, ${c.hex2} 55%)` }} />{c.name}
              </button>
            ))}
            <span className="text-xs text-muted w-full">
              {PRODUCT.colors.length} coloris, photos produit du site Picture. Coloris affiché : {col.name}.
            </span>
          </div>
        </Panel>

        <div className="flex flex-col gap-5">
          <div>
            <div className="eyebrow">Picture Organic Clothing · Clermont-Ferrand</div>
            <h2 className="font-display text-3xl md:text-4xl font-bold leading-[1.05] mt-1 text-balance">Abstral 2.5L, la veste de pluie technique et circulaire</h2>
          </div>
          <div className="price-card">
            <div>
              <div className="label">Prix catalogue officiel</div>
              <div className="font-display text-4xl font-bold tabular-nums"><Src href={SRC.abstral}>195 €</Src></div>
              <div className="text-xs text-muted mt-1">TTC, prix affiché sur la <Src href={SRC.abstral}>fiche produit Picture</Src></div>
            </div>
          </div>
          <dl className="spec-list">
            {PRODUCT.specs.map((s) => (
              <div key={s.k}><dt>{s.k}</dt><dd><Src href={s.src}>{s.v}</Src></dd></div>
            ))}
          </dl>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.15fr] gap-6 items-start">
        <Panel className="p-5 flex flex-col gap-4">
          <div className="eyebrow">La marque</div>
          <div className="wordmark">PICTURE<span>organic clothing</span></div>
          <h3 className="font-display text-xl font-semibold leading-snug text-balance">L'outdoor qui prend soin de la planète</h3>
          <p className="text-[0.95rem] leading-relaxed max-w-prose">Née en 2008 à Clermont-Ferrand, Picture Organic Clothing est une marque française de vêtements techniques pour le ski, le snowboard et la montagne. Fondée par trois amis passionnés de glisse, elle prouve que performance et respect de l'environnement vont de pair. Ses vêtements sont conçus avec des matières recyclées et biosourcées, comme le polyester issu de bouteilles plastiques ou le coton biologique, et ses chaînes de production sont pensées dans un esprit de transparence. Parce qu'un bon vêtement est celui qu'on garde longtemps, la marque propose aussi des solutions de réparation et de seconde vie.</p>
          <p className="callout text-sm italic">« On rêve grand, on rêve responsable : rider aujourd'hui, sans compromettre les terrains de jeu de demain. »</p>
          <dl className="id-grid">
            <div><dt>Forme</dt><dd>SAS au capital de 178 000 €</dd></div>
            <div><dt>Siège</dt><dd>Cébazat (63)</dd></div>
            <div><dt>Chiffre d'affaires</dt><dd><Src href={SRC.pappersPicture}>33,0 M€</Src> <span className="text-bad">(−19 %)</span></dd></div>
            <div><dt>Effectif moyen</dt><dd><Src href={SRC.pappersPicture}>73 personnes</Src> (76 en N-1)</dd></div>
          </dl>
          <div>
            <div className="label">Marchés · 52 % à l'international</div>
            <div className="mix-bar" role="img" aria-label="France 48 %, Union européenne 32 %, export hors UE 20 %">
              <span style={{ width: "48%", background: "var(--forest)" }}>France 48 %</span>
              <span style={{ width: "32%", background: "var(--sage)" }}>UE 32 %</span>
              <span style={{ width: "20%", background: "var(--ocre)" }}>Hors UE 20 %</span>
            </div>
          </div>
          <p className="text-sm text-muted">Filiales détenues à 100 % : Royaume-Uni, Canada, 2 filiales de distribution (SAR, COR), 2 magasins (Store 1 et Store 2) et une société d'événementiel. Dividendes versés par les filiales : <Src href={SRC.pappersPicture}>856 k€</Src>.</p>
        </Panel>
        <BrandFile />
      </div>
    </div>
  );
}

function BrandFile() {
  const [sub, setSub] = useState("tarifs");
  const P = SRC.pappersPicture;
  const tabs = [["tarifs", "Tarifs"], ["sante", "Santé financière"], ["invest", "Investissements"], ["strat", "Stratégie"]];
  const PU = "https://www.picture-organic-clothing.com/fr-fr/products/";
  const ladder = [
    ["Parker", 185, "mvt0633-veste-de-ski-and-snowboard-unisexe-parker?variant=56099380855169"],
    ["Parker Printed", 195, "mvt0631-veste-de-ski-and-snowboard-unisexe-parker-printed?variant=56099378987393"],
    ["Basement", 199.9, "mvt0627-veste-de-ski-and-snowboard-homme-basement?variant=56099376071041"],
    ["Puffer", 219.9, "mvt0625-doudoune-de-ski-and-snowboard-homme-puffer?variant=56099323773313"],
    ["FC Picture", 219.9, "mvt0620-veste-de-ski-and-snowboard-fc-picture?variant=56099313287553"],
    ["Team Lumilautailijat", 219.9, "mvt0634-team-lumilautailijat-jkt?variant=56099382067585"],
    ["Klyne 1/4", 225, "mvt0629-klyne-14-jkt?variant=56099377217921"],
    ["Nitric", 249.9, "mvt0624-veste-de-ski-and-snowboard-homme-nitric?variant=56099325247873"],
    ["Puffer GRDT", 249.9, "mvt0628-veste-de-ski-and-snowboard-homme-puffer-grdt?variant=56099376988545"],
    ["Klyne", 279.9, "mvt0626-veste-de-ski-and-snowboard-homme-klyne?variant=56099375317377"],
    ["Felnor", 299.9, "mvt0623-veste-de-ski-and-snowboard-homme-felnor?variant=56099321315713"],
    ["Object", 349.9, "mvt0622-veste-de-ski-and-snowboard-homme-picture-object?variant=56099319382401"],
    ["Orokoon", 379.9, "mvt0630-orokoon-jkt?variant=56099378725249"],
    ["Goods", 399.9, "mvt0581-veste-de-ski-and-snowboard-homme-goods?variant=56099235889537"],
    ["Broader 3L", 399.9, "mvt0621-broader-3l-jkt?variant=56099312271745"],
    ["Merassen Gore-Tex", 499.9, "mvt0632-veste-de-ski-and-snowboard-homme-merassen-gore-tex?variant=56099379708289"],
    ["Huron Gore-Tex 3L", 649.9, "mvt0580-veste-de-ski-and-snowboard-3-couches-gore-tex-homme-huron?variant=55814027608449"],
  ];
  return (
    <Panel className="p-0 overflow-hidden">
      <div className="px-5 pt-5"><div className="eyebrow">Fiche Picture · exercice 2025</div></div>
      <div className="sub-tabs" role="tablist">
        {tabs.map(([k, l]) => <button key={k} role="tab" aria-selected={sub === k} className={"sub-tab" + (sub === k ? " is-on" : "")} onClick={() => setSub(k)}>{l}</button>)}
      </div>
      <div className="p-5 flex flex-col gap-4 text-sm">
        {sub === "tarifs" && (<>
          <div>
            <div className="label">Les 17 vestes de ski et snowboard homme, prix publics du site</div>
            <div className="flex flex-col gap-1 mt-1">
              {ladder.map(([n, p, slug]) => (
                <div key={n} className="mini-ladder"><span className="truncate">{n}</span><span className="mini-track"><span style={{ width: (p / 650) * 100 + "%" }} /></span><span className="tabular-nums text-right"><Src href={PU + slug}>{fmtE(p, p % 1 ? 2 : 0)}</Src></span></div>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Kpi label="Prix moyen des 17 vestes de ski" v={<Est title="Prix moyen des vestes de ski homme" calc={{ formula: "Moyenne simple des prix publics des 17 vestes de ski homme", assumptions: ["Prix relevés sur le site Picture", "Moyenne non pondérée par les ventes"], steps: ["Somme des 17 prix ÷ 17 ≈ 310 €"] }}>≈ 310 €</Est>} sub="majorité entre 200 et 400 €" />
            <Kpi label="Abstral (homme et femme)" v={<Src href={SRC.abstral}>195 €</Src>} sub="sous l'entrée de gamme ski (185 – 200 €)" />
          </div>
          <p><strong>Autres vêtements.</strong> Homme : t-shirts 39,90 €, sweats 65 à 115 €, polaires 139,90 à 165 €, chemises 85 à 110 €, pantalon 95 €, doudoune Hilko 269,90 €. Femme : t-shirts 35 à 39,90 €, polaires 149,90 €, chemises 110 à 120 €, gilet réversible 149,90 €. Accessoires : bonnet 35 €, casquette 39,90 €.</p>
          <p><strong>Politique de prix.</strong> Prix fixe affiché en saison, avec un outlet séparé (« bons plans ») pour solder. Les revendeurs tiers soldent jusqu'à −50 % ou −60 % les collections précédentes.</p>
          <p><strong>Cohérence avec les comptes.</strong> Marge sur coûts d'achat de <Src href={P}>39 % du CA</Src>, stable (37,7 % en N-1). Prix de gros probablement autour de <Est title="Prix de gros" calc={{ formula: "Prix de gros ≈ 50 % du prix public", assumptions: ["Hypothèse de travail, non publiée dans les comptes"], steps: ["Abstral : 195 € × 50 % ≈ 97,50 € TTC, soit ≈ 81 € HT"] }}>50 % du prix public</Est>.</p>
        </>)}
        {sub === "sante" && (<>
          <div className="grid grid-cols-2 gap-3">
            <Kpi tone="bad" label="Résultat net" v={<Src href={P}>−924 k€</Src>} sub="+13 k€ en N-1" />
            <Kpi tone="bad" label="Résultat d'exploitation" v={<Src href={P}>−488 k€</Src>} sub="+716 k€ en N-1" />
            <Kpi tone="bad" label="Capitaux propres" v={<Src href={P}>1,65 M€</Src>} sub="−44 %, 9 % du total du bilan" />
            <Kpi tone="warn" label="Endettement net" v={<Est title="Endettement net" calc={{ formula: "Dettes financières − trésorerie", assumptions: ["Dettes financières 10,7 M€ (4,35 M€ banques, 6,3 M€ dettes diverses dont PPR 2,9 M€)", "Trésorerie 3,1 M€"], steps: ["10,7 − 3,1 = 7,6 M€"] }}>≈ 7,6 M€</Est>} sub="dettes financières 10,7 M€" />
          </div>
          <div className="fin-row"><span>Résultat financier</span><Src href={P}>−332 k€</Src></div>
          <div className="fin-row"><span>Trésorerie</span><span><Src href={P}>3,1 M€</Src> (4,4 M€ en N-1)</span></div>
          <div className="fin-row"><span>Dettes bancaires</span><Src href={P}>4,35 M€</Src></div>
          <div className="fin-row"><span>Dettes diverses (dont PPR 2,9 M€)</span><Src href={P}>6,3 M€</Src></div>
          <div className="fin-row"><span>Liquidité générale</span><Est title="Ratio de liquidité" calc={{ formula: "Actif circulant ÷ dettes à moins d'un an", assumptions: ["Bilan au 31/12/2025"], steps: ["15,3 ÷ 12,9 = 1,19 ≈ 1,2"] }}>1,2</Est></div>
          <div className="fin-row"><span>Stocks nets</span><span><Src href={P}>3,9 M€</Src> (−29 %, dépréciation 237 k€)</span></div>
          <p className="callout"><strong>Audit.</strong> Comptes certifiés sans réserve, mais avec une <strong>incertitude significative sur la continuité d'exploitation</strong>. Points d'alerte : perte entièrement imputée sur les « autres réserves » (1,46 M€ après affectation), et des distributions de réserves de 395 k€ par an de 2022 à 2024.</p>
        </>)}
        {sub === "invest" && (<>
          <div className="grid grid-cols-2 gap-3">
            <Kpi label="Acquisitions de l'exercice" v={<Src href={P}>841 k€</Src>} sub="582 k€ incorporel · 81 k€ corporel · 178 k€ financier" />
            <Kpi tone="warn" label="Amortissements" v={<Src href={P}>750 k€</Src>} sub="plus que l'investissement corporel (81 k€)" />
          </div>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Incorporel (582 k€)</strong>, principal poste : probablement logiciels, marques ou droits.</li>
            <li><strong>Financier (178 k€)</strong> dont +175 k€ de titres de participation dans les filiales. Cessions et sorties : 194 k€.</li>
            <li><strong>Sous-investissement</strong> en outils et agencements : 750 k€ d'amortissements pour 81 k€ d'investissement corporel.</li>
            <li><strong>Showroom d'Annecy</strong> financé par un prêt de 400 k€, sans garantie particulière.</li>
            <li><strong>Magasin en difficulté</strong> : 330 k€ de provisions sur la filiale PS2 (Store 2), titres 50 k€ et avances 280 k€. Filiale en perte (−178 k€), capitaux propres négatifs.</li>
          </ul>
        </>)}
        {sub === "strat" && (<>
          <div>
            <div className="label">Plan de redressement annoncé dans l'annexe</div>
            <ol className="steps mt-2">
              <li>Réduction de la masse salariale : licenciement économique de 8 postes (coût ≈ 160 k€)</li>
              <li>Baisse des loyers par sous-location</li>
              <li>Rationalisation des collections : moins de références</li>
              <li>Soutien bancaire pour le budget 2025-26</li>
            </ol>
          </div>
          <p><strong>Positionnement.</strong> Modèle international : plus de la moitié du CA hors de France, filiales dédiées et magasins en propre.</p>
          <p><strong>Gestion des risques.</strong> Couverture de change sur les achats, dépréciation prudente des stocks anciens (100 % au-delà de 3 ans), PLV désormais traitée en charges constatées d'avance.</p>
          <p className="callout"><strong>Lecture.</strong> C'est une stratégie de défense : les comptes ne décrivent aucun axe de croissance. Une promotion qui réduit la marge irait à l'encontre de ce plan.</p>
        </>)}
        <p className="text-xs text-muted">Source : <Src href={P}>comptes annuels 2025 de Picture Organic Clothing (Pappers)</Src>.</p>
      </div>
    </Panel>
  );
}

function Kpi({ label, v, sub, tone }) {
  return (
    <div className={"kpi" + (tone ? " tone-" + tone : "")}>
      <div className="label">{label}</div>
      <div className="font-display text-2xl font-semibold tabular-nums leading-tight">{v}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}

// =========================================================
// Onglet 2 — Concurrence
// =========================================================
function ecoCalc(b) {
  return {
    formula: "Score éco = somme de 5 critères notés 0, 1 ou 2 (sur 10)",
    assumptions: ["Grille interne construite à partir du dossier (fiches concurrents, Consoglobe)", "0 = absent, 1 = partiel, 2 = affirmé et vérifiable"],
    steps: ECO_CRITERIA.map((c, i) => `${c} : ${b.eco[i]}`).concat([`Total : ${ecoScore(b)} / 10`]),
  };
}

const EXTRA_OUBLIES = [
  { id: "vinted", name: "Vinted", kind: "Plateforme de seconde main", shop: "https://www.vinted.fr/" },
  { id: "pakpak", ini: "PK", name: "Cape des Pakpak", kind: "Cape de pluie traditionnelle des Pakpak", shop: null },
];
const RINGS = [
  { k: "direct", title: "Les directs", def: "même offre, mêmes clients", detail: "Vestes techniques outdoor et ski de marques établies, pour les mêmes pratiquants." },
  { k: "indirect", title: "Les indirects", def: "autre offre, même besoin", detail: "Montagne, pluie urbaine, lifestyle ou sport grand public : se protéger de la pluie et du froid." },
  { k: "oublie", title: "Ceux qu'on oublie", def: "marques de distributeur, plateformes, offre publique, gratuit, « faire soi-même »", detail: "Seconde main et solutions traditionnelles." },
];

function initials(n) { return n.replace("The ", "").split(/[\s']/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase(); }

function RingMap({ onPick }) {
  const t = useTokens();
  const [hover, setHover] = useState(null);
  const [hl, setHl] = useState(null);
  const C = 300, R0 = 72, R1 = 158, R2 = 232, R3 = 292;
  const col = { direct: t.forest, indirect: t.ocre, oublie: t.slate };
  const groups = {
    direct: BRANDS.filter((b) => b.ring === "direct"),
    indirect: BRANDS.filter((b) => b.ring === "indirect"),
    oublie: [...BRANDS.filter((b) => b.ring === "oublie"), ...EXTRA_OUBLIES.map((x) => ({ ...x, ring: "oublie", extra: true }))],
  };
  const radius = { direct: (R0 + R1) / 2 + 2, indirect: (R1 + R2) / 2, oublie: (R2 + R3) / 2 };
  const offset = { direct: -Math.PI / 2, indirect: -Math.PI / 2 + 0.35, oublie: -Math.PI / 2 + 0.17 };
  const placed = Object.entries(groups).flatMap(([k, list]) => list.map((b, i) => {
    const a = offset[k] + (i / list.length) * Math.PI * 2;
    return { ...b, x: C + radius[k] * Math.cos(a), y: C + radius[k] * Math.sin(a) };
  }));
  const hb = hover && placed.find((p) => p.id === hover);
  const act = (b) => { if (!b.extra) return onPick(b); if (!b.shop) return; const l = document.createElement("a"); l.href = b.shop; l.target = "_blank"; l.rel = "noopener noreferrer"; document.body.appendChild(l); l.click(); l.remove(); };
  const dim = (k) => (hl && hl !== k ? 0.25 : 1);
  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 items-center">
      <div className="relative max-w-[600px] w-full mx-auto">
        <svg viewBox="-10 -6 620 636" className="w-full h-auto" role="img" aria-label="Cercles concurrentiels autour de l'Abstral, notre produit">
          <circle cx={C} cy={C} r={R3} fill="none" stroke={t.muted} strokeWidth="2" strokeDasharray="7 7" opacity={dim("oublie")} />
          <circle cx={C} cy={C} r={R2} fill={t.ocre} fillOpacity="0.07" stroke={t.ocre} strokeWidth="2.5" opacity={dim("indirect")} />
          <circle cx={C} cy={C} r={R1} fill={t.forest} fillOpacity="0.07" stroke={t.forest} strokeWidth="2.5" opacity={dim("direct")} />
          <circle cx={C} cy={C} r={R0} fill={t.surface} stroke={t.forest} strokeWidth="2.5" />
          <text x={C} y={C - 16} textAnchor="middle" fontSize="15" fontWeight="700" fill={t.ink}>Notre produit</text>
          <text x={C} y={C + 4} textAnchor="middle" fontSize="13" fill={t.ink}>Abstral 2.5L</text>
          <text x={C} y={C + 24} textAnchor="middle" fontSize="14" fontWeight="700" fill={t.ocre}>195 €</text>
          {placed.map((b) => (
            <g key={b.id} className="bubble" tabIndex="0" role="button" aria-label={`${b.name}${b.model ? ", " + b.model : ""}`} opacity={dim(b.ring)}
              onMouseEnter={() => setHover(b.id)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(b.id)} onBlur={() => setHover(null)}
              onClick={() => act(b)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && act(b)}>
              <circle cx={b.x} cy={b.y} r="19" fill={b.noAccounts ? t.surface : col[b.ring]} stroke={b.noAccounts ? col[b.ring] : t.surface} strokeWidth="2.5" strokeDasharray={b.noAccounts ? "4 3" : "0"} />
              <text x={b.x} y={b.y + 4.5} textAnchor="middle" fontSize="12" fontWeight="700" fill={b.noAccounts ? col[b.ring] : t.surface} style={{ pointerEvents: "none" }}>{b.ini || initials(b.name)}</text>
              <text x={b.x} y={b.y + 33} textAnchor="middle" fontSize="11" fill={t.ink} style={{ pointerEvents: "none" }}>{b.name}</text>
            </g>
          ))}
        </svg>
        {hb && (
          <div className="map-tip">
            <div className="font-semibold">{hb.name}</div>
            <div className="text-xs text-muted">{hb.extra ? hb.kind : hb.model}</div>
            {hb.price != null && <div className="text-sm mt-1 tabular-nums">{fmtPr(hb.price)} € {hb.priceEstimated ? "(estimé)" : ""}</div>}
            {hb.noAccounts && <div className="text-xs mt-1" style={{ color: t.warn }}>Comptes de résultat indisponibles</div>}<div className="text-xs text-muted mt-1">{hb.extra ? (hb.shop ? "Cliquer pour ouvrir le site" : "Lien à ajouter") : "Cliquer pour ouvrir le profil"}</div>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-5">
        {RINGS.map((r) => (
          <div key={r.k} className="ring-legend" onMouseEnter={() => setHl(r.k)} onMouseLeave={() => setHl(null)} style={{ "--rc": col[r.k] }}>
            <div className="font-display text-lg font-bold" style={{ color: col[r.k] }}>{r.title}</div>
            <div className="text-sm">{r.def}</div>
            <div className="text-xs text-muted mt-1">{r.detail}</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-sm">
              {groups[r.k].filter((b) => !b.noAccounts).map((b) => <Src key={b.id} href={b.shop}>{b.name}</Src>)}
            </div>
            {groups[r.k].some((b) => b.noAccounts) && (
              <div className="mt-2 text-sm"><span className="noacc-tag">Comptes de résultat indisponibles</span>{" "}
                <span className="inline-flex flex-wrap gap-x-3 gap-y-1">{groups[r.k].filter((b) => b.noAccounts).map((b) => <Src key={b.id} href={b.shop}>{b.name}</Src>)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Rich({ v }) {
  if (!Array.isArray(v)) return <p>{v}</p>;
  return <div className="flex flex-col gap-2">{v.map((x, i) => Array.isArray(x)
    ? <p key={i}><strong>{x[0]}</strong> {x[1]}</p>
    : <p key={i}>{x}</p>)}</div>;
}

function FinRow({ r }) {
  return (
    <div className="fin-row"><span>{r.label}</span><span className="tabular-nums font-medium">{r.src ? <Src href={r.src}>{r.value}</Src> : <span title="Lien source à ajouter">{r.value}<sup className="text-warn"> *</sup></span>}</span></div>
  );
}

function Drawer({ b, onClose }) {
  useEffect(() => {
    if (!b) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [b]);
  if (!b) return null;
  return (
    <div className="overlay drawer-overlay" onClick={onClose}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={"Profil " + b.name} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="eyebrow">{RING_LABEL[b.ring]}</div>
            <h3 className="font-display text-2xl font-bold">{b.name}</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Fermer"><L.X size={18} /></button>
        </div>
        <div className="product-tile mt-4">
          <div className="monogram">{b.name.split(/[\s']/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()}</div>
          <div className="min-w-0">
            <div className="label">Modèle comparable</div>
            <div className="font-semibold">{b.model}</div>
            <div className="text-lg tabular-nums font-display font-semibold">
              {b.price == null ? "Prix non relevé" : b.priceEstimated
                ? <Est title={`Prix ${b.model}`} calc={b.priceCalc}>{fmtPr(b.price)} €</Est>
                : <Src href={b.priceSrc || b.shop}>{fmtPr(b.price)} €</Src>}
            </div>
            <Src href={b.shop} className="text-sm">Voir la boutique de la marque</Src>
          </div>
        </div>
        {b.note && <p className="callout mt-4 text-sm">{b.note}</p>}
        <div className="mt-5 grid gap-4 text-sm">
          <div><div className="label">Tarifs</div><Rich v={b.tarifs} /></div>
          <div><div className="label">Stratégie</div><Rich v={b.strategy} /></div>
          <div><div className="label">Investissements</div><Rich v={b.invest} /></div>
        </div>
        <div className="mt-6">
          <div className="eyebrow">Synthèse financière</div>
          {b.fin ? (
            <>
              {b.fin.period && <div className="text-xs text-muted mt-1">{b.fin.period}</div>}
              <div className="grid sm:grid-cols-2 gap-4 mt-3">
                <div><div className="label">Compte de résultat</div>{b.fin.cr.map((r) => <FinRow key={r.label} r={r} />)}</div>
                <div><div className="label">Bilan</div>{b.fin.bilan.map((r) => <FinRow key={r.label} r={r} />)}</div>
              </div>
              {b.fin.warn && <p className="text-xs text-muted mt-3"><L.AlertTriangle size={12} className="inline -mt-0.5 mr-1" />{b.fin.warn}</p>}
              {b.fin.cr.concat(b.fin.bilan).some((r) => !r.src) && <p className="text-xs text-muted mt-1">* Chiffre repris du dossier, lien vers les comptes à compléter.</p>}
            </>
          ) : (
            b.finText ? <div className="text-sm mt-2"><Rich v={b.finText} /><p className="text-xs text-muted mt-2">{b.finMissing}</p></div> :
            <p className="text-sm text-muted mt-2">{b.finMissing}{b.finLinks && <> · {b.finLinks.map((l) => <Src key={l.src} href={l.src}>{l.label}</Src>)}</>}</p>
          )}
        </div>
      </aside>
    </div>
  );
}

function TabConcurrence() {
  const [pick, setPick] = useState(null);
  const listed = BRANDS.filter((b) => b.ring !== "nous" && b.ring !== "hors");
  return (
    <div className="flex flex-col gap-10">
      <Section eyebrow="Le marché" title="La veste de pluie technique 2,5 couches, vendue entre 120 et 400 € à des pratiquants outdoor et glisse">
        <p className="text-sm text-muted max-w-prose">Les concurrents sont classés en trois cercles autour de l'Abstral. Une pastille vide en pointillés signale une marque dont les comptes de résultat sont indisponibles. Cliquez sur une marque du schéma pour ouvrir son profil complet, ou sur son nom à droite pour aller sur son site.</p>
        <Panel className="p-4 md:p-6"><RingMap onPick={setPick} /></Panel>
      </Section>

      <Section eyebrow="Repères de prix" title="Toutes les vestes comparables">
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Marque</th><th>Cercle</th><th>Modèle</th><th className="text-right">Prix TTC</th><th></th></tr></thead>
            <tbody>
              {listed.sort((a, b) => (a.price || 999) - (b.price || 999)).map((b) => (
                <tr key={b.id}>
                  <td className="font-semibold">{b.name}</td>
                  <td><span className={"ring-dot ring-" + b.ring} /> {RING_LABEL[b.ring].replace("Concurrents ", "")}</td>
                  <td>{b.model}</td>
                  <td className="text-right tabular-nums">{b.price == null ? "—" : b.priceEstimated ? <Est title={"Prix " + b.model} calc={b.priceCalc}>{b.price} €</Est> : <Src href={b.priceSrc || b.shop}>{fmtPr(b.price)} €</Src>}</td>
                  <td className="text-right"><button className="link-btn" onClick={() => setPick(b)}>Profil<L.ChevronRight size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted">Prix relevés dans le dossier « Prix et budget ». Les liens renvoient vers la boutique officielle de chaque marque ; seul le prix Columbia pointe vers la fiche produit exacte. Source de classement des marques éco : <Src href={SRC.consoglobe}>Consoglobe</Src>.</p>
      </Section>
      <Drawer b={pick} onClose={() => setPick(null)} />
    </div>
  );
}

// =========================================================
// Onglet 3 — Coûts
// =========================================================
function TabCouts() {
  const t = useTokens();
  const open = useContext(CalcCtx);
  const [hi, setHi] = useState(null);
  const pal = [t.forest, t.sage, t.slate, t.sand, t.muted, t.ocre, t.bad];
  const data = COST_ITEMS.map((c, i) => ({ ...c, fill: pal[i % pal.length] }));
  const openItem = (c) => open({ title: `${c.label} : ${fmtE(c.value)}`, ...c.calc, extra: <p className="text-xs text-muted mt-4">Fourchette plausible : {c.range}</p> });

  const brandMargin = WHOLESALE_HT - COST_REF;
  const retailMargin = PRICE_HT - WHOLESALE_HT;
  const tva = PRODUCT.priceRef - PRICE_HT;
  const wf = [
    { name: "Coût de revient", base: 0, val: COST_REF, kind: "cost", calc: { formula: "Coût sortie d'usine + transport + douane", assumptions: ["Estimation centrale du dossier, arrondie"], steps: [`Sortie d'usine : 17 + 8 + 3 + 4 + 1 = 33 €`, `Import : 2,50 + 2 = 4,50 €`, `Total : 37,50 € → arrondi à 38 €`] } },
    { name: "Marge Picture", base: COST_REF, val: brandMargin, kind: "margin", calc: { formula: "Prix de gros HT − coût de revient", assumptions: ["Coefficient de marque implicite = prix de gros ÷ coût"], steps: [`${fmtE(WHOLESALE_HT)} − 38,00 € = ${fmtE(brandMargin)}`, `Coefficient : ${fmtE(WHOLESALE_HT)} ÷ 38 = ${fmtN(WHOLESALE_HT / COST_REF, 2)}`, `Doit couvrir conception, salaires, marketing, frais généraux de Picture`] } },
    { name: "Prix de gros HT", base: 0, val: WHOLESALE_HT, kind: "total", calc: { formula: "Prix public HT ÷ coefficient magasin", assumptions: ["Coefficient magasin de 2,1, repris de la répartition de valeur publiée par Picture pour son t-shirt"], steps: [`162,50 ÷ 2,1 = ${fmtE(WHOLESALE_HT)}`] } },
    { name: "Marge magasin", base: WHOLESALE_HT, val: retailMargin, kind: "margin", calc: { formula: "Prix public HT − prix de gros HT", assumptions: ["Coefficient multiplicateur distributeur de 2,1 (t-shirt Picture)", "Couvre loyer, personnel, démarque et marge du revendeur"], steps: [`162,50 − ${fmtN(WHOLESALE_HT, 2)} = ${fmtE(retailMargin)}`, `Taux de marque magasin : ${fmtE(retailMargin)} ÷ 162,50 = ${fmtP(retailMargin / PRICE_HT)}`] } },
    { name: "Prix public HT", base: 0, val: PRICE_HT, kind: "total", calc: { formula: "Prix TTC ÷ 1,2", assumptions: ["TVA à 20 %"], steps: ["195 ÷ 1,2 = 162,50 €"] } },
    { name: "TVA 20 %", base: PRICE_HT, val: tva, kind: "tax", calc: { formula: "Prix HT × 20 %", assumptions: ["Taux normal de TVA en France"], steps: ["162,50 × 0,20 = 32,50 €"] } },
    { name: "Prix public TTC", base: 0, val: PRODUCT.priceRef, kind: "final", calc: { formula: "Prix catalogue du site Picture", assumptions: ["195 € TTC affiché sur la fiche produit Picture"], steps: ["162,50 + 32,50 = 195,00 €"] } },
  ];
  const kindColor = { cost: t.slate, margin: t.forest, total: t.sage, tax: t.muted, final: t.ocre };

  return (
    <div className="flex flex-col gap-10">
      <Section eyebrow="Coût de revient unitaire" title={<>Fabriquer une Abstral et la livrer en France coûte environ <Est title="Coût de revient estimé" calc={{ formula: "Somme des 7 postes de coût", assumptions: ["Estimation centrale du dossier", "Fourchette prudente 30 – 50 €"], steps: COST_ITEMS.map((c) => `${c.label} : ${fmtE(c.value)}`).concat([`Total : ${fmtE(COST_TOTAL)} → arrondi 38 €`]) }}>38 €</Est></>}>
        <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-center">
          <Panel className="p-4">
            <div className="relative h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="label" innerRadius="58%" outerRadius="92%" paddingAngle={1.5} stroke={t.surface} strokeWidth={2}
                    onMouseEnter={(_, i) => setHi(i)} onMouseLeave={() => setHi(null)} onClick={(d) => openItem(d.payload || d)} isAnimationActive={false}>
                    {data.map((d, i) => <Cell key={d.id} fill={d.fill} opacity={hi == null || hi === i ? 1 : 0.45} style={{ cursor: "pointer" }} />)}
                  </Pie>
                  <Tooltip content={({ active, payload }) => active && payload && payload[0] ? (
                    <div className="chart-tip"><strong>{payload[0].payload.label}</strong><div className="tabular-nums">{fmtE(payload[0].value)} · {fmtP(payload[0].value / COST_TOTAL)}</div><div className="text-xs text-muted">Cliquer pour la méthode</div></div>) : null} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center"><div className="font-display text-3xl font-bold tabular-nums">{fmtN(COST_TOTAL, 1)} €</div><div className="text-xs text-muted">7 postes, tous estimés</div></div>
            </div>
          </Panel>
          <div className="flex flex-col">
            {data.map((c, i) => (
              <button key={c.id} type="button" className={"cost-row" + (hi === i ? " is-hi" : "")} onMouseEnter={() => setHi(i)} onMouseLeave={() => setHi(null)} onClick={() => openItem(c)}>
                <span className="chip" style={{ background: c.fill }} />
                <span className="flex-1 text-left">{c.label}<span className="block text-xs text-muted">{c.group} · fourchette {c.range}</span></span>
                <span className="tabular-nums font-semibold">{fmtE(c.value)}</span>
                <span className="est-badge"><L.Info size={11} />Estimé</span>
              </button>
            ))}
            <p className="text-xs text-muted mt-3">Principale incertitude : le prix réellement négocié pour le textile laminé, les fermetures et la confection. Les coûts de conception, R&D et marketing ne sont pas dans le coût de revient : ils sont couverts par la marge de Picture.</p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Chaîne de valeur" title="De 38 € à 195 € : répartition des valeurs">
        <Panel className="p-4">
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wf} margin={{ top: 24, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid vertical={false} stroke={t.line} strokeDasharray="2 4" />
                <XAxis dataKey="name" tick={{ fill: t.muted, fontSize: 11 }} interval={0} tickLine={false} axisLine={{ stroke: t.line }} height={46} tickFormatter={(v) => v.length > 14 ? v.replace(" ", "\n") : v} />
                <YAxis tick={{ fill: t.muted, fontSize: 11 }} tickFormatter={(v) => v + " €"} axisLine={false} tickLine={false} width={52} domain={[0, 200]} ticks={[0, 50, 100, 150, 200]} />
                <Tooltip cursor={{ fill: t.surface2 }} content={({ active, payload }) => active && payload && payload[1] ? (
                  <div className="chart-tip"><strong>{payload[1].payload.name}</strong><div className="tabular-nums">{fmtE(payload[1].value)}</div><div className="text-xs text-muted">Cliquer pour le coefficient</div></div>) : null} />
                <Bar dataKey="base" stackId="a" fill="transparent" isAnimationActive={false} />
                <Bar dataKey="val" stackId="a" isAnimationActive={false} radius={[3, 3, 0, 0]} onClick={(d) => open({ title: `${d.name} : ${fmtE(d.val)}`, ...d.calc })} style={{ cursor: "pointer" }}>
                  {wf.map((d) => <Cell key={d.name} fill={kindColor[d.kind]} />)}
                  <LabelList dataKey="val" position="top" formatter={(v) => fmtN(v, 2) + " €"} style={{ fill: t.ink, fontSize: 11, fontWeight: 600 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-muted mt-2 px-1">
            {[["cost", "Coût"], ["margin", "Marge (cliquable)"], ["total", "Prix intermédiaire"], ["tax", "TVA"], ["final", "Prix public"]].map(([k, l]) => <span key={k} className="flex items-center gap-1.5"><span className="chip" style={{ background: kindColor[k] }} />{l}</span>)}
          </div>
        </Panel>
        <div className="grid md:grid-cols-3 gap-4">
          <Kpi label="Coefficient Picture" v={<Est title="Coefficient de marque Picture" calc={wf[1].calc}>× {fmtN(WHOLESALE_HT / COST_REF, 2)}</Est>} sub="prix de gros ÷ coût de revient" />
          <Kpi label="Coefficient magasin" v={<Est title="Coefficient distributeur" calc={wf[3].calc}>× 2,10</Est>} sub="prix public HT ÷ prix de gros" />
          <Kpi label="Marge brute sur vente directe" v={<Est title="Marge sur coût en vente directe (e-shop)" calc={{ formula: "Prix public HT − coût de revient", assumptions: ["Vente sur le site Picture, sans distributeur", "Ne couvre pas encore les frais de port, retours, paiement, marketing"], steps: ["162,50 − 38 = 124,50 €", "124,50 ÷ 162,50 = 76,6 %"] }}>124,50 € · 76,6 %</Est>} sub="si Picture vend en direct" />
        </div>
        <details className="panel p-4 text-sm">
          <summary className="cursor-pointer font-semibold">Méthode alternative : répartition de la valeur du t-shirt Picture appliquée à l'Abstral</summary>
          <div className="table-wrap mt-3">
            <table className="data-table">
              <thead><tr><th>Acteur</th><th>Part du t-shirt (HT)</th><th className="text-right">Abstral</th><th className="text-right">Part du TTC</th><th>Prix cumulé</th></tr></thead>
              <tbody>
                <tr><td>Fournisseur (usine)</td><td>7 € (28,6 %)</td><td className="text-right"><Est title="Part fournisseur" calc={{ formula: "162,50 € HT × 28,6 %", assumptions: ["Répartition publiée par Picture pour un t-shirt"], steps: ["162,50 × 0,286 ≈ 46 €"] }}>≈ 46 €</Est></td><td className="text-right">24 %</td><td>Picture achète ≈ 46 €</td></tr>
                <tr><td>Marque (Picture)</td><td>5,50 € (22,4 %)</td><td className="text-right"><Est title="Part marque" calc={{ formula: "162,50 € HT × 22,4 %", assumptions: ["Répartition t-shirt"], steps: ["162,50 × 0,224 ≈ 36 €"] }}>≈ 36 €</Est></td><td className="text-right">19 %</td><td>le magasin achète ≈ 83 €</td></tr>
                <tr><td>Magasin</td><td>12 € (49 %)</td><td className="text-right"><Est title="Part magasin" calc={{ formula: "162,50 € HT × 49 %", assumptions: ["Répartition t-shirt"], steps: ["162,50 × 0,49 ≈ 80 €"] }}>≈ 80 €</Est></td><td className="text-right">41 %</td><td>162,50 € HT</td></tr>
                <tr><td>TVA</td><td>20 % du HT</td><td className="text-right">32,50 €</td><td className="text-right">17 %</td><td>195 € TTC</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2">Source de la répartition : <Src href={SRC.pictureMadeIn}>Picture, t-shirt made in France</Src>. Les coefficients d'un t-shirt surestiment probablement le coût d'une veste technique ; l'estimation par postes (38 €) est retenue.</p>
        </details>
      </Section>
    </div>
  );
}

// =========================================================
// Onglet 4 — Simulateur
// =========================================================
const MARGIN_PRESETS = [
  { id: "compta", label: "Marge brute Picture (comptes 2026)", m: 12.4 / 27.1, price: PRICE_HT, est: false,
    calc: { formula: "Marge brute ÷ CA (Pappers)", assumptions: ["Taux moyen toutes ventes confondues (gros + direct)", "Appliqué au prix public HT pour les montants unitaires"], steps: ["12,4 M€ ÷ 27,1 M€ = 45,8 %"] } },
  { id: "dtc", label: "Abstral vendue en direct (e-shop)", m: (PRICE_HT - COST_REF) / PRICE_HT, price: PRICE_HT, est: true,
    calc: { formula: "(Prix HT − coût de revient) ÷ prix HT", assumptions: ["Coût de revient estimé 38 €", "Hors frais de port, retours et marketing"], steps: ["(162,50 − 38) ÷ 162,50 = 76,6 %"] } },
  { id: "gros", label: "Abstral vendue en gros (magasins)", m: (WHOLESALE_HT - COST_REF) / WHOLESALE_HT, price: WHOLESALE_HT, est: true,
    calc: { formula: "(Prix de gros − coût de revient) ÷ prix de gros", assumptions: ["Prix de gros = 162,50 ÷ 2,1", "La remise s'applique au prix de gros"], steps: [`(${fmtN(WHOLESALE_HT, 2)} − 38) ÷ ${fmtN(WHOLESALE_HT, 2)} = ${fmtP((WHOLESALE_HT - COST_REF) / WHOLESALE_HT)}`] } },
];

function simulate(r, m, e) {
  // r : variation de prix (négatif = remise), m : taux de marge initial, e : élasticité (négative)
  if (r <= 0) {
    const d = -r;
    const req = d >= m ? Infinity : d / (m - d);
    const exp = -e * d;
    const dM = d >= m ? -1 : (1 + exp) * (m - d) / m - 1;
    return { d, req, exp, dM, unitM: m - d, beE: d >= m ? Infinity : -1 / (m - d) };
  }
  const tol = r / (m + r); // perte de volume tolérable
  const exp = e * r; // négatif
  const dM = (1 + exp) * (m + r) / m - 1;
  return { d: -r, req: -tol, exp, dM, unitM: m + r, beE: -1 / (m + r) };
}

function Slider({ id, label, value, min, max, step, onChange, fmt, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3"><label htmlFor={id} className="label m-0">{label}</label><span className="font-display font-semibold tabular-nums">{fmt(value)}</span></div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
      {hint && <div className="text-xs text-muted">{hint}</div>}
    </div>
  );
}

function NumInput({ id, label, value, onChange, suffix, note }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <span className="label m-0">{label}</span>
      <span className="num-input"><input id={id} type="number" value={value} onChange={(e) => onChange(+e.target.value)} />{suffix && <span>{suffix}</span>}</span>
      {note && <span className="text-xs text-muted">{note}</span>}
    </label>
  );
}

function TabPrix({ sim, setSim, survey }) {
  const t = useTokens();
  const open = useContext(CalcCtx);
  const preset = MARGIN_PRESETS.find((p) => p.id === sim.preset);
  const m = preset.m;
  const r = sim.r / 100;
  const res = simulate(r, m, sim.e);
  const P0 = PRODUCT.priceRef;
  const P1 = P0 * (1 + r);
  const unit0 = m * preset.price;
  const unit1 = res.unitM * preset.price;
  const isPromo = r < 0;

  const curve = useMemo(() => {
    const a = [];
    for (let d = 0; d <= 30; d++) {
      const x = d / 100;
      const req = x >= m ? null : x / (m - x);
      a.push({ d, req: req == null ? null : Math.min(req * 100, 250), pre: -sim.e * d, low: 50 * x * 1, off: 2 * d });
    }
    return a;
  }, [m, sim.e]);

  const reqCalc = isPromo ? {
    formula: "ΔQ / Q = Taux de remise ÷ (Taux de marge initiale − Taux de remise)",
    assumptions: [`Taux de marge initiale : ${fmtP(m)} (${preset.label})`, "Coûts variables unitaires inchangés, charges fixes inchangées", "Objectif : marge totale identique avant et après remise"],
    steps: [
      `Remise : ${fmtP(res.d)}`,
      `Marge unitaire avant : ${fmtP(m)} du prix → ${fmtE(unit0)}`,
      `Marge unitaire après : ${fmtP(m)} − ${fmtP(res.d)} = ${fmtP(res.unitM)} → ${fmtE(unit1)}`,
      res.req === Infinity ? "La remise dépasse la marge : chaque vente fait perdre de l'argent, aucun volume ne compense." :
        `ΔQ/Q = ${fmtN(res.d * 100, 1)} ÷ (${fmtN(m * 100, 1)} − ${fmtN(res.d * 100, 1)}) = ${fmtP(res.req)}`,
      res.req !== Infinity ? `Vérification : ${fmtE(unit1)} × (1 + ${fmtP(res.req)}) = ${fmtE(unit1 * (1 + res.req))} ≈ ${fmtE(unit0)}` : "",
    ].filter(Boolean),
  } : {
    formula: "Perte de volume tolérable = Hausse de prix ÷ (Taux de marge initiale + Hausse de prix)",
    assumptions: [`Taux de marge initiale : ${fmtP(m)}`, "Coûts variables inchangés"],
    steps: [`Hausse : ${fmtP(r)}`, `${fmtN(r * 100, 1)} ÷ (${fmtN(m * 100, 1)} + ${fmtN(r * 100, 1)}) = ${fmtP(-res.req)}`, "Tant que la demande baisse moins que cela, la marge totale augmente."],
  };
  const expCalc = {
    formula: "Variation de volume attendue = −Élasticité × variation de prix",
    assumptions: ["Élasticité-prix pré-saison estimée entre −0,5 et −0,8 dans le dossier (besoin immédiat d'équipement)", "En fin de saison, la demande redevient élastique (hypothèse −1,5 à −2,5)"],
    steps: [`Élasticité retenue : ${fmtN(sim.e, 2)}`, `${fmtN(-sim.e, 2)} × ${fmtP(Math.abs(r))} = ${fmtP(Math.abs(res.exp))} de volume ${isPromo ? "en plus" : "en moins"}`,
      `Marge totale : (1 ${isPromo ? "+" : "−"} ${fmtP(Math.abs(res.exp))}) × ${fmtP(res.unitM)} ÷ ${fmtP(m)} − 1 = ${fmtP(res.dM)}`],
  };
  const extraUnits = isPromo && res.req !== Infinity ? Math.ceil(sim.q0 * res.req) : null;
  const ok = isPromo ? res.exp >= res.req : res.exp > res.req;
  const verdictTone = r === 0 ? "neutral" : ok ? "good" : "bad";

  // Version A / B
  const B = sim.b;
  const PA = P1 / 1.2, PB = B.accepted / 1.2, ceil = B.ceiling / 1.2;
  const ab = [
    { name: "Version A", sub: isPromo ? `prix remisé ${fmtN(P1, 2)} €` : `prix ${fmtN(P1, 2)} €`, produit: COST_REF, variation: 0, marge: Math.max(0, PA - COST_REF), prix: PA },
    { name: "Version B", sub: "avec la variation", produit: COST_REF, variation: B.cost, marge: Math.max(0, PB - COST_REF - B.cost), prix: PB },
  ];
  const competitors = BRANDS.filter((b) => b.price != null && b.ring === "direct").sort((a, b) => a.price - b.price);
  const maxP = 420;

  return (
    <div className="flex flex-col gap-10">
      <Section eyebrow="Simulateur de remise hivernale" title="Combien de vestes en plus faut-il vendre pour que la remise paie ?">
        <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
          <Panel className="p-5 flex flex-col gap-5">
            <Slider id="r" label="Variation du prix public" value={sim.r} min={-30} max={15} step={1} onChange={(v) => setSim({ ...sim, r: v })}
              fmt={(v) => (v > 0 ? "+" : "") + v + " %"} hint={<>Prix : <strong className="tabular-nums">{fmtE(P1)}</strong> TTC (base 195 €). Au-dessus de 0 : test d'une hausse.</>} />
            <div className="flex flex-col gap-2">
              <span className="label m-0">Taux de marge initiale</span>
              {MARGIN_PRESETS.map((p) => (
                <label key={p.id} className={"radio-row" + (sim.preset === p.id ? " is-on" : "")}>
                  <input type="radio" name="preset" checked={sim.preset === p.id} onChange={() => setSim({ ...sim, preset: p.id })} />
                  <span className="flex-1 text-sm">{p.label}</span>
                  <span className="tabular-nums text-sm font-semibold">{p.est ? <Est title={p.label} calc={p.calc}>{fmtP(p.m)}</Est> : <Src href={SRC.pappersPicture}>{fmtP(p.m)}</Src>}</span>
                </label>
              ))}
            </div>
            <Slider id="e" label="Élasticité-prix de la demande" value={sim.e} min={-3} max={-0.3} step={0.05} onChange={(v) => setSim({ ...sim, e: v })}
              fmt={(v) => fmtN(v, 2)} hint={<span className="flex flex-wrap gap-2 mt-1">
                <button type="button" className="pill sm" onClick={() => setSim({ ...sim, e: -0.65 })}>Pré-saison −0,65</button>
                <button type="button" className="pill sm" onClick={() => setSim({ ...sim, e: -2 })}>Fin de saison −2</button>
                <Est title="Élasticité-prix" calc={expCalc}><span className="text-xs">source du dossier</span></Est>
              </span>} />
            <NumInput id="q0" label="Volume de référence (exemple)" value={sim.q0} onChange={(v) => setSim({ ...sim, q0: Math.max(1, v) })} suffix="vestes" note="Hypothèse pour traduire les % en unités ; remplacez par le volume réel." />
          </Panel>

          <div className="flex flex-col gap-4">
            <div className={"verdict tone-" + verdictTone}>
              {r === 0 ? (
                <p className="font-display text-xl md:text-2xl font-semibold text-balance">Déplacez le curseur pour simuler une remise.</p>
              ) : isPromo ? (
                <p className="font-display text-xl md:text-2xl font-semibold text-balance leading-snug">
                  Une remise de {fmtN(res.d * 100, 0)} % nécessite{" "}
                  <Est title="Volume d'équilibre" calc={reqCalc}>{res.req === Infinity ? "un volume infini" : "+" + fmtP(res.req, 0)}</Est>{" "}
                  de volume pour rester rentable. La demande d'avant-saison n'apporterait que{" "}
                  <Est title="Volume attendu" calc={expCalc}>+{fmtP(res.exp, 0)}</Est>.
                </p>
              ) : (
                <p className="font-display text-xl md:text-2xl font-semibold text-balance leading-snug">
                  Une hausse de {fmtN(r * 100, 0)} % reste rentable tant que les ventes baissent de moins de{" "}
                  <Est title="Perte de volume tolérable" calc={reqCalc}>{fmtP(-res.req, 0)}</Est>. Baisse attendue :{" "}
                  <Est title="Volume attendu" calc={expCalc}>{fmtP(res.exp, 0)}</Est>.
                </p>
              )}
              {r !== 0 && <p className="text-sm mt-2 flex items-center gap-2">{ok ? <L.CheckCircle2 size={16} /> : <L.AlertTriangle size={16} />}
                Marge totale attendue : <strong className="tabular-nums">{res.dM >= 0 ? "+" : ""}{fmtP(res.dM)}</strong>
                {isPromo && res.beE !== Infinity && <> · il faudrait une élasticité de <strong className="tabular-nums">{fmtN(res.beE, 2)}</strong></>}
              </p>}
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <Kpi label="Marge unitaire avant" v={<span className="tabular-nums">{fmtE(unit0)}</span>} sub={fmtP(m) + " du prix HT"} />
              <Kpi tone={isPromo ? "bad" : "good"} label="Marge unitaire après" v={<span className="tabular-nums">{fmtE(unit1)}</span>} sub={(unit1 - unit0 >= 0 ? "+" : "") + fmtE(unit1 - unit0) + " par veste"} />
              <Kpi label={isPromo ? "Ventes en plus nécessaires" : "Ventes perdues tolérables"} v={<span className="tabular-nums">{isPromo ? (extraUnits == null ? "∞" : "+" + extraUnits.toLocaleString("fr-FR")) : Math.floor(sim.q0 * -res.req).toLocaleString("fr-FR")}</span>} sub={`sur ${sim.q0.toLocaleString("fr-FR")} vestes de référence`} />
            </div>
            <Panel className="p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <div className="font-semibold text-sm">Volume nécessaire contre volume attendu, selon la remise</div>
                <button className="link-btn" onClick={() => open({ title: "Volume d'équilibre", ...reqCalc })}>Formule<L.Calculator size={13} /></button>
              </div>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={curve} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                    <CartesianGrid stroke={t.line} strokeDasharray="2 4" vertical={false} />
                    <XAxis dataKey="d" tickFormatter={(v) => "−" + v + " %"} tick={{ fill: t.muted, fontSize: 11 }} ticks={[0, 5, 10, 15, 20, 25, 30]} axisLine={{ stroke: t.line }} tickLine={false} />
                    <YAxis tickFormatter={(v) => "+" + v + " %"} tick={{ fill: t.muted, fontSize: 11 }} domain={[0, 250]} ticks={[0, 50, 100, 150, 200, 250]} axisLine={false} tickLine={false} width={56} />
                    <Tooltip content={({ active, payload, label }) => active && payload ? (
                      <div className="chart-tip"><strong>Remise −{label} %</strong>{payload.map((p) => <div key={p.dataKey} className="tabular-nums" style={{ color: p.color }}>{p.name} : {p.value == null ? "∞" : "+" + fmtN(p.value, 1) + " %"}</div>)}</div>) : null} />
                    <Legend wrapperStyle={{ fontSize: 12, color: t.muted }} />
                    {isPromo && <ReferenceLine x={-sim.r} stroke={t.ocre} strokeDasharray="4 3" />}
                    <Line type="monotone" dataKey="req" name="Volume nécessaire" stroke={t.bad} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="pre" name={`Attendu (élasticité ${fmtN(sim.e, 2)})`} stroke={t.forest} strokeWidth={2} dot={false} isAnimationActive={false} />
                    <Line type="monotone" dataKey="off" name="Attendu fin de saison (−2)" stroke={t.sage} strokeWidth={1.5} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted mt-1">La remise paie là où la courbe « attendu » passe au-dessus de la courbe « nécessaire ».</p>
            </Panel>
          </div>
        </div>
      </Section>

      <Section eyebrow="Comparateur concurrentiel" title="Notre prix face aux repères du marché">
        <Panel className="p-4">
          <div className="price-ladder">
            <div className={"ladder-marker" + (P1 < P0 ? " left" : "")} style={{ left: `calc(var(--name-w) + 10px + (100% - var(--name-w) - 130px) * ${P1 / maxP})` }}><span>Abstral {fmtN(P1, 2)} €</span></div>
            {r !== 0 && <div className="ladder-marker ghost" style={{ left: `calc(var(--name-w) + 10px + (100% - var(--name-w) - 130px) * ${P0 / maxP})` }}><span>195 €</span></div>}
            {competitors.map((b) => (
              <div key={b.id} className="ladder-row">
                <span className="ladder-name">{b.name}<span className="text-muted"> · {b.model}</span></span>
                <span className="ladder-track"><span className={"ladder-bar ring-bg-" + b.ring} style={{ width: (b.price / maxP) * 100 + "%" }} /></span>
                <span className="ladder-val tabular-nums">{b.priceEstimated ? <Est title={"Prix " + b.model} calc={b.priceCalc}>{b.price} €</Est> : <Src href={b.priceSrc || b.shop}>{fmtPr(b.price)} €</Src>}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted mt-3">Seuil de qualité perçue ≈ 130 – 140 € (Simond MT900, TNF Antora). Zone d'acceptabilité 180 – 200 €. Au-delà de 200 – 220 €, la veste affronte les 3 couches.</p>
        </Panel>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
          <Panel className="p-4">
            <div className="font-semibold text-sm mb-1">Version A contre Version B, montants HT par veste</div>
            <p className="text-xs text-muted mb-2">A = l'Abstral au prix simulé. B = l'Abstral + une variation (service ou accessoire) vendue au prix accepté dans le questionnaire.</p>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ab} margin={{ top: 24, right: 16, left: 0, bottom: 4 }} barCategoryGap="35%">
                  <CartesianGrid stroke={t.line} strokeDasharray="2 4" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: t.ink, fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: t.line }} tickLine={false} />
                  <YAxis tick={{ fill: t.muted, fontSize: 11 }} tickFormatter={(v) => v + " €"} axisLine={false} tickLine={false} width={52} domain={[0, 200]} ticks={[0, 50, 100, 150, 200]} />
                  <Tooltip cursor={{ fill: t.surface2 }} content={({ active, payload }) => active && payload ? (
                    <div className="chart-tip"><strong>{payload[0].payload.name}</strong>{payload.filter((p) => p.value > 0).map((p) => <div key={p.dataKey} className="tabular-nums">{p.name} : {fmtE(p.value)}</div>)}<div className="tabular-nums">Prix accepté HT : {fmtE(payload[0].payload.prix)}</div></div>) : null} />
                  <ReferenceLine y={ceil} stroke={t.ink} strokeDasharray="6 4" label={{ value: `plafond concurrents ${fmtN(ceil, 2)} € HT`, position: "insideBottomLeft", fill: t.ink, fontSize: 11 }} />
                  <Bar dataKey="produit" name="Produit (coût)" stackId="s" fill={t.slate} isAnimationActive={false} />
                  <Bar dataKey="variation" name="Variation" stackId="s" fill={t.ocre} isAnimationActive={false} />
                  <Bar dataKey="marge" name="Marge" stackId="s" fill={t.sage} isAnimationActive={false} radius={[3, 3, 0, 0]}>
                    <LabelList dataKey="prix" position="top" formatter={(v) => "accepté " + fmtN(v, 2) + " €"} style={{ fill: t.ink, fontSize: 11, fontWeight: 600 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm mt-2">
              {(() => {
                const mA = PA - COST_REF, mB = PB - COST_REF - B.cost;
                const gain = mB - mA;
                return gain >= 0
                  ? <>La variation coûte {fmtE(B.cost)} et fait accepter {fmtE(PB - PA)} HT de plus : elle rapporte <strong>{fmtE(gain)}</strong> de marge par veste{PB > ceil ? ", mais dépasse le plafond concurrentiel." : " et reste sous le plafond."}</>
                  : <>La variation coûte plus qu'elle ne fait accepter : <strong>{fmtE(gain)}</strong> de marge par veste.</>;
              })()}
            </p>
          </Panel>
          <Panel className="p-5 flex flex-col gap-4">
            <NumInput id="bcost" label="Coût de la variation" value={B.cost} onChange={(v) => setSim({ ...sim, b: { ...B, cost: v } })} suffix="€ HT" note="Hypothèse : kit de réparation + extension de garantie." />
            <NumInput id="bacc" label="Prix accepté pour la Version B" value={B.accepted} onChange={(v) => setSim({ ...sim, b: { ...B, accepted: v } })} suffix="€ TTC"
              note={<>Par défaut : prix maximal médian du questionnaire ({survey.isExample ? "données d'exemple" : `N = ${survey.n}`}) <button type="button" className="link-btn" onClick={() => setSim({ ...sim, b: { ...B, accepted: Math.round(survey.medTropCher) } })}>reprendre {Math.round(survey.medTropCher)} €</button></>} />
            <NumInput id="bceil" label="Plafond des concurrents" value={B.ceiling} onChange={(v) => setSim({ ...sim, b: { ...B, ceiling: v } })} suffix="€ TTC" note="Dossier : au-delà de 200 – 220 €, la veste affronte les 3 couches." />
          </Panel>
        </div>
      </Section>
    </div>
  );
}

// =========================================================
// Onglet 5 — Questionnaire
// =========================================================
function seeded(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
function gauss(rnd, mu, sd) { const u = rnd() || 1e-9, v = rnd(); return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function exampleSurvey() {
  const rnd = seeded(42);
  const rows = [];
  for (let i = 0; i < 120; i++) {
    const tb = Math.round(Math.max(60, gauss(rnd, 122, 22)) / 5) * 5;
    const tc = Math.round(Math.max(tb + 30, gauss(rnd, 218, 32)) / 5) * 5;
    const eco = Math.min(5, Math.max(1, Math.round(gauss(rnd, 3.8, 1))));
    const ap = rnd() < 0.34 ? 1 : 0;
    rows.push({ trop_bas: tb, trop_cher: tc, eco, attente_promo: ap });
  }
  return rows;
}
const median = (a) => { const s = [...a].sort((x, y) => x - y); const n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : 0; };
function summarize(rows, isExample) {
  const n = rows.length;
  const tc = rows.map((r) => r.trop_cher), tb = rows.map((r) => r.trop_bas);
  const accept = (p) => rows.filter((r) => r.trop_bas < p && p < r.trop_cher).length / n;
  return {
    rows, n, isExample,
    medTropCher: median(tc), medTropBas: median(tb),
    pay195: rows.filter((r) => r.trop_cher > 195).length / n,
    ecoAvg: rows.reduce((s, r) => s + r.eco, 0) / n,
    ecoHigh: rows.filter((r) => r.eco >= 4).length / n,
    promo: rows.filter((r) => r.attente_promo === 1).length / n,
    accept,
  };
}
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error("Le fichier doit contenir une ligne d'en-tête et au moins une réponse.");
  const sep = lines[0].includes(";") ? ";" : ",";
  const head = lines[0].split(sep).map((h) => h.trim().toLowerCase());
  const need = ["trop_bas", "trop_cher", "eco", "attente_promo"];
  const miss = need.filter((k) => !head.includes(k));
  if (miss.length) throw new Error("Colonnes manquantes : " + miss.join(", ") + ".");
  const rows = lines.slice(1).map((l) => {
    const c = l.split(sep); const o = {};
    need.forEach((k) => (o[k] = parseFloat(String(c[head.indexOf(k)] || "").replace(",", "."))));
    return o;
  }).filter((o) => need.every((k) => isFinite(o[k])));
  if (!rows.length) throw new Error("Aucune ligne exploitable : vérifiez que les valeurs sont numériques.");
  return rows;
}

function Gauge({ value, label, tone }) {
  const t = useTokens();
  const a = Math.PI * (1 - value);
  const x = 60 + 48 * Math.cos(a), y = 60 - 48 * Math.sin(a);
  const c = tone === "bad" ? t.bad : tone === "warn" ? t.warn : t.forest;
  return (
    <svg viewBox="0 0 120 72" className="w-full max-w-[200px]" role="img" aria-label={label + " " + Math.round(value * 100) + " %"}>
      <path d="M12 60 A48 48 0 0 1 108 60" fill="none" stroke={t.line} strokeWidth="10" strokeLinecap="round" />
      <path d={`M12 60 A48 48 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`} fill="none" stroke={c} strokeWidth="10" strokeLinecap="round" />
      <text x="60" y="58" textAnchor="middle" fontSize="18" fontWeight="700" fill={t.ink}>{Math.round(value * 100)} %</text>
    </svg>
  );
}

function StatMeta({ q, n, onRaw }) {
  return (
    <div className="stat-meta"><span>N = {n}</span><span className="q">« {q} »</span><button type="button" className="link-btn" onClick={onRaw}>Données brutes<L.Table size={12} /></button></div>
  );
}

function TabQuestionnaire({ survey, setSurvey, simPrice }) {
  const t = useTokens();
  const open = useContext(CalcCtx);
  const [err, setErr] = useState("");
  const s = survey;
  const raw = () => open({
    title: `Données brutes (${s.n} réponses${s.isExample ? ", exemple" : ""})`,
    extra: (
      <div className="table-wrap mt-3 max-h-[50vh] overflow-y-auto">
        <table className="data-table"><thead><tr><th>#</th><th>trop_bas</th><th>trop_cher</th><th>eco</th><th>attente_promo</th></tr></thead>
          <tbody>{s.rows.map((r, i) => <tr key={i}><td>{i + 1}</td><td>{r.trop_bas}</td><td>{r.trop_cher}</td><td>{r.eco}</td><td>{r.attente_promo}</td></tr>)}</tbody></table>
      </div>),
  });
  const curve = useMemo(() => { const a = []; for (let p = 80; p <= 320; p += 5) a.push({ p, acc: +(s.accept(p) * 100).toFixed(1) }); return a; }, [s]);
  const best = curve.reduce((b, c) => (c.acc > b.acc ? c : b), curve[0]);
  const ecoHist = [1, 2, 3, 4, 5].map((k) => ({ k: String(k), n: s.rows.filter((r) => r.eco === k).length }));
  const onFile = (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => { try { setSurvey(summarize(parseCSV(String(rd.result)), false)); setErr(""); } catch (x) { setErr(x.message); } };
    rd.readAsText(f);
  };

  return (
    <div className="flex flex-col gap-8">
      {s.isExample && (
        <div className="example-banner">
          <L.AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <div className="text-sm"><strong>Données d'exemple.</strong> Le dossier ne contient pas encore les réponses au questionnaire : les chiffres ci-dessous sont simulés (N = 120) pour montrer la restitution. Importez votre fichier CSV pour les remplacer.</div>
        </div>
      )}
      <Panel className="p-4 flex flex-wrap items-center gap-4 justify-between">
        <div className="text-sm min-w-0">
          <div className="font-semibold">Importer les réponses (CSV)</div>
          <div className="text-xs text-muted">Colonnes attendues : <code>trop_bas ; trop_cher ; eco ; attente_promo</code> (séparateur ; ou ,)</div>
          {err && <div className="text-xs text-bad mt-1">{err}</div>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <label className="btn"><L.Upload size={15} />Choisir un fichier<input id="csv" type="file" accept=".csv,text/csv" className="sr-only" onChange={onFile} /></label>
          {!s.isExample && <button className="btn ghost" onClick={() => setSurvey(summarize(exampleSurvey(), true))}>Revenir à l'exemple</button>}
        </div>
      </Panel>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi label="Répondants" v={s.n} sub={s.isExample ? "exemple simulé" : "fichier importé"} />
        <Kpi label="Prix maximal médian" v={<span className="tabular-nums">{fmtN(s.medTropCher, 0)} €</span>} sub="au-delà : trop cher" />
        <Kpi label="Prêts à payer 195 €" v={<span className="tabular-nums">{fmtP(s.pay195, 0)}</span>} sub="prix max > 195 €" tone={s.pay195 >= 0.5 ? "good" : "bad"} />
        <Kpi label="Attendraient une promo" v={<span className="tabular-nums">{fmtP(s.promo, 0)}</span>} sub="effet d'aubaine potentiel" tone="warn" />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <Panel className="p-4">
          <div className="font-semibold text-sm">Part des répondants pour qui le prix est acceptable</div>
          <div className="text-xs text-muted mb-2">Prix ni « trop bas » ni « trop cher ». Pic à {best.p} € ({fmtN(best.acc, 0)} %).</div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={curve} margin={{ top: 8, right: 16, left: 0, bottom: 4 }}>
                <CartesianGrid stroke={t.line} strokeDasharray="2 4" vertical={false} />
                <XAxis dataKey="p" type="number" domain={[80, 320]} ticks={[100, 150, 200, 250, 300]} tickFormatter={(v) => v + " €"} tick={{ fill: t.muted, fontSize: 11 }} axisLine={{ stroke: t.line }} tickLine={false} />
                <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => v + " %"} tick={{ fill: t.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={48} />
                <Tooltip content={({ active, payload, label }) => active && payload ? <div className="chart-tip"><strong>{label} €</strong><div className="tabular-nums">{payload[0].value} % acceptent</div></div> : null} />
                <ReferenceLine x={195} stroke={t.ocre} strokeDasharray="4 3" label={{ value: "195 €", fill: t.ocre, fontSize: 11, position: "top" }} />
                {Math.abs(simPrice - 195) > 0.5 && <ReferenceLine x={Math.round(simPrice)} stroke={t.bad} strokeDasharray="2 3" label={{ value: "simulé", fill: t.bad, fontSize: 11, position: "insideTopLeft" }} />}
                <Line type="monotone" dataKey="acc" stroke={t.forest} strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <StatMeta q={SURVEY_Q.trop_bas + " / " + SURVEY_Q.trop_cher} n={s.n} onRaw={raw} />
        </Panel>
        <Panel className="p-4 flex flex-col gap-3">
          <div className="font-semibold text-sm">Importance des engagements écologiques</div>
          <div className="h-[170px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ecoHist} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
                <XAxis dataKey="k" tick={{ fill: t.muted, fontSize: 11 }} axisLine={{ stroke: t.line }} tickLine={false} />
                <YAxis hide />
                <Bar dataKey="n" fill={t.sage} radius={[3, 3, 0, 0]} isAnimationActive={false}><LabelList dataKey="n" position="top" style={{ fill: t.ink, fontSize: 11 }} /></Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-muted">Note de 1 (aucune) à 5 (déterminante). Moyenne {fmtN(s.ecoAvg, 1)}.</div>
          <StatMeta q={SURVEY_Q.eco} n={s.n} onRaw={raw} />
        </Panel>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        <Panel className="p-4 flex flex-col items-center gap-2 text-center">
          <div className="font-semibold text-sm">Sensibilité au prix</div>
          <Gauge value={1 - s.pay195} tone={1 - s.pay195 > 0.5 ? "bad" : "warn"} label="Sensibilité" />
          <div className="text-xs text-muted">Part des répondants pour qui 195 € est trop cher</div>
          <StatMeta q={SURVEY_Q.trop_cher} n={s.n} onRaw={raw} />
        </Panel>
        <Panel className="p-4 flex flex-col items-center gap-2 text-center">
          <div className="font-semibold text-sm">Adhésion aux valeurs écoresponsables</div>
          <Gauge value={s.ecoHigh} label="Adhésion" />
          <div className="text-xs text-muted">Part notant 4 ou 5 l'importance de l'écologie</div>
          <StatMeta q={SURVEY_Q.eco} n={s.n} onRaw={raw} />
        </Panel>
      </div>
    </div>
  );
}

// =========================================================
// Onglet 6 — Synthèse
// =========================================================
function TabSynthese() {
  const m = MARGIN_PRESETS[0].m;
  const rows = [10, 15, 20, 30].map((d) => ({ ...simulate(-d / 100, m, -0.65), pct: d, lo: simulate(-d / 100, m, -0.5), hi: simulate(-d / 100, m, -0.8) }));
  const r15 = rows[1];
  return (
    <div className="flex flex-col gap-10">
      <div className="answer">
        <div className="eyebrow">Réponse à la problématique</div>
        <p className="font-display text-2xl md:text-3xl font-semibold leading-snug text-balance mt-2">
          Non. Une promotion avant le pic hivernal détruirait de la marge : à −15 %, il faudrait vendre{" "}
          <Est title="Volume d'équilibre à −15 %" calc={{ formula: "ΔQ/Q = r ÷ (m − r)", assumptions: ["m = 45,8 % (marge brute Picture 2026)", "r = 15 %"], steps: ["15 ÷ (45,8 − 15) = 15 ÷ 30,8 = 48,7 %"] }}>+{fmtP(r15.req, 0)}</Est>{" "}
          de vestes pour compenser, alors que la demande d'avant-saison n'en apporterait que{" "}
          <Est title="Volume attendu à −15 %" calc={{ formula: "ΔQ/Q = −e × r", assumptions: ["Élasticité pré-saison −0,5 à −0,8 (dossier)"], steps: ["0,5 × 15 % = 7,5 %", "0,8 × 15 % = 12 %"] }}>+8 à +12 %</Est>.
        </p>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Remise</th><th className="text-right">Volume nécessaire</th><th className="text-right">Volume attendu (pré-saison)</th><th className="text-right">Marge totale</th><th className="text-right">Élasticité requise</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.pct}>
              <td className="font-semibold">−{r.pct} %</td>
              <td className="text-right tabular-nums text-bad font-semibold">+{fmtP(r.req, 0)}</td>
              <td className="text-right tabular-nums">+{fmtP(r.lo.exp, 0)} à +{fmtP(r.hi.exp, 0)}</td>
              <td className="text-right tabular-nums">{fmtP(r.lo.dM, 0)} à {fmtP(r.hi.dM, 0)}</td>
              <td className="text-right tabular-nums">{fmtN(r.beE, 1)}</td>
            </tr>))}</tbody>
        </table>
        <p className="text-xs text-muted mt-2 px-1">Base : marge brute Picture 2026 de 45,8 % (<Src href={SRC.pappersPicture}>Pappers</Src>). Avec la marge en vente directe (76,6 %), une remise de 15 % demande encore +24 % de volume, pour +8 à +12 % attendus.</p>
      </div>

      <Section eyebrow="Analyse des risques" title="Pourquoi la haute saison est le pire moment pour remiser">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Risk icon={<L.TrendingDown size={18} />} title="Demande inélastique">À l'approche de l'hiver, le besoin est immédiat. La baisse de prix profite surtout à des clients qui auraient acheté de toute façon (effet d'aubaine).</Risk>
          <Risk icon={<L.ShieldAlert size={18} />} title="Valeur perçue">Sur le haut de gamme technique, 160 € fait douter de la membrane et de la durabilité. La Torrentshell 3L est à 200 €, seulement 5 € de plus.</Risk>
          <Risk icon={<L.Landmark size={18} />} title="Bilan sans coussin">Résultat net <Src href={SRC.pappersPicture}>−2,63 M€</Src>, capitaux propres <Src href={SRC.pappersPicture}>−1,3 M€</Src>, trésorerie <Src href={SRC.pappersPicture}>1,18 M€</Src> : Picture ne peut pas financer une baisse de marge.</Risk>
          <Risk icon={<L.Tag size={18} />} title="Remises déjà en rayon">L'Abstral est déjà à <Src href={SRC.snowleader}>126,90 € chez Snowleader</Src> (−35 %). Une promo de marque s'ajouterait à celles des revendeurs.</Risk>
        </div>
      </Section>

      <FinCompare />

      <Section eyebrow="Recommandations managériales" title="Tenir 195 € en novembre-décembre, et créer de la valeur autrement">
        <div className="grid md:grid-cols-2 gap-4">
          {[
            ["Maintenir le prix plein jusqu'à fin décembre", "195 € est juste sous la barre psychologique des 200 € et dans la zone 180 – 200 € des 2,5 couches éco-conçues. Communiquer sur la technicité (20K/20K, sans PFC) plutôt que sur le prix.", <L.Lock size={18} />],
            ["Offre groupée « bundle »", "Abstral + pantalon ou sous-couche à prix d'ensemble : la remise porte sur le panier, pas sur la veste phare, et augmente le panier moyen.", <L.Package size={18} />],
            ["Valoriser garantie et réparabilité", "Version B : kit de réparation et extension de garantie. Le comparateur montre qu'une variation à 6 € qui fait accepter un prix plus élevé améliore la marge sans toucher au prix affiché.", <L.Wrench size={18} />],
            ["Promotions réservées et ciblées", "Avantage réservé aux membres (programme Circular, reprise d'une ancienne veste) : on récompense la fidélité sans casser le prix public.", <L.Users size={18} />],
            ["Remiser les invendus après le pic", "En janvier-février, la demande redevient élastique (≈ −2) : une remise de 10 – 15 % sur le stock restant devient défendable et libère de la trésorerie.", <L.CalendarClock size={18} />],
            ["Encadrer les revendeurs", "Le prix constaté à −35 % chez un revendeur majeur dégrade la valeur perçue. Revoir les conditions de démarque avec les distributeurs avant la saison.", <L.Handshake size={18} />],
          ].map(([h, p, ic]) => (
            <div key={h} className="reco"><span className="reco-ic">{ic}</span><div><div className="font-semibold">{h}</div><p className="text-sm text-muted mt-1">{p}</p></div></div>
          ))}
        </div>
      </Section>
    </div>
  );
}
const FIN_PEERS = [
  { name: "Picture", period: "2026", ca: 27.1, mb: "45,8 %", rn: "−2,63 M€", cpv: -1.3, cp: "−1,3 M€", treso: 1.18, dette: "10,7 M€ (2025)", src: SRC.pappersPicture, us: true },
  { name: "K-Way France", period: "2025", ca: 53.8, mb: "67,7 %", rn: "+7,0 M€", cpv: 48.2, cp: "48,2 M€ (81 %)", treso: 5.5, dette: "≈ 0", src: SRC.kwayPdf },
  { name: "Patagonia Europe", period: "2025", ca: 243.6, mb: "54,4 %", rn: "+5,6 M€*", cpv: 49.7, cp: "49,7 M€ (54 %)", treso: 12.0, dette: "Aucune", src: SRC.patagoniaPdf },
  { name: "Millet", period: "2025", ca: 73.45, mb: "—", rn: "+2,07 M€", cpv: 32.95, cp: "32,95 M€ (58 %)", treso: 15.84, dette: "0 €", src: SRC.millet, tresoNote: "dont cash-pooling" },
  { name: "Columbia Europe", period: "2024", ca: 75.69, mb: "—", rn: "+1,45 M€", cpv: 20.78, cp: "20,78 M€ (61 %)", treso: 6.31, dette: "Aucune", src: SRC.columbia },
];
const PROMO_SHARE = 0.10, PROMO_RATE = 0.15;

function FinCompare() {
  const t = useTokens();
  const rows = FIN_PEERS.map((p) => { const cost = p.ca * PROMO_SHARE * PROMO_RATE; return { ...p, cost, ratio: p.cpv > 0 ? cost / p.cpv : null }; });
  const calc = (p) => ({
    formula: "Coût de la promotion = CA × part du CA remisée × taux de remise ; poids = coût ÷ capitaux propres",
    assumptions: ["Remise de 15 % sur une gamme qui pèse 10 % du chiffre d'affaires", "Volume inchangé (cas pré-saison, demande peu élastique) : la remise est une perte sèche de chiffre d'affaires et de marge", "Capitaux propres de fin d'exercice publiés"],
    steps: [`${fmtN(p.ca, 2)} M€ × 10 % × 15 % = ${fmtN(p.ca * PROMO_SHARE * PROMO_RATE, 2)} M€`, p.cpv > 0 ? `${fmtN(p.ca * PROMO_SHARE * PROMO_RATE, 2)} ÷ ${fmtN(p.cpv, 2)} M€ de capitaux propres = ${fmtP(p.ca * PROMO_SHARE * PROMO_RATE / p.cpv, 1)}` : `Capitaux propres négatifs (${fmtN(p.cpv, 2)} M€) : aucune réserve pour absorber ce coût, qui creuserait la perte de ${fmtN(p.ca * PROMO_SHARE * PROMO_RATE, 2)} M€`],
  });
  const max = Math.max(...rows.filter((r) => r.ratio != null).map((r) => r.ratio));
  return (
    <Section eyebrow="Ce que disent les comptes" title="Les concurrents bien capitalisés peuvent financer une promotion, Picture non">
      <p className="text-sm max-w-prose">Une remise en pleine saison se paie comptant : à volume quasi inchangé, chaque euro de remise est un euro de marge perdu. Pour le supporter, il faut des fonds propres et de la trésorerie. On compare donc ce que coûterait la même opération à Picture et à des concurrents dont nous avons les comptes : une remise de 15 % sur une gamme qui pèse 10 % du chiffre d'affaires.</p>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Entreprise</th><th className="text-right">CA</th><th className="text-right">Résultat net</th><th className="text-right">Capitaux propres</th><th className="text-right">Trésorerie</th><th className="text-right">Dette fin.</th><th className="text-right">Coût promo</th><th>Poids / capitaux propres</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.name} className={r.us ? "row-us" : ""}>
              <td className="font-semibold whitespace-nowrap">{r.name}<span className="block text-xs text-muted font-normal">exercice {r.period}</span></td>
              <td className="text-right tabular-nums whitespace-nowrap"><Src href={r.src}>{fmtN(r.ca, 1)} M€</Src></td>
              <td className={"text-right tabular-nums whitespace-nowrap " + (r.us ? "text-bad" : "")}><Src href={r.src}>{r.rn}</Src></td>
              <td className={"text-right tabular-nums whitespace-nowrap " + (r.us ? "text-bad" : "")}><Src href={r.src}>{r.cp}</Src></td>
              <td className="text-right tabular-nums whitespace-nowrap"><Src href={r.src}>{fmtN(r.treso, 2)} M€</Src>{r.tresoNote && <span className="block text-xs text-muted">{r.tresoNote}</span>}</td>
              <td className="text-right tabular-nums whitespace-nowrap"><Src href={r.src}>{r.dette}</Src></td>
              <td className="text-right tabular-nums whitespace-nowrap"><Est title={"Coût de la promotion, " + r.name} calc={calc(r)}>{fmtN(r.cost, 2)} M€</Est></td>
              <td className="min-w-[130px]">{r.ratio == null ? <span className="text-sm font-semibold text-bad">Impossible : déjà négatifs</span> : <div className="flex items-center gap-2"><span className="mini-track flex-1"><span style={{ width: (r.ratio / max) * 100 + "%", background: t.forest }} /></span><span className="tabular-nums text-sm font-semibold">{fmtP(r.ratio, 1)}</span></div>}</td>
            </tr>))}</tbody>
        </table>
      </div>
      <p className="text-xs text-muted">* Patagonia : résultat net plafonné par le contrat de franchise avec la maison mère ; son résultat avant redevance atteint 46,9 M€ (19,3 % du CA). Picture 2025 : dettes financières de 10,7 M€ et incertitude significative sur la continuité d'exploitation selon le commissaire aux comptes.</p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="reco"><span className="reco-ic"><L.ShieldCheck size={18} /></span><div><div className="font-semibold">Avec des fonds, la promotion est un choix possible</div><p className="text-sm text-muted mt-1">K-Way dégage 7 M€ de bénéfice avec une marge commerciale de 67,7 % et finance 81 % de son bilan par ses fonds propres. Patagonia et Millet n'ont aucune dette et disposent de 12 à 16 M€ de liquidités. Pour eux, la même remise ne représente que 2 à 7 % de leurs capitaux propres : ils peuvent l'utiliser pour gagner des parts de marché, écouler un stock ou contrer un concurrent, puis revenir au prix plein.</p></div></div>
        <div className="reco" style={{ borderColor: "color-mix(in srgb, var(--bad) 40%, var(--line))" }}><span className="reco-ic" style={{ background: "color-mix(in srgb, var(--bad) 14%, transparent)", color: "var(--bad)" }}><L.AlertTriangle size={18} /></span><div><div className="font-semibold">Pour Picture, elle mettrait l'entreprise en danger</div><p className="text-sm text-muted mt-1">La même opération coûterait environ 0,41 M€, soit plus d'un tiers de la trésorerie restante (1,18 M€), et porterait la perte de 2,63 M€ à plus de 3 M€. Avec des capitaux propres déjà négatifs et 10,7 M€ de dettes financières, l'entreprise n'a aucune réserve pour l'absorber. La promotion pèserait directement sur le plan de redressement et sur le soutien des banques.</p></div></div>
      </div>
    </Section>
  );
}

function Risk({ icon, title, children }) {
  return <div className="risk"><div className="flex items-center gap-2 font-semibold text-bad">{icon}<span className="text-ink">{title}</span></div><p className="text-sm mt-2 leading-relaxed">{children}</p></div>;
}

// =========================================================
// App
// =========================================================
const TABS = [
  { id: "presentation", label: "Présentation", icon: L.Mountain },
  { id: "concurrence", label: "Concurrence", icon: L.Target },
  { id: "couts", label: "Coûts", icon: L.Factory },
  { id: "prix", label: "Prix et promotion", icon: L.Percent },
  { id: "questionnaire", label: "Questionnaire", icon: L.ClipboardList },
  { id: "synthese", label: "Synthèse", icon: L.Flag },
];

const MAST = {
  presentation: { title: "Le marché", body: "Le marché mondial de l'outdoor technique regroupe l'ensemble des vêtements, chaussures et équipements conçus pour les activités de plein air et de montagne (randonnée, ski, snowboard, trail, escalade), dont les vestes techniques imperméables et respirantes constituent l'un des segments clés. Picture Organic Clothing s'y positionne sur le créneau des vêtements de glisse et de montagne éco-conçus, en milieu et haut de gamme." },
  concurrence: { title: "La concurrence", body: <>Ce marché est <Src href="https://www.businessresearchinsights.com/fr/market-reports/outdoor-apparel-and-equipment-market-125148">en croissance soutenue depuis la pandémie de 2020</Src>. Il est très concurrentiel : Picture y affronte à la fois des concurrents directs, proposant eux aussi des vêtements de glisse et de montagne éco-conçus, et des concurrents plus indirects, comme les grandes marques généralistes de l'outdoor, dont certaines sont développées et installées depuis des décennies.</> },
  couts: { title: "Les coûts", body: "Afin de déterminer la marge dont Picture dispose ainsi que la limite de rentabilité d'une promotion, une estimation du coût de revient de la veste Abstral a été réalisée." },
  prix: { title: "Prix et promotion", body: "À l'approche de l'hiver, saison clé pour les vêtements de glisse et de montagne, nous nous sommes demandé quels prix et quelles offres promotionnelles pourraient être pratiqués par Picture afin d'accroître les ventes de la veste Abstral 2.5L." },
  questionnaire: { title: "Le questionnaire", body: <>Pour y répondre, nous avons mené un questionnaire auprès d'un public varié afin de comprendre comment les consommateurs perçoivent le prix de la veste Abstral et dans quelle mesure une promotion influence leur intention d'achat.<span className="block mt-3">Voici notre questionnaire : <Src href="https://prix-zeta.vercel.app">https://prix-zeta.vercel.app</Src></span></> },
  synthese: { title: "Synthèse", body: "Est-il pertinent d'appliquer une politique promotionnelle à l'approche du pic saisonnier hivernal pour la veste Abstral 2.5L, et quel surcroît de volume de ventes est requis pour compenser la baisse de marge unitaire ?" },
};

function App() {
  const initial = (() => { const h = (location.hash || "").replace("#", ""); return TABS.some((t) => t.id === h) ? h : "presentation"; })();
  const [tab, setTab] = useState(initial);
  const [calc, setCalc] = useState(null);
  const [sim, setSim] = useState({ r: -15, preset: "compta", e: -0.65, q0: 1000, b: { cost: 6, accepted: 210, ceiling: 220 } });
  const [survey, setSurvey] = useState(() => summarize(exampleSurvey(), true));
  useEffect(() => { setSim((s) => ({ ...s, b: { ...s.b, accepted: Math.round(survey.medTropCher) } })); }, [survey]);
  const go = (id) => { setTab(id); try { history.replaceState(null, "", "#" + id); } catch (e) {} window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" }); };
  useEffect(() => { const f = () => { const h = location.hash.replace("#", ""); if (TABS.some((t) => t.id === h)) setTab(h); }; window.addEventListener("hashchange", f); return () => window.removeEventListener("hashchange", f); }, []);

  return (
    <CalcCtx.Provider value={setCalc}>
      <header className="masthead">
        <div className="wrap py-7 md:py-9 flex flex-col gap-3">
          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">{MAST[tab].title}</h1>
          <p className="market-intro">{MAST[tab].body}</p>
          {tab === "presentation" && (
            <div className="problem-box">
              <div className="eyebrow">Problématique</div>
              <p className="font-display text-lg md:text-xl font-semibold leading-snug text-balance">Est-il pertinent d'appliquer une politique promotionnelle à l'approche du pic saisonnier hivernal pour la veste Abstral 2.5L, et quel surcroît de volume de ventes est requis pour compenser la baisse de marge unitaire ?</p>
            </div>
          )}
        </div>
      </header>
      <nav className="tabs" aria-label="Onglets">
        <div className="wrap flex gap-1 overflow-x-auto no-scrollbar" role="tablist">
          {TABS.map((tb, i) => {
            const I = tb.icon;
            return (
              <button key={tb.id} role="tab" aria-selected={tab === tb.id} className={"tab" + (tab === tb.id ? " is-on" : "")} onClick={() => go(tb.id)}>
                <span className="tab-n">{i + 1}</span><I size={15} aria-hidden="true" />{tb.label}
              </button>
            );
          })}
        </div>
      </nav>
      <main className="wrap py-8 md:py-10" role="tabpanel">
        {tab === "presentation" && <TabPresentation />}
        {tab === "concurrence" && <TabConcurrence />}
        {tab === "couts" && <TabCouts />}
        {tab === "prix" && <TabPrix sim={sim} setSim={setSim} survey={survey} />}
        {tab === "questionnaire" && <TabQuestionnaire survey={survey} setSurvey={setSurvey} simPrice={PRODUCT.priceRef * (1 + sim.r / 100)} />}
        {tab === "synthese" && <TabSynthese />}
        <div className="flex justify-between gap-3 mt-12 pt-6 border-t border-line">
          {TABS.findIndex((x) => x.id === tab) > 0 ? <button className="btn ghost" onClick={() => go(TABS[TABS.findIndex((x) => x.id === tab) - 1].id)}>← {TABS[TABS.findIndex((x) => x.id === tab) - 1].label}</button> : <span />}
          {TABS.findIndex((x) => x.id === tab) < TABS.length - 1 && <button className="btn" onClick={() => go(TABS[TABS.findIndex((x) => x.id === tab) + 1].id)}>{TABS[TABS.findIndex((x) => x.id === tab) + 1].label} →</button>}
        </div>
      </main>
      <footer className="wrap pb-10 text-xs text-muted flex flex-col gap-3"><Legendary />Données : dossier « Prix et budget – Picture », comptes publiés (Pappers, theaccounts.uk), fiche produit Picture. Les estimations sont signalées et détaillées.</footer>
      <CalcModal data={calc} onClose={() => setCalc(null)} />
    </CalcCtx.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
