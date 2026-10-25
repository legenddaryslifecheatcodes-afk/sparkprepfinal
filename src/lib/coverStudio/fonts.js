// Fonts for the Cover Studio. Every family here is from Google Fonts, all released under open licenses
// (SIL Open Font License / Apache), so authors can use them on a cover they sell without buying a license.
// Fonts load on demand: a tiny name-only preview for the picker, the full font once it's actually used.

const RAW = {
  serif: [
    "Playfair Display", "Merriweather", "Lora", "EB Garamond", "Cormorant Garamond", "Cormorant", "Libre Baskerville",
    "Crimson Text", "Crimson Pro", "Cinzel", "Cinzel Decorative", "Prata", "Spectral", "Source Serif 4", "PT Serif",
    "Noto Serif", "Roboto Serif", "Roboto Slab", "Bitter", "Arvo", "Zilla Slab", "Domine", "Vollkorn", "Alegreya",
    "Old Standard TT", "Cardo", "Gilda Display", "Bodoni Moda", "DM Serif Display", "DM Serif Text", "Abril Fatface",
    "Yeseva One", "Rozha One", "Marcellus", "Marcellus SC", "Forum", "Italiana", "Bellefair", "Della Respira",
    "Gloock", "Fraunces", "Young Serif", "Newsreader", "Literata", "Brygada 1918", "Petrona", "Taviraj", "Trirong",
    "Rufina", "Sorts Mill Goudy", "Goudy Bookletter 1911", "IM Fell English", "IM Fell DW Pica", "IM Fell English SC",
    "Linden Hill", "Rosarivo", "Halant", "Martel", "Frank Ruhl Libre", "Noticia Text", "Neuton", "Amiri",
    "Mate", "Junge", "Quattrocento", "Ovo", "Lusitana", "Libre Caslon Text", "Libre Caslon Display", "Castoro",
    "Instrument Serif", "Ibarra Real Nova", "Unna", "Sedan", "Bentham", "Gowun Batang", "Hahmlet", "Kaisei Decol",
  ],
  "sans-serif": [
    "Montserrat", "Oswald", "Raleway", "Poppins", "Inter", "Roboto", "Open Sans", "Lato", "Work Sans", "Nunito",
    "Nunito Sans", "Josefin Sans", "Barlow", "Barlow Condensed", "Barlow Semi Condensed", "Archivo", "Archivo Narrow",
    "Archivo Black", "Rubik", "Karla", "Manrope", "DM Sans", "Space Grotesk", "Outfit", "Sora", "Urbanist", "Lexend",
    "Plus Jakarta Sans", "Figtree", "Mulish", "Quicksand", "Cabin", "Cabin Condensed", "Exo 2", "Titillium Web",
    "Fira Sans", "Fira Sans Condensed", "IBM Plex Sans", "IBM Plex Sans Condensed", "PT Sans", "PT Sans Narrow",
    "Source Sans 3", "Noto Sans", "Hind", "Heebo", "Assistant", "Varela Round", "Comfortaa", "Tenor Sans",
    "Josefin Slab", "League Spartan", "Kanit", "Prompt", "Saira", "Saira Condensed", "Saira Extra Condensed",
    "Encode Sans", "Encode Sans Condensed", "Red Hat Display", "Albert Sans", "Jost", "Epilogue", "Syne",
    "Unbounded", "Chivo", "Public Sans", "Be Vietnam Pro", "Questrial", "Didact Gothic", "Antic", "Gothic A1",
    "Pathway Gothic One", "Sarabun", "Teko", "Big Shoulders Display", "Fjalla One", "Anton", "Bebas Neue",
    "League Gothic", "Six Caps", "Khand", "Rajdhani", "Michroma", "Orbitron", "Oxanium", "Tomorrow", "Chakra Petch",
  ],
  display: [
    "Alfa Slab One", "Ultra", "Bungee", "Bungee Shade", "Bungee Inline", "Black Ops One", "Righteous", "Lobster",
    "Lobster Two", "Pacifico", "Fredoka", "Baloo 2", "Luckiest Guy", "Bangers", "Creepster", "Nosifer", "Eater",
    "Butcherman", "Metal Mania", "New Rocker", "Pirata One", "UnifrakturMaguntia", "Grenze Gotisch",
    "MedievalSharp", "Almendra", "Almendra Display", "Uncial Antiqua", "Macondo", "Cherry Cream Soda", "Monoton",
    "Faster One", "Audiowide", "Russo One", "Staatliches", "Rye", "Smokum", "Ewert", "Diplomata", "Diplomata SC",
    "Poiret One", "Limelight", "Federo", "Megrim", "Codystar", "Syncopate", "Plaster", "Stardos Stencil",
    "Big Shoulders Stencil Display", "Special Elite", "Abril Fatface", "Bowlby One", "Bowlby One SC", "Passion One",
    "Titan One", "Chewy", "Sniglet", "Gluten", "Shrikhand", "Bagel Fat One", "Rubik Mono One", "Rubik Glitch",
    "Rubik Wet Paint", "Rubik Dirt", "Bungee Spice", "Kumar One", "Fascinate", "Fascinate Inline", "Spicy Rice",
    "Rampart One", "Train One", "Climate Crisis", "Silkscreen", "Press Start 2P", "VT323", "Wallpoet", "Zen Dots",
    "Cinzel Decorative", "Abhaya Libre", "Germania One", "Jacquard 12", "Tilt Prism", "Honk", "Nabla",
  ],
  handwriting: [
    "Dancing Script", "Great Vibes", "Parisienne", "Sacramento", "Allura", "Alex Brush", "Pinyon Script",
    "Tangerine", "Satisfy", "Kaushan Script", "Yellowtail", "Cookie", "Courgette", "Marck Script", "Rouge Script",
    "Italianno", "Monsieur La Doulaise", "Mrs Saint Delafield", "Herr Von Muellerhoff", "Petit Formal Script",
    "Playball", "Damion", "Mr Dafoe", "Euphoria Script", "Lovers Quarrel", "Meow Script", "Imperial Script",
    "Birthstone", "Birthstone Bounce", "Ephesis", "Corinthia", "WindSong", "Ballet", "Caveat", "Caveat Brush",
    "Shadows Into Light", "Indie Flower", "Amatic SC", "Permanent Marker", "Rock Salt", "Gloria Hallelujah",
    "Patrick Hand", "Architects Daughter", "Covered By Your Grace", "Reenie Beanie", "Homemade Apple",
    "Nothing You Could Do", "La Belle Aurore", "Kalam", "Handlee", "Gochi Hand", "Just Another Hand", "Neucha",
    "Schoolbell", "Sue Ellen Francisco", "Waiting for the Sunrise", "Zeyada", "Cedarville Cursive",
    "Mrs Sheppards", "Over the Rainbow", "Delius", "Sriracha", "Mansalva", "Nanum Pen Script", "Kristi",
    "Arizonia", "Qwigley", "Ruthie", "Seaweed Script", "Bad Script", "Merienda", "Grand Hotel", "Norican",
  ],
  monospace: [
    "Courier Prime", "Space Mono", "IBM Plex Mono", "JetBrains Mono", "Roboto Mono", "Source Code Pro", "Fira Code",
    "Inconsolata", "Overpass Mono", "Anonymous Pro", "Cutive Mono", "Major Mono Display", "Xanh Mono", "Syne Mono",
  ],
};

