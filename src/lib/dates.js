export const atMidnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const todayKey = () => fmtKey(new Date());

export const fmtKey = (d) => {
  const x = atMidnight(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};

export const parseDateKey = (key) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

export const daysBetweenInclusive = (aKey, bKey) => {
  const a = parseDateKey(aKey), b = parseDateKey(bKey);
  return Math.round((b - a) / 86400000) + 1;
};

export const maxKey = (a, b) => (a > b ? a : b);
export const minKey = (a, b) => (a < b ? a : b);

export const fmtDateLabel = (key) =>
  parseDateKey(key).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" });
