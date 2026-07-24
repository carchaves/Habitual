import React from "react";
import { C } from "../lib/theme.js";
import { atMidnight } from "../lib/dates.js";
import { remainingWeeksOfYear, countHabitsByWeek, monthColor, monthSegments } from "../lib/yearWeeks.js";

export default function YearRail({ projects, selectedWeekKey, onSelectWeek }) {
  const weeks = remainingWeeksOfYear();
  if (weeks.length === 0) return null;

  const counts = countHabitsByWeek(projects, weeks);
  const segments = monthSegments(weeks);
  const today = atMidnight(new Date());

  return (
    <div style={{ marginBottom: 20 }}>
      <div className="eyebrow" style={{ color: C.dim, marginBottom: 8 }}>
        Lo que queda de {weeks[0].start.getFullYear()}
      </div>
      <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 30, marginBottom: 6 }}>
        {weeks.map((w, i) => {
          const isNow = today >= w.start && today <= w.end;
          const isSelected = w.key === selectedWeekKey;
          return (
            <button
              key={w.key}
              onClick={() => onSelectWeek(isSelected ? null : w.key)}
              className={isNow ? "tick now" : "tick"}
              title={`${w.start.toLocaleDateString("es-AR", { day: "numeric", month: "short" })} · ${counts[i]} hábito${counts[i] === 1 ? "" : "s"}`}
              style={{
                flex: 1, height: isNow ? 26 : 16, background: monthColor(w.start.getMonth()),
                opacity: isSelected ? 1 : isNow ? 1 : 0.75, borderRadius: 3, padding: 0,
                outline: isSelected ? `2px solid ${C.text}` : isNow ? `2px solid ${C.text}` : "none",
                outlineOffset: 1,
              }}
            />
          );
        })}
      </div>
      <div className="mono" style={{ display: "flex", fontSize: 10, color: C.dim, marginBottom: 10 }}>
        {segments.map((s, i) => (
          <span key={i} style={{ flex: s.count, overflow: "hidden", whiteSpace: "nowrap" }}>{s.label}</span>
        ))}
      </div>
    </div>
  );
}
