import { atMidnight, addDays, fmtKey, parseDateKey } from "./dates.js";

export const mondayOf = (date) => {
  const d = atMidnight(date);
  const dow = d.getDay(); // 0=dom .. 6=sáb
  return addDays(d, dow === 0 ? -6 : 1 - dow);
};

// Semanas (lun-dom) desde la semana actual hasta fin del año en curso.
export function remainingWeeksOfYear(today = new Date()) {
  const endOfYear = new Date(today.getFullYear(), 11, 31);
  const weeks = [];
  let cursor = mondayOf(today);
  while (cursor <= endOfYear) {
    weeks.push({ start: cursor, end: addDays(cursor, 6), key: fmtKey(cursor) });
    cursor = addDays(cursor, 7);
  }
  return weeks;
}

// Cantidad de hábitos (de todos los proyectos) cuya fecha cae en cada semana.
export function countHabitsByWeek(projects, weeks) {
  const counts = new Array(weeks.length).fill(0);
  for (const p of projects) {
    for (const o of p.objectives) {
      for (const h of o.habits) {
        const d = parseDateKey(h.date);
        const idx = weeks.findIndex((w) => d >= w.start && d <= w.end);
        if (idx !== -1) counts[idx]++;
      }
    }
  }
  return counts;
}

// Azul (pocos hábitos) -> rojo (muchos), pasando por celeste/verde/amarillo/naranja.
export function heatColor(count, max) {
  const t = max > 0 ? Math.min(1, count / max) : 0;
  const hue = 210 - t * 210;
  return `hsl(${hue}, 75%, 55%)`;
}

// Agrupa semanas consecutivas del mismo mes para las etiquetas debajo del riel.
export function monthSegments(weeks) {
  const segments = [];
  for (const w of weeks) {
    const label = w.start.toLocaleDateString("es-AR", { month: "short" }).replace(".", "").toUpperCase();
    const last = segments[segments.length - 1];
    if (last && last.label === label) last.count++;
    else segments.push({ label, count: 1 });
  }
  return segments;
}
