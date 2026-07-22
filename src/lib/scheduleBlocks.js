const KEY = "habitual-schedule-blocks";

// formato viejo: { days, start, end } sueltos en el bloque -> los envolvemos en "ranges"
function normalizeBlock(b) {
  if (Array.isArray(b.ranges)) return b;
  return { id: b.id, title: b.title, color: b.color, ranges: [{ days: b.days || [], start: b.start, end: b.end }] };
}

export function getBlocks() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeBlock) : [];
  } catch (e) {
    return [];
  }
}

export function saveBlocks(blocks) {
  try {
    localStorage.setItem(KEY, JSON.stringify(blocks));
  } catch (e) {}
}

export const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

// "HH:MM" -> horas en float (9:30 -> 9.5), para posicionar en la grilla
export const hhmmToFloat = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h + m / 60;
};

export const hexToRgba = (hex, alpha) => {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};