export const FONT_CATEGORIES = [
  ["all", "All"],
  ["serif", "Serif"],
  ["sans-serif", "Sans"],
  ["display", "Display"],
  ["handwriting", "Script"],
  ["monospace", "Typewriter"],
];

const seen = new Set();
export const FONTS = [];
for (const [category, names] of Object.entries(RAW)) {
  for (const family of names) {
    if (seen.has(family)) continue;
    seen.add(family);
    FONTS.push({ family, category });
  }
}
FONTS.sort((a, b) => a.family.localeCompare(b.family));

const FALLBACK = { serif: "serif", "sans-serif": "sans-serif", display: "sans-serif", handwriting: "cursive", monospace: "monospace" };
const categoryOf = Object.fromEntries(FONTS.map((f) => [f.family, f.category]));

/** A CSS font-family value with a sensible fallback. */
export function fontStack(family) {
  return `"${family}", ${FALLBACK[categoryOf[family]] || "serif"}`;
}

const cssUrl = (family, extra = "") =>
  `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}${extra}&display=swap`;

const loaded = new Map();

/**
 * Loads the whole font (regular weight; bold and italic are drawn by the browser when a family has no real
 * bold/italic face). Resolves once the browser can draw with it, so a canvas render right after is correct.
 */
export function loadFont(family) {
  if (!family || !categoryOf[family]) return Promise.resolve();
  if (loaded.has(family)) return loaded.get(family);
  const p = new Promise((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl(family);
    link.onload = () => {
      Promise.all([
        document.fonts.load(`400 40px "${family}"`),
        document.fonts.load(`700 40px "${family}"`),
      ]).catch(() => {}).finally(resolve);
    };
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
  loaded.set(family, p);
  return p;
}

export function loadFonts(families) {
  return Promise.all([...new Set(families.filter(Boolean))].map(loadFont));
}

const previewed = new Set();

/**
 * Loads just the letters of a font's own name, under a separate family name, so the picker can show every
 * font in its own face without downloading hundreds of full fonts (and without a partial font standing in
 * for the real one on the cover).
 */
export async function loadPreview(family) {
  if (previewed.has(family) || loaded.has(family)) return;
  previewed.add(family);
  try {
    const res = await fetch(cssUrl(family, `&text=${encodeURIComponent(family)}`));
    if (!res.ok) return;
    const css = (await res.text()).replace(/font-family:\s*'[^']+'/g, `font-family: 'SP Preview ${family}'`);
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
  } catch {
    previewed.delete(family);
  }
}

export function previewFamily(family) {
  return loaded.has(family) ? fontStack(family) : `"SP Preview ${family}", ${fontStack(family)}`;
}
