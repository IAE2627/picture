// ============================================================
// data.js — Toutes les données du dashboard, issues du document
// « Prix et budget – Picture.docx » + sources vérifiées en ligne.
// Chaque DataPoint : { label, value, isEstimated, sourceUrl?, calculationDetails? }
// ============================================================

const JACKET_IMG = "__JACKET_IMG__";

const SRC = {
  pappersPicture: "https://www.pappers.fr/entreprise/picture-organic-clothing-509202180",
  snowleader: "https://www.snowleader.com/en/abstral-2-5l-jkt-tobacco-PICT06149.html",
  snowleaderW: "https://www.snowleader.nl/en/abstral-2-5l-jkt-w-ash-rose-PICT03248.html",
  pictureSite: "https://www.picture-organic-clothing.com/fr/",
  pictureMadeIn: "https://eco.picture-organic-clothing.com/fr/made-in-france/",
  outdoorsMagic: "https://outdoorsmagic.com/article/picture-abstral-2-5l-jacket-review/",
  patagoniaPdf: "https://www.pappers.fr/entreprise/patagonia-europe-cooperatief-ua-succursale-francaise-789919719/comptes/PATAGONIA%20EUROPE%20COOPERATIEF%20U.A.%20-%20SUCCURSALE%20FRANCAISE%20-%20Comptes%20sociaux%202025%2005-05-2026.pdf",
  simond: "https://www.pappers.fr/entreprise/etablissements-simond-606920775",
  simondPdf: "https://www.pappers.fr/entreprise/etablissements-simond-606920775/comptes/ETABLISSEMENTS%20SIMOND%20-%20Comptes%20sociaux%202024%2030-09-2025.pdf",
  columbia: "https://www.pappers.fr/entreprise/columbia-sportswear-europe-393919253",
  columbiaProduct: "https://www.columbiasportswear.fr/FR/p/veste-impermeable-compactable-trailborne-25-couches-homme-2155153.html?dwvar_2155153_color=632",
  salomon: "https://www.pappers.fr/entreprise/salomon-sas-325820751",
  millet: "https://www.pappers.fr/entreprise/millet-mountain-group-sas-400313318",
  burton: "https://www.pappers.fr/entreprise/sga-burton-318148467",
  volcom: "https://www.pappers.fr/entreprise/volcom-sas-488298621",
  amer: "https://www.pappers.fr/entreprise/amer-sports-france-062501275",
  tcf: "https://www.pappers.fr/entreprise/tcf-889426573",
  kwayPdf: "https://www.pappers.fr/entreprise/k-way-france-753625268/comptes/K-WAY%20FRANCE%20-%20Comptes%20sociaux%202025%2010-04-2026.pdf",
  aiglePdf: "https://www.pappers.fr/entreprise/aigle-international-314397712/comptes/AIGLE%20INTERNATIONAL%20-%20Comptes%20sociaux%202024%2029-07-2025.pdf",
  aigleMission: "https://www.aigle.com/on/demandware.static/-/Library-Sites-Librarie-shard-aigle/default/dw2dad0f92/documents/2025-AIGLE_RAPPORT_MISSION_2025_DIGIT-BD_VF.pdf",
  rab: "https://theaccounts.uk/company/01168470/equip-outdoor-technologies-uk-limited/",
  consoglobe: "https://www.consoglobe.com/sports-hiver-marques-ecoresponsables-cg/2",
};

// ---------- Produit ----------
const PRODUCT = {
  name: "Abstral 2.5L Jacket",
  priceTTC: { label: "Prix catalogue", value: 194.9, isEstimated: false, sourceUrl: SRC.snowleader },
  priceRef: 195, // arrondi utilisé dans tous les calculs du dossier
  priceRetailNow: { label: "Prix constaté chez Snowleader (oct. 2026)", value: 126.9, isEstimated: false, sourceUrl: SRC.snowleader },
  colors: [
    { id: "tobacco", name: "Tobacco", hex: "#8A5A2B", verified: true, sourceUrl: SRC.snowleader },
    { id: "ashrose", name: "Ash Rose (femme)", hex: "#C3A09A", verified: true, sourceUrl: SRC.snowleaderW },
    { id: "black", name: "Black", hex: "#232526", verified: false },
    { id: "darkblue", name: "Dark Blue", hex: "#24344C", verified: false },
  ],
  specs: [
    { k: "Construction", v: "2,5 couches, coutures entièrement étanchées", src: SRC.snowleader },
    { k: "Membrane", v: "DryPlay 20K / 20K (imperméabilité / respirabilité)", src: SRC.snowleader },
    { k: "Tissu", v: "52 % polyester recyclé, 48 % polyester circulaire", src: SRC.snowleader },
    { k: "Déperlant", v: "Teflon EcoElite, sans PFC", src: SRC.snowleader },
    { k: "Poids", v: "466 g", src: SRC.snowleader },
    { k: "Compacité", v: "Se range dans sa poche droite", src: SRC.snowleader },
    { k: "Zips", v: "YKK pleine longueur, ventilations zippées", src: SRC.snowleader },
    { k: "Certification", v: "Oeko-Tex Standard 100", src: SRC.snowleader },
  ],
  hotspots: [
    { id: "hood", label: "Capuche réglable", text: "Capuche haute avec cordons de serrage, doublure grise.", uv: [0.333, 0.143] },
    { id: "zip", label: "Zip YKK étanche", text: "Fermeture frontale pleine longueur YKK.", uv: [0.5, 0.74] },
    { id: "pocket", label: "Poche poitrine zippée", text: "Poche verticale zippée et étanche.", uv: [0.606, 0.487] },
    { id: "seams", label: "Membrane DryPlay 20K", text: "Coutures étanchées, 20 000 mm / 20 000 g/m²/24h.", uv: [0.3, 0.6] },
    { id: "cuff", label: "Poignets velcro", text: "Pattes auto-agrippantes pour ajuster les manches.", uv: [0.915, 0.962] },
    { id: "pack", label: "Compressible", text: "La veste se range dans sa propre poche droite.", uv: [0.28, 0.84] },
  ],
};

