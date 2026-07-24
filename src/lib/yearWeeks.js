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

// Un color distinto por mes (0=enero .. 11=diciembre), estable durante todo el año.
export function monthColor(monthIndex) {
  return `hsl(${monthIndex * 30}, 65%, 55%)`;
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
