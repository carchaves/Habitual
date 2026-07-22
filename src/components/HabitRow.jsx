import React from "react";
import { Check, Flame } from "lucide-react";
import { C } from "../lib/theme.js";
import { computeHabitStats } from "../lib/model.js";
import { todayKey } from "../lib/dates.js";

export function RecurringHabitRow({ habit, objective, color, editable, onToggle }) {
  const stats = computeHabitStats(habit, objective);
  const doneToday = !!(habit.log && habit.log[todayKey()]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <button
        onClick={() => editable && onToggle(habit.id)}
        disabled={!editable}
        style={{ width: 22, height: 22, borderRadius: 7, border: `1.5px solid ${doneToday ? color : C.inkSoft}`, background: doneToday ? color : "transparent", display: "grid", placeItems: "center", flexShrink: 0, opacity: editable ? 1 : 0.6 }}
        aria-label={doneToday ? "Marcar como no hecho hoy" : "Marcar como hecho hoy"}
      >
        {doneToday && <Check size={13} color="#fff" strokeWidth={3} />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, opacity: doneToday ? 0.6 : 1 }}>{habit.title}</div>
        {habit.description && <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 1 }}>{habit.description}</div>}
      </div>
      {habit.time && <span className="mono" style={{ fontSize: 11, color: C.inkSoft }}>{habit.time}{habit.endTime ? `–${habit.endTime}` : ""}</span>}
      {stats.streak > 0 && (
        <span className="mono" style={{ fontSize: 12, color: C.inkSoft, display: "flex", alignItems: "center", gap: 3 }}>
          <Flame size={11} color={color} />{stats.streak}
        </span>
      )}
    </div>
  );
}

export function SpecificHabitRow({ habit, color, editable, onToggle }) {
  const on = !!habit.completed;
  return (
    <button
      onClick={() => editable && onToggle(habit.id)}
      disabled={!editable}
      style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", padding: 0, textAlign: "left", width: "100%", opacity: editable || on ? 1 : 0.55 }}
    >
      <span style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${on ? color : C.inkSoft}`, background: on ? color : "transparent", display: "grid", placeItems: "center", flexShrink: 0 }}>
        {on && <Check size={13} color="#fff" strokeWidth={3} />}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, textDecoration: on ? "line-through" : "none", opacity: on ? 0.55 : 1 }}>{habit.title}</div>
        {habit.description && <div style={{ fontSize: 11.5, color: C.inkSoft, marginTop: 1 }}>{habit.description}</div>}
      </span>
      {habit.time && <span className="mono" style={{ fontSize: 11, color: C.inkSoft }}>{habit.time}{habit.endTime ? `–${habit.endTime}` : ""}</span>}
    </button>
  );
}