// ---------- Picture : comptes (Pappers) ----------
const PICTURE_FIN = [
  { year: "2024", ca: 40.8, mb: 16.8, ebe: 1.55, rn: 0.0127, cp: 2.97, treso: 4.38 },
  { year: "2025", ca: 33.0, mb: 14.6, ebe: -0.953, rn: -0.924, cp: 1.65, treso: 3.1 },
  { year: "2026", ca: 27.1, mb: 12.4, ebe: -0.921, rn: -2.63, cp: -1.3, treso: 1.18 },
];

// ---------- Coût de fabrication (estimation centrale du dossier) ----------
const COST_ITEMS = [
  {
    id: "mat", label: "Matières et composants", value: 17, range: "13 – 25 €", group: "Sortie d'usine",
    calc: {
      formula: "Matières = textile extérieur + membrane/laminage + DWR + zips + bandes d'étanchéité + accessoires + étiquettes",
      assumptions: [
        "Veste de 466 g, consommation de 1,5 à 1,8 m de tissu principal, chutes de coupe incluses",
        "Prix de tissus techniques relevés chez des fournisseurs industriels, majorés pour une membrane 20K/20K",
        "Le textile laminé est acheté comme un seul ensemble (pratique courante)",
      ],
      steps: [
        "Textile extérieur polyester circulaire : 4 – 7 €",
        "Membrane DryPlay et laminage 2,5L : 3 – 6 €",
        "Déperlant sans PFC : 0,30 – 0,80 €",
        "Zips YKK et fermetures : 3 – 5 €",
        "Bande d'étanchéité des coutures : 1 – 2 €",
        "Cordons, réglages, velcros : 1,50 – 3 €",
        "Étiquettes et marquage : 0,50 – 1 €",
        "Total : 13,30 – 24,80 € → hypothèse centrale retenue 17 €",
      ],
    },
  },
  {
    id: "mo", label: "Main-d'œuvre d'assemblage", value: 8, range: "6 – 12 €", group: "Sortie d'usine",
    calc: {
      formula: "MO = temps de confection (min) × coût minute de l'atelier",
      assumptions: [
        "Production industrielle en Asie (partenaire Li Lian, Dongguan, Chine)",
        "84 % du volume Picture concentré dans 2 usines sur 22",
        "Opérations plus longues qu'un basique : panneaux, zips, capuche, ventilations",
      ],
      steps: ["Fourchette plausible 6 – 12 €", "Hypothèse centrale : 8 €"],
    },
  },
  {
    id: "fin", label: "Étanchéification et contrôle qualité", value: 3, range: "2 – 5 €", group: "Sortie d'usine",
    calc: {
      formula: "Thermosoudage des coutures + tests d'imperméabilité + contrôle final",
      assumptions: ["Coutures entièrement collées (fiche produit)", "Tests d'imperméabilité par lot"],
      steps: ["Fourchette 2 – 5 €", "Hypothèse centrale : 3 €"],
    },
  },
  {
    id: "ind", label: "Frais indirects de l'usine", value: 4, range: "3 – 6 €", group: "Sortie d'usine",
    calc: {
      formula: "Frais indirects ≈ quote-part énergie, encadrement, amortissement machines de l'usine",
      assumptions: ["Hypothèse de travail pour un atelier de vêtements techniques"],
      steps: ["Fourchette 3 – 6 €", "Hypothèse centrale : 4 €"],
    },
  },
  {
    id: "emb", label: "Emballage individuel", value: 1, range: "0,50 – 1,50 €", group: "Sortie d'usine",
    calc: { formula: "Sachet + étiquetage logistique", assumptions: ["Emballage unitaire standard"], steps: ["Hypothèse centrale : 1 €"] },
  },
  {
    id: "tr", label: "Transport maritime et logistique amont", value: 2.5, range: "1,50 – 4 €", group: "Import",
    calc: {
      formula: "Fret conteneur ÷ nombre de vestes par conteneur + assurance + pré/post-acheminement",
      assumptions: ["Picture privilégie le transport maritime (site Picture)", "Veste compressible : forte densité par carton"],
      steps: ["Fourchette 1,50 – 4 €", "Hypothèse centrale : 2,50 €"],
    },
  },
  {
    id: "dou", label: "Douane et frais d'importation", value: 2, range: "0 – 4 €", group: "Import",
    calc: {
      formula: "Provision = droit de douane × valeur en douane + frais de dédouanement",
      assumptions: [
        "Provision indicative du dossier : dépend du classement tarifaire et de l'origine",
        "Point à vérifier : le tarif douanier commun applique en principe 12 % aux vestes en fibres synthétiques (position 6201) importées de Chine, soit ≈ 12 % × 35,5 € ≈ 4,30 €. La provision de 2 € est donc probablement basse.",
      ],
      steps: ["Fourchette du dossier 0 – 4 €", "Hypothèse centrale : 2 €"],
    },
  },
];

