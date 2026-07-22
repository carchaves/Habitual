import React from "react";
import { C } from "../lib/theme.js";
import { addDays, fmtKey, parseDateKey, todayKey, minKey } from "../lib/dates.js";
import { mondayOf } from "../lib/yearWeeks.js";

const ROW_HEIGHT = 11;
const GAP = 2;
const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];
const WEEKS_OF_HISTORY = 13; // ~3 meses

export default function HabitHeatmap({ habit, objective, color }) {
  const today = todayKey();
  const end = minKey(objective.completedAt ? objective.completedAt.slice(0, 10) : today, today);
  const yearAgo = fmtKey(addDays(parseDateKey(end), -(WEEKS_OF_HISTORY * 7 - 1)));

  const gridStart = mondayOf(parseDateKey(yearAgo));
  const gridEnd = addDays(mondayOf(parseDateKey(end)), 6);

  const weeks = [];
  for (let cursor = gridStart; cursor <= gridEnd; cursor = addDays(cursor, 7)) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(cursor, d);
      const key = fmtKey(date);
      const done = key <= end && habit.log && !!habit.log[key];
      week.push({ key, date, state: key > end ? "pad" : done ? "done" : "empty" });
    }
    weeks.push(week);
  }

  let lastMonth = null;
  // evita que dos etiquetas de mes consecutivas se superpongan cuando las columnas son angostas
  let lastLabelIndex = -3;
  const monthLabels = weeks.map((week, i) => {
    const m = week[0].date.getMonth();
    if (m === lastMonth || i - lastLabelIndex < 3) return "";
    lastMonth = m;
    lastLabelIndex = i;
    return week[0].date.toLocaleDateString("es-AR", { month: "short" }).replace(".", "");
  });

  const cellStyle = (state) => {
    if (state === "done") return { background: color };
    if (state === "empty") return { background: C.line };
    return { background: "transparent" };
  };

  const colTemplate = `repeat(${weeks.length}, 1fr)`;

  return (
    <div style={{ display: "flex", gap: 4, width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: GAP, paddingTop: ROW_HEIGHT + GAP, flexShrink: 0 }}>
        {DAY_LABELS.map((label, i) => (
          <div key={i} className="mono" style={{ height: ROW_HEIGHT, lineHeight: `${ROW_HEIGHT}px`, fontSize: 7, color: C.dim }}>{label}</div>
        ))}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: colTemplate, gap: GAP, marginBottom: GAP }}>
          {monthLabels.map((label, i) => (
            <div key={i} className="mono" style={{ fontSize: 7, color: C.dim, height: ROW_HEIGHT, overflow: "visible", whiteSpace: "nowrap" }}>{label}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: colTemplate, gridTemplateRows: `repeat(7, ${ROW_HEIGHT}px)`, gridAutoFlow: "column", gap: GAP }}>
          {weeks.flat().map((cell) => (
            <div key={cell.key}
              title={cell.state === "pad" ? undefined : `${cell.date.toLocaleDateString("es-AR", { day: "numeric", month: "short" })} · ${cell.state === "done" ? "hecho" : "no hecho"}`}
              style={{ borderRadius: 2, ...cellStyle(cell.state) }} />
          ))}
        </div>
      </div>
    </div>
  );
}
