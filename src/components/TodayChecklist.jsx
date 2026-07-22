import React from "react";
import { C, colorForIndex } from "../lib/theme.js";
import { todayKey } from "../lib/dates.js";
import { STATUS } from "../lib/model.js";
import { RecurringHabitRow, SpecificHabitRow } from "./HabitRow.jsx";

// hora sin definir ordena al final
const timeSortKey = (h) => (h.time && h.time.trim()) || "99:99";

export default function TodayChecklist({ projects, onToggleRecurring, onToggleSpecific }) {
  const today = todayKey();
  const items = [];

  for (const p of projects) {
    const objIdx = p.objectives.findIndex((o) => o.status === STATUS.ACTIVE);
    if (objIdx === -1) continue;
    const objective = p.objectives[objIdx];
    const color = colorForIndex(objIdx);
    for (const h of objective.habits) {
      if (h.date > today) continue;
      if (h.recurring) {
        items.push({ projectId: p.id, projectName: p.name, objective, color, habit: h, kind: "recurring" });
      } else {
        const doneToday = h.completed && h.completedAt && h.completedAt.slice(0, 10) === today;
        if (!h.completed || doneToday) {
          items.push({ projectId: p.id, projectName: p.name, objective, color, habit: h, kind: "specific" });
        }
      }
    }
  }

  items.sort((a, b) => timeSortKey(a.habit).localeCompare(timeSortKey(b.habit)));
  const showProjectName = new Set(items.map((it) => it.projectId)).size > 1;

  return (
    <div style={{ marginBottom: 20 }}>
      <div className="eyebrow" style={{ color: C.dim, marginBottom: 8 }}>Hoy</div>
      {items.length === 0 ? (
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "16px 14px", color: C.dim, fontSize: 13, textAlign: "center" }}>
          No tenés hábitos para hoy.
        </div>
      ) : (
        <div style={{ background: C.paper, color: C.ink, borderRadius: 14, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, boxShadow: "0 6px 20px rgba(0,0,0,.25)" }}>
          {items.map((it) => {
            const habit = { ...it.habit, time: "", endTime: "" }; // la hora solo define el orden, no se muestra
            return (
              <div key={`${it.projectId}-${it.habit.id}`}>
                {showProjectName && <div style={{ fontSize: 10.5, color: C.inkSoft, marginBottom: 3 }}>{it.projectName}</div>}
                {it.kind === "recurring" ? (
                  <RecurringHabitRow habit={habit} objective={it.objective} color={it.color} editable
                    onToggle={(habitId) => onToggleRecurring(it.projectId, it.objective.id, habitId)} />
                ) : (
                  <SpecificHabitRow habit={habit} color={it.color} editable
                    onToggle={(habitId) => onToggleSpecific(it.projectId, it.objective.id, habitId)} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
