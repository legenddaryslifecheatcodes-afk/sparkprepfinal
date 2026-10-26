// The book fonts the Interior Studio typesets with. The server embeds the same open-licensed families in the
// print PDF (backend fonts/interior); here they are loaded from Google Fonts so the editor shows the real face.
const FAMILIES_WITH_ITALIC_BOLD = {
  "Cinzel": "wght@400;700",
};
const loaded = new Map();

export function loadBookFont(family) {
  if (!family) return Promise.resolve();
  if (loaded.has(family)) return loaded.get(family);
  const axes = FAMILIES_WITH_ITALIC_BOLD[family] || "ital,wght@0,400;0,700;1,400;1,700";
  const p = new Promise((resolve) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, "+")}:${axes}&display=swap`;
    link.onload = () => document.fonts.load(`400 16px "${family}"`).catch(() => {}).finally(resolve);
    link.onerror = () => resolve();
    document.head.appendChild(link);
  });
  loaded.set(family, p);
  return p;
}

export const fontStack = (family) => `"${family}", Georgia, serif`;