const COST_TOTAL = COST_ITEMS.reduce((s, c) => s + c.value, 0); // 37,5
const COST_REF = 38; // arrondi retenu par le dossier

// ---------- Chaîne de valeur ----------
const PRICE_HT = 162.5;
const COEF_RETAIL = 2.1;
const WHOLESALE_HT = +(PRICE_HT / COEF_RETAIL).toFixed(2); // 77,38

// ---------- Concurrents ----------
// eco : grille 5 critères notés 0/1/2 → /10 (estimation interne)
const ECO_CRITERIA = [
  "Matières recyclées ou biosourcées sur le modèle comparable",
  "Déperlant sans PFC",
  "Programme de réparation ou de seconde main",
  "Certification ou label d'entreprise (B Corp, Fair Wear, Green Shape…)",
  "Écologie au cœur du discours de marque",
];

const BRANDS = [
  {
    id: "picture", name: "Picture", ring: "nous", model: "Abstral 2.5L", price: 194.9, priceSrc: SRC.snowleader,
    eco: [2, 2, 2, 2, 2], ca: 27.1, shop: SRC.pictureSite,
    tarifs: "Prix resserrés : l'Abstral entre 145,90 € et 194,90 € selon la version.",
    strategy: "Marque clermontoise de glisse et d'outdoor, éco-conception (polyester recyclé et biosourcé, sans PFC), programme Circular.",
    invest: "Voir l'onglet Coûts : 22 usines partenaires, 84 % du volume dans 2 usines.",
    fin: {
      cr: [
        { label: "Chiffre d'affaires 2026", value: "27,1 M€", src: SRC.pappersPicture },
        { label: "Marge brute 2026", value: "12,4 M€", src: SRC.pappersPicture },
        { label: "EBITDA (EBE) 2026", value: "−921 k€", src: SRC.pappersPicture },
        { label: "Résultat net 2026", value: "−2,63 M€", src: SRC.pappersPicture },
      ],
      bilan: [
        { label: "Capitaux propres", value: "−1,3 M€", src: SRC.pappersPicture },
        { label: "Trésorerie", value: "1,18 M€", src: SRC.pappersPicture },
      ],
    },
  },
  {
    id: "patagonia", name: "Patagonia", ring: "direct", model: "Torrentshell 3L", price: 200, eco: [2, 2, 2, 2, 2], ca: 243.6,
    shop: "https://eu.patagonia.com/fr/fr/home/",
    note: "Rival le plus direct : prix proche, 3 couches plus résistantes, image de marque plus forte.",
    tarifs: "Premium accessible, pas de luxe. Remises limitées, ventes discount réduites.",
    strategy: "Premium fondé sur la durabilité (Garantie Absolue, réparation, Worn Wear). Croissance contrôlée (+7 % en 2025), 73 % du CA en gros, 19 % e-commerce, 8 % en 13 magasins. Siège européen à Amsterdam, couverture de change ≈ 75 %, aucune dette.",
    invest: "Capex ≈ 2 M€ (< 1 % du CA). Le vrai investissement, ce sont les stocks : 35,2 → 42,5 M€ (+7,3 M€). Publicité et promotion 16,8 M€ (6,9 % du CA). Provision garantie et réparation 5,2 M€ (+70 %).",
    fin: {
      period: "Patagonia Europe Coöperatief U.A., exercice clos le 30/04/2025",
      cr: [
        { label: "Chiffre d'affaires net", value: "243,6 M€ (+7,0 %)", src: SRC.patagoniaPdf },
        { label: "Marge brute", value: "54,4 %", src: SRC.patagoniaPdf },
        { label: "Résultat avant VFF, intérêts et impôts", value: "46,9 M€ (19,3 %)", src: SRC.patagoniaPdf },
        { label: "Résultat d'exploitation", value: "7,6 M€ (3,1 %)", src: SRC.patagoniaPdf },
        { label: "Résultat net", value: "5,6 M€ (2,3 %)", src: SRC.patagoniaPdf },
      ],
      bilan: [
        { label: "Capitaux propres", value: "49,7 M€", src: SRC.patagoniaPdf },
        { label: "Solvabilité", value: "54 %", src: SRC.patagoniaPdf },
        { label: "Stocks", value: "42,5 M€", src: SRC.patagoniaPdf },
        { label: "Trésorerie", value: "12,0 M€", src: SRC.patagoniaPdf },
        { label: "Dette financière", value: "Aucune", src: SRC.patagoniaPdf },
      ],
      warn: "Le contrat de franchise (VFF) garantit ≈ 3 % de marge d'exploitation : comparer plutôt la marge brute et le résultat avant VFF.",
    },
  },
  {
    id: "rab", noAccounts: true, name: "Rab", ring: "direct", model: "Kinetic 2.0", price: 250, eco: [2, 2, 1, 1, 1], ca: 112,
    shop: "https://rab.equipment/eu/kinetic-2-0-jacket",
    note: "Même construction 2,5 couches, recyclée et sans PFC, plus légère.",
    tarifs: "Milieu à haut de gamme : veste imperméable 360 – 380 €, doudoune 400 – 480 €, polaire 170 €.",
    strategy: "Expertise montagne (alpinisme, ski), innovation produit, matières recyclées et réduction des fluorés, produits réparables.",
    invest: "Juillet 2025 : découvert HSBC relevé de 3 à 10 M£ pour le fonds de roulement (financement, pas un investissement).",
    fin: {
      period: "Equip Outdoor Technologies UK, exercice clos le 31/01/2025",
      cr: [
        { label: "Chiffre d'affaires", value: "96,19 M£ (+1,5 %)", src: SRC.rab },
        { label: "Résultat opérationnel", value: "13,32 M£", src: SRC.rab },
        { label: "Résultat avant impôt", value: "14,18 M£", src: SRC.rab },
        { label: "Résultat net", value: "6,53 M£ (−32,2 %)", src: SRC.rab },
      ],
      bilan: [
        { label: "Capitaux propres", value: "66,46 M£", src: SRC.rab },
        { label: "Trésorerie", value: "13 M£", src: SRC.rab },
      ],
    },
    priceCalc: {
      formula: "Prix public constaté de la Downpour Eco, non relevé dans le dossier",
      assumptions: ["Le dossier cite la Downpour Eco comme rival direct sans donner son prix", "Ordre de grandeur des prix publics constatés en 2025 – 2026 : ≈ 150 €"],
      steps: ["Valeur retenue : 150 € (à remplacer par le prix relevé sur rab.equipment)"],
    },
    caCalc: { formula: "96,19 M£ × 1,17 €/£", assumptions: ["Taux de change moyen hypothétique de 1,17 €/£"], steps: ["96,19 × 1,17 ≈ 112 M€"] },
  },
  {
    id: "vaude", noAccounts: true, name: "Vaude", ring: "direct", model: "Neyland 2.5L", price: 180, eco: [2, 2, 2, 2, 2], ca: null,
    shop: "https://www.vaude.com/fr-FR/",
    note: "Mise comme Picture et Patagonia sur la durabilité, la réparation et la revente.",
    tarifs: "Technique haut de gamme. Hardshell 300 – 470 €, promotions fréquentes jusqu'à −40 %.",
    strategy: "Durabilité, réparation, revente : le concurrent le plus proche par l'image (Consoglobe).",
    invest: "Non renseigné dans le dossier.",
    fin: null, finMissing: "Comptes non collectés (société allemande).",
  },
  {
    id: "millet", name: "Millet", ring: "indirect", model: "Seneca 2.5L", price: 180, eco: [1, 2, 1, 1, 1], ca: 73.45,
    shop: "https://www.millet-mountain.com/",
    note: "Modèle directement comparable : 2,5 couches, 10 000 / 10 000, souvent soldé entre 110 et 144 €.",
    tarifs: "Technique haut de gamme (150 € à plus de 1 200 €), entrée technique avec la Seneca 2.5L à 180 €.",
    strategy: "Recentrage total sur Millet après la cession de Lafuma (2025). Rachat fin 2021 par Jean-Pierre Millet et Inspiring Sport Capital. Objectif 100 % éco-responsable visé pour 2025.",
    invest: "Usine de Monastir (Tunisie) inaugurée en 2022 : 3 500 m², ≈ 160 salariés. Participation dans l'usine française ASF 4.0 (Chamatex).",
    fin: {
      period: "Millet Mountain Group SAS, 31/12/2025",
      cr: [
        { label: "Chiffre d'affaires net", value: "73,45 M€ (−9,7 %)", src: SRC.millet },
        { label: "Résultat d'exploitation", value: "1,75 M€", src: SRC.millet },
        { label: "Résultat net", value: "2,07 M€", src: SRC.millet },
      ],
      bilan: [
        { label: "Capitaux propres", value: "32,95 M€", src: SRC.millet },
        { label: "Total bilan", value: "57,08 M€", src: SRC.millet },
        { label: "Stocks nets", value: "19,46 M€", src: SRC.millet },
        { label: "Endettement financier", value: "0 €", src: SRC.millet },
        { label: "Trésorerie + cash-pooling", value: "15,84 M€", src: SRC.millet },
      ],
    },
  },
  {
    id: "columbia", name: "Columbia", ring: "direct", model: "Trailborne 2.5L", price: 160, priceSrc: SRC.columbiaProduct, eco: [1, 1, 0, 0, 1], ca: 75.69,
    shop: SRC.columbiaProduct,
    tarifs: "Moyen de gamme technique accessible : veste imperméable 100 – 130 €, doudoune 130 – 160 €.",
    strategy: "Technologie propriétaire (Omni) plutôt que GORE-TEX, accélération du direct-to-consumer, marketing pragmatique.",
    invest: "Automatisation de la supply chain, ERP, plan d'économies, R&D thermique Omni-Heat.",
    fin: {
      period: "Columbia Sportswear Europe, exercice 2024",
      cr: [
        { label: "Chiffre d'affaires net", value: "75,69 M€ (−8,4 %)", src: SRC.columbia },
        { label: "Résultat d'exploitation", value: "1,85 M€ (2,44 %)", src: SRC.columbia },
        { label: "Résultat net", value: "1,45 M€ (+11,4 %)", src: SRC.columbia },
      ],
      bilan: [
        { label: "Total bilan", value: "34,13 M€", src: SRC.columbia },
        { label: "Capitaux propres", value: "20,78 M€ (60,9 %)", src: SRC.columbia },
        { label: "Disponibilités", value: "6,31 M€", src: SRC.columbia },
        { label: "Dette financière", value: "Aucune", src: SRC.columbia },
      ],
    },
  },
  {
    id: "salomon", name: "Salomon", ring: "direct", model: "Outerpath", price: 180, eco: [1, 1, 1, 0, 0], ca: 374.9,
    shop: "https://www.salomon.com/fr-fr",
    tarifs: "Vestes de ski 300 € à plus de 700 €. Promos jusqu'à −30 % sur la saison précédente.",
    strategy: "« Cerveau » d'Amer Sports : conçoit et promeut, ne fabrique plus (usine de fixations transférée en Roumanie). Performance multisport, réparation, écologie secondaire.",
    invest: "Immobilisations 63,7 M€ (contre 58,3 M€), 892 salariés (+51), redevances de marque 52,8 M€.",
    fin: {
      period: "Salomon SAS, exercice 2025",
      cr: [
        { label: "Chiffre d'affaires", value: "374,9 M€ (+25 %)", src: SRC.salomon },
        { label: "Résultat net", value: "+28 M€ (contre −21 M€)", src: SRC.salomon },
      ],
      bilan: [
        { label: "Capitaux propres", value: "57 M€", src: SRC.salomon },
        { label: "Disponibilités", value: "2 M€", src: SRC.salomon },
        { label: "Créances groupe", value: "171,8 M€", src: SRC.salomon },
        { label: "Provisions pour risques", value: "17 M€", src: SRC.salomon },
      ],
    },
  },
  {
    id: "simond", name: "Simond", ring: "indirect", model: "MT900", price: 139.99, eco: [1, 1, 0, 1, 1], ca: 5.9,
    shop: "https://www.decathlon.fr/",
    note: "Juste en dessous de l'Abstral : seuil de qualité perçue (prix plancher).",
    tarifs: "Milieu de gamme, marque Decathlon.",
    strategy: "Virage fin 2025 : du seul alpinisme vers le trekking et le ski de rando. Fabrication métal à Chamonix, coton Fairtrade visé pour 2030, 1 % for the Planet dès 2026.",
    invest: "« La Fabrique verticale » à Chamonix (2020, 3 800 – 4 000 m², ≈ 7 M€) pour doubler la capacité.",
    fin: {
      period: "Établissements Simond, 31/12/2025",
      cr: [
        { label: "Chiffre d'affaires net", value: "5,90 M€ (−2,1 %)", src: SRC.simondPdf },
        { label: "Résultat d'exploitation", value: "+230 194 €", src: SRC.simondPdf },
        { label: "Résultat financier", value: "−167 186 €", src: SRC.simondPdf },
        { label: "Résultat net", value: "+16 847 €", src: SRC.simondPdf },
      ],
      bilan: [
        { label: "Total bilan", value: "5 438 582 €", src: SRC.simondPdf },
        { label: "Stocks", value: "2 591 095 €", src: SRC.simondPdf },
        { label: "Capitaux propres", value: "280 181 €", src: SRC.simondPdf },
        { label: "Compte courant Decathlon SE", value: "4 317 889 €", src: SRC.simondPdf },
        { label: "Disponibilités", value: "1 480 €", src: SRC.simondPdf },
      ],
    },
  },
  {
    id: "tnf", noAccounts: true, name: "The North Face", ring: "direct", model: "Signal DryVent 2.5", price: 290, eco: [1, 1, 1, 0, 1], ca: null,
    shop: "https://www.thenorthface.fr/",
    note: "Gamme large : l'Antora 2 à 130 € sert de repère bas, la Signal 2.5L à 290 € de repère haut.",
    tarifs: "Antora 2 : 130 €. Signal DryVent 2.5L : 290 €.",
    strategy: "Grande marque outdoor (groupe VF), forte notoriété et moyens.",
    invest: "Non renseigné.",
    fin: null, finMissing: "Comptes non exploités dans le dossier.", finLinks: [{ label: "TCF (The North Face)", src: SRC.tcf }],
  },
  {
    id: "arcteryx", noAccounts: true, name: "Arc'teryx", ring: "indirect", model: "Beta Jacket", price: 400, eco: [1, 1, 2, 0, 1], ca: null,
    shop: "https://arcteryx.com/fr/fr",
    tarifs: "Luxe technique : imperméable 600 – 900 €, polaire 160 – 220 €.",
    strategy: "Bascule vers le DTC (flagships, e-commerce) pour éviter les remises, expansion en Chine, circularité ReBIRD.",
    invest: "Non publié.",
    fin: null, finMissing: "Comptes non disponibles.", finLinks: [{ label: "Amer Sports France (holding)", src: SRC.amer }],
  },
  {
    id: "hh", name: "Helly Hansen", ring: "direct", model: "Sogn Shell 2.0", price: 380, eco: [1, 1, 0, 0, 1], ca: 26.2,
    shop: "https://www.hellyhansen.com/fr_fr/",
    tarifs: "Haut de gamme technique, promos −15 à −40 % chez les revendeurs.",
    strategy: "Bureau commercial France. Rachetée en 2025 par Kontoor Brands pour 900 M$. Membrane HELLY TECH, système RECCO.",
    invest: "Très faibles : 0,17 M€.",
    fin: {
      period: "Helly Hansen France, exercice 2025",
      cr: [
        { label: "Chiffre d'affaires", value: "26,2 M€ (+7 %)", src: null },
        { label: "Résultat net", value: "0,56 M€ (−39 %)", src: null },
      ],
      bilan: [{ label: "Trésorerie", value: "5,2 M€", src: null }, { label: "Dette bancaire", value: "Aucune", src: null }],
      warn: "Le dossier ne donne pas le lien des comptes : à ajouter.",
    },
  },
  {
    id: "burton", name: "Burton", ring: "direct", model: "Reserve 2.5L", price: 200, eco: [1, 1, 2, 2, 1], ca: null,
    shop: "https://www.burton.com/fr/fr/",
    note: "La Reserve 2.5L est au même prix que l'Abstral.",
    tarifs: "Gamme snow 200 – 870 €. Frostner 2L : 320 €.",
    strategy: "Élargit son public au-delà du snowboard (outdoor, rando, lifestyle). Économie circulaire (revente, réparation).",
    invest: "Non publié (société privée). R&D visible : noyau Squeezebox.",
    fin: null, finMissing: "Société privée : aucun compte publié.", finLinks: [{ label: "SGA Burton (France)", src: SRC.burton }],
  },
  {
    id: "volcom", name: "Volcom", ring: "hors", model: "Raynan Jacket", price: 140, eco: [0, 1, 0, 0, 1], ca: 55,
    shop: "https://www.volcom.fr/",
    tarifs: "Prix conseillés 220 – 450 €, remises très fortes (−35 % sur Zalando, jusqu'à −70 %).",
    strategy: "Marque d'Authentic Brands Group gérée en Europe par OneTurn (Anglet) depuis 2025. Style lifestyle.",
    invest: "Rachat d'Oneturn Brands Europe 1,55 M€, achats de matières 3,69 M€.",
    fin: {
      period: "Volcom SAS, exercice 2025",
      cr: [
        { label: "Chiffre d'affaires", value: "55 M€ (+0,4 %)", src: SRC.volcom },
        { label: "Résultat net", value: "282 k€", src: SRC.volcom },
      ],
      bilan: [
        { label: "Capitaux propres", value: "22,7 M€", src: SRC.volcom },
        { label: "Trésorerie", value: "2,95 M€", src: SRC.volcom },
        { label: "Dettes bancaires", value: "1,12 M€", src: SRC.volcom },
        { label: "Stocks", value: "12,1 M€", src: SRC.volcom },
      ],
    },
  },
  {
    id: "jw", name: "Jack Wolfskin", ring: "direct", model: "Veste Wisper Ins", price: 239.95, eco: [1, 1, 0, 1, 1], ca: 204,
    shop: "https://www.jack-wolfskin.com/products/a61893_1523",
    tarifs: "Milieu de gamme : vestes techniques 190 – 230 €.",
    strategy: "Racheté par ANTA (290 M$, 31/05/2025) : plan de revitalisation sur 3 à 5 ans, mass-market / mid-range outdoor.",
    invest: "≈ 6 M€ de développement produit (2022), ≈ 20 M€ de marketing.",
    fin: {
      period: "Jack Wolfskin, 2023",
      cr: [{ label: "Chiffre d'affaires", value: "204 M€", src: null }, { label: "EBIT", value: "−44,1 M€", src: null }],
      bilan: [{ label: "Stocks (2022)", value: "104,1 M€", src: null }, { label: "Dettes bancaires (2022)", value: "42 M€", src: null }],
      warn: "Le dossier ne donne pas le lien des comptes : à ajouter.",
    },
    priceCalc: { formula: "Milieu de la fourchette 190 – 230 €", assumptions: ["Pas de modèle 2,5L précis relevé"], steps: ["(190 + 230) ÷ 2 = 210 €"] },
  },
  {
    id: "kway", name: "K-Way", ring: "indirect", model: "Le Vrai Claude 3.0", price: 119.95, eco: [0, 0, 0, 0, 0], ca: 53.8,
    shop: "https://www.k-way.com/",
    tarifs: "Prix de référence 120 – 290 €, cœur de gamme 120 – 180 €. Remises de −20 % à −40 % sur Zalando (sept.-oct. 2026).",
    strategy: "Premiumisation lifestyle, réseau de boutiques en propre (dont Chamonix), omnicanal.",
    invest: "6 nouvelles boutiques en 2025, rachat de 4 sociétés affiliées, 2,3 M€ d'agencements.",
    fin: {
      period: "K-Way France, exercice 2025",
      cr: [
        { label: "Chiffre d'affaires", value: "53,8 M€ (−3 %)", src: SRC.kwayPdf },
        { label: "Marge commerciale", value: "36,3 M€ (67,7 %)", src: SRC.kwayPdf },
        { label: "Résultat d'exploitation", value: "9,4 M€ (17,4 %)", src: SRC.kwayPdf },
        { label: "Résultat net", value: "7,0 M€ (13,0 %)", src: SRC.kwayPdf },
      ],
      bilan: [
        { label: "Capitaux propres", value: "48,2 M€", src: SRC.kwayPdf },
        { label: "Solvabilité", value: "81 %", src: SRC.kwayPdf },
        { label: "Stocks nets", value: "26,9 M€ (+38 %)", src: SRC.kwayPdf },
        { label: "Trésorerie", value: "5,5 M€", src: SRC.kwayPdf },
      ],
    },
  },
  {
    id: "rains", name: "Rains", ring: "indirect", model: "Suva Hardshell", price: 189, eco: [0, 0, 0, 0, 0], ca: 71,
    shop: "https://www.rains.com/",
    tarifs: "Premium accessible : 90 – 130 € en entrée, hardshell 189 – 249 €.",
    strategy: "Stratégie 2027 : marque lifestyle mondiale, magasins à Londres, Berlin, Hong Kong, Fashion Week.",
    invest: "109 M DKK (2023), 142 M DKK (2024) : siège d'Aarhus, SI, expansion.",
    fin: {
      period: "Rains, exercice 2024",
      cr: [
        { label: "Chiffre d'affaires (société mère)", value: "530 M DKK (+11 %)", src: null },
        { label: "EBIT", value: "47,6 M DKK", src: null },
        { label: "Résultat net", value: "34,7 M DKK", src: null },
      ],
      bilan: [{ label: "Capitaux propres", value: "146 M DKK", src: null }],
      warn: "Rapport annuel cité dans le dossier sans lien : à ajouter.",
    },
    caCalc: { formula: "530 M DKK × 0,134 €/DKK", assumptions: ["Taux de change hypothétique 0,134 €/DKK"], steps: ["530 × 0,134 ≈ 71 M€"] },
  },
  {
    id: "carhartt", noAccounts: true, name: "Carhartt WIP", ring: "indirect", model: "Hooded Sail Jacket", price: 179, eco: [1, 0, 0, 0, 1], ca: null,
    shop: "https://us.carhartt-wip.com/en-us/products/hooded-sail-jacket",
    tarifs: "Streetwear premium accessible : imperméable 130 – 210 €.",
    strategy: "Rareté contrôlée, légitimité sous-culturelle (skate), collaborations, pièces permanentes reconduites.",
    invest: "Hub logistique, retail Asie et États-Unis, coton bio GOTS.",
    fin: null, finMissing: "Comptes non disponibles.",
    priceCalc: { formula: "Milieu de la fourchette 130 – 210 €", assumptions: ["Pas de modèle 2,5L comparable"], steps: ["(130 + 210) ÷ 2 = 170 €"] },
  },
  {
    id: "adidas", name: "adidas Terrex", ring: "indirect", model: "Veste légère 2.5 couches Climaproof Terrex Xperior", price: 180, eco: [1, 1, 0, 0, 0], ca: 1041,
    shop: "https://www.tonton-outdoor.com/fr_FR/p/adidas-veste-2-5-couches-climaproof-terrex-xperior-homme-125591",
    tarifs: "Vestes Terrex 120 – 150 € (Zalando), promos −30 à −50 %.",
    strategy: "adidas France revend les produits du groupe ; le ski n'est pas une priorité.",
    invest: "7,6 M€ en France, surtout magasins.",
    fin: {
      period: "adidas France, exercice 2025",
      cr: [{ label: "Chiffre d'affaires", value: "1 041 M€ (+9 %)", src: null }, { label: "Résultat net", value: "138 M€", src: null }],
      bilan: [{ label: "Capitaux propres", value: "382 M€", src: null }, { label: "Trésorerie", value: "2,9 M€", src: null }],
      warn: "Lien des comptes à ajouter.",
    },
    priceCalc: { formula: "Milieu de la fourchette 120 – 150 €", assumptions: ["Prix de référence Zalando"], steps: ["(120 + 150) ÷ 2 = 135 €"] },
  },
  {
    id: "aigle", name: "Aigle", ring: "indirect", model: "Parka Gore-Tex", price: 360, eco: [1, 1, 1, 1, 2], ca: 109.05,
    shop: "https://www.aigle.com/int/en-ai/les-technologies/collection-gore-tex",
    tarifs: "Premium accessible, outdoor chic. Prix non relevés.",
    strategy: "Montée en gamme outdoor élégante, éco-conception (« Aigle for tomorrow »), rationalisation des coûts.",
    invest: "SI, réseau de magasins, manufacture de bottes d'Ingrandes-sur-Vienne.",
    fin: {
      period: "Aigle International, exercice 2024",
      cr: [
        { label: "Chiffre d'affaires net", value: "109,05 M€", src: SRC.aiglePdf },
        { label: "Résultat d'exploitation", value: "−15,62 M€", src: SRC.aiglePdf },
        { label: "Résultat financier", value: "−2,73 M€", src: SRC.aiglePdf },
        { label: "Résultat net", value: "+1,35 M€", src: SRC.aiglePdf },
      ],
      bilan: [
        { label: "Total bilan", value: "147,71 M€", src: SRC.aiglePdf },
        { label: "Capitaux propres", value: "26,42 M€", src: SRC.aiglePdf },
        { label: "Emprunt Procastor", value: "85,4 M€", src: SRC.aiglePdf },
      ],
    },
  },
  {
    id: "norrona", name: "Norrøna", ring: "indirect", model: "Trollveggen Gore-Tex Pro", price: 699, eco: [1, 1, 1, 1, 1], ca: null,
    shop: "https://www.backcountry.com/norrna-trollveggen-jacket-mens",
    tarifs: "Marque norvégienne de montagne haut de gamme. Prix non relevés dans le dossier.",
    strategy: "À compléter.", invest: "À compléter.", fin: null, finMissing: "Comptes non collectés dans le dossier.",
  },
  {
    id: "didriksons", name: "Didriksons", ring: "indirect", model: "Fractus 3L Jacket", price: 280, eco: [1, 1, 0, 0, 1], ca: null,
    shop: "https://www.didriksons.com/uk/men/jackets/shell-jackets/fractus-men-s-jacket-3-505947-060",
    tarifs: "Marque suédoise de vêtements de pluie. Prix non relevés dans le dossier.",
    strategy: "À compléter.", invest: "À compléter.", fin: null, finMissing: "Comptes non collectés dans le dossier.",
  },
  {
    id: "barbour", name: "Barbour", ring: "hors", model: "Vestes cirées", price: null, eco: [0, 0, 1, 0, 0], ca: null,
    shop: "https://www.barbour.com/fr",
    tarifs: "Marque britannique de vestes cirées, positionnement lifestyle premium. Prix non relevés dans le dossier.",
    strategy: "À compléter.", invest: "À compléter.", fin: null, finMissing: "Comptes non collectés dans le dossier.",
  },
  {
    id: "uniqlo", name: "Uniqlo", ring: "indirect", model: "Parka Blocktech", price: 79.9, eco: [0, 0, 0, 0, 0], ca: null,
    shop: "https://www.uniqlo.com/ca/fr/contents/feature/masterpiece/product/blocktech-parka/",
    tarifs: "Prêt-à-porter grand public à petits prix. Prix non relevés dans le dossier.",
    strategy: "À compléter.", invest: "À compléter.", fin: null, finMissing: "Comptes non collectés dans le dossier.",
  },
  {
    id: "nike", name: "Nike", ring: "indirect", model: "Nike Stride Storm-FIT ADV", price: 189, eco: [1, 0, 0, 0, 1], ca: 10980,
    shop: "https://21run.com/eu/nike-stride-storm-fit-adv-waterproof-jacket-men-ih0757-010",
    tarifs: "« Premium de masse » : veste 65 – 90 €, imperméable 80 – 120 €, doudoune 120 – 180 €.",
    strategy: "Consumer Direct Acceleration (vente directe), puis retour vers des distributeurs (Foot Locker, Intersport). 8 à 10 % du CA en création de demande (sponsoring). Innovation au Nike Sport Research Lab, prévision de la demande par IA pour limiter les promotions destructrices de valeur.",
    invest: "R&D et biomécanique (campus de Beaverton), acquisitions dans la data prédictive, campus logistique européen en Belgique à 100 % d'énergies renouvelables.",
    fin: {
      period: "Entité Nike citée dans le dossier, exercice clos le 31/05/2025",
      cr: [
        { label: "Chiffre d'affaires", value: "10,98 Md€ (−11 %)", src: null },
        { label: "Marge brute", value: "2,49 Md€ (22,7 %)", src: null },
        { label: "Résultat d'exploitation", value: "−36 M€", src: null },
        { label: "Résultat net", value: "426,1 M€", src: null },
      ],
      bilan: [
        { label: "Total bilan", value: "4,88 Md€", src: null },
        { label: "Capitaux propres", value: "3,56 Md€ (73 %)", src: null },
        { label: "Trésorerie", value: "1,04 Md€", src: null },
      ],
      warn: "Le dossier ne donne pas le lien des comptes : à ajouter.",
    },
    priceCalc: { formula: "Milieu de la fourchette 80 – 120 €", assumptions: ["Imperméable Nike, prix du dossier"], steps: ["(80 + 120) ÷ 2 = 100 €"] },
  },
  {
    id: "lacoste", name: "Lacoste", ring: "indirect", model: "Veste Commuter légère imperméable", price: 320, eco: [0, 0, 1, 0, 0], ca: 317,
    shop: "https://www.lacoste.com/fr/news/fashion/commuter-collection.html",
    tarifs: "Premium accessible : polo L.12.12 ≈ 110 €. Pas une marque de ski : la plus éloignée de l'Abstral.",
    strategy: "Image chic et sportive (tennis). Capsule hommage aux JO d'hiver de Cortina 1956 (déc. 2025), pari de l'après-ski, seconde main sur le site. Lacoste vise le skieur chic qui pose, Picture le skieur engagé qui ride.",
    invest: "Modestes : 3,9 M€ (boutiques, informatique), 949 salariés.",
    fin: {
      period: "Lacoste France, exercice 2025",
      cr: [{ label: "Chiffre d'affaires", value: "317 M€ (−3 %)", src: null }, { label: "Résultat net", value: "14,4 M€ (−22 %)", src: null }],
      bilan: [{ label: "Capitaux propres", value: "79 M€", src: null }, { label: "Dette bancaire", value: "Aucune", src: null }, { label: "Dividendes versés", value: "21,6 M€", src: null }],
      warn: "Le dossier ne donne pas le lien des comptes : à ajouter.",
    },
  },
];

const RING_LABEL = { nous: "Picture", direct: "Concurrents directs", indirect: "Concurrents indirects", oublie: "Ceux qu'on oublie", hors: "Hors périmètre" };

// Questions de l'enquête (libellés exacts proposés)
const SURVEY_Q = {
  trop_bas: "À partir de quel prix trouveriez-vous cette veste si bon marché que vous douteriez de sa qualité ?",
  trop_cher: "À partir de quel prix trouveriez-vous cette veste trop chère pour l'acheter ?",
  eco: "Quelle importance accordez-vous aux engagements écologiques d'une marque (1 = aucune, 5 = déterminante) ?",
  attente_promo: "Attendriez-vous une promotion pour acheter cette veste ? (1 = oui, 0 = non)",
};
