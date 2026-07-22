import React, { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { C } from "../lib/theme.js";
import { addDays, fmtKey, todayKey } from "../lib/dates.js";
import { mondayOf } from "../lib/yearWeeks.js";
import { STATUS } from "../lib/model.js";
import { hhmmToFloat, hexToRgba } from "../lib/scheduleBlocks.js";
import ScheduleBlockModal from "./ScheduleBlockModal.jsx";

const DAY_LABELS = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const HOUR_HEIGHT = 26;
const GUTTER = 24;
const TIME_RE = /^\d{1,2}:\d{2}$/;

function habitAppearsOnDay(h, dayKey) {
  if (dayKey < h.date) return false;
  if (h.recurring) return true;
  if (!h.completed) return true;
  return h.completedAt && h.completedAt.slice(0, 10) === dayKey;
}

const hasValidTime = (h) => TIME_RE.test(h.time || "") && TIME_RE.test(h.endTime || "");

// asigna columnas a intervalos que se solapan (mismo criterio que un calendario)
function layoutIntervals(items) {
  const sorted = [...items].sort((a, b) => a.start - b.start);
  const colEnds = [];
  const placed = sorted.map((it) => {
    let col = colEnds.findIndex((end) => end <= it.start);
    if (col === -1) { col = colEnds.length; colEnds.push(it.end); }
    else colEnds[col] = it.end;
    return { ...it, col };
  });
  const totalCols = colEnds.length || 1;
  return placed.map((p) => ({ ...p, totalCols }));
}

function Block({ habit, project, style }) {
  return (
    <div
      title={`${habit.time}–${habit.endTime} · ${habit.title} (${project.name})`}
      style={{
        position: "absolute", borderRadius: 3, background: project.color, opacity: habit.completed ? 0.4 : 0.95,
        fontSize: 7.5, color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", zIndex: 3,
        padding: "0 3px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", ...style,
      }}
    >
      {habit.title}
    </div>
  );
}

function FixedBand({ band, minHour, maxHour }) {
  const s = Math.max(minHour, hhmmToFloat(band.start));
  const e = Math.min(maxHour, hhmmToFloat(band.end));
  if (e <= s) return null;
  const top = (s - minHour) * HOUR_HEIGHT;
  const height = Math.max(10, (e - s) * HOUR_HEIGHT);
  return (
    <>
      {/* relleno: por detrás de las líneas de hora, que crucen por encima */}
      <div title={`${band.title} · ${band.start}–${band.end}`} style={{
        position: "absolute", top, height, left: 0, right: 0, background: hexToRgba(band.color, 0.25),
        borderRadius: 3, zIndex: 1, padding: "1px 3px", overflow: "hidden",
      }}>
        <span style={{ fontSize: 7, fontWeight: 700, color: C.text }}>{band.title}</span>
      </div>
      {/* borde: siempre visible, por encima de las líneas de hora */}
      <div aria-hidden style={{
        position: "absolute", top, height, left: 0, right: 0,
        border: `1px solid ${hexToRgba(band.color, 0.6)}`, borderRadius: 3, zIndex: 4, pointerEvents: "none",
      }} />
    </>
  );
}

export default function WeekSchedule({ projects, blocks, onAddBlock, onUpdateBlock, onDeleteBlock }) {
  const [modalMode, setModalMode] = useState(null); // null | "add" | "manage"
  const monday = mondayOf(new Date());
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const today = todayKey();

  const projectsWithHabits = projects.filter((p) => p.objectives.some((o) => o.status === STATUS.ACTIVE));

  const byDay = days.map((d, i) => {
    const dayKey = fmtKey(d);
    const timed = [];
    for (const p of projects) {
      const objective = p.objectives.find((o) => o.status === STATUS.ACTIVE);
      if (!objective) continue;
      for (const h of objective.habits) {
        if (!hasValidTime(h) || !habitAppearsOnDay(h, dayKey)) continue;
        timed.push({ habit: h, project: p, start: hhmmToFloat(h.time), end: hhmmToFloat(h.endTime) });
      }
    }
    const dayBlocks = [];
    for (const b of blocks) {
      b.ranges.forEach((r, ri) => {
        if (r.days.includes(i)) dayBlocks.push({ key: `${b.id}-${ri}`, title: b.title, color: b.color, start: r.start, end: r.end });
      });
    }
    return { date: d, dayKey, dayIndex: i, timed: layoutIntervals(timed), dayBlocks };
  });

  const timedBounds = byDay.flatMap((d) => d.timed.flatMap((it) => [it.start, it.end]));
  const blockBounds = blocks.flatMap((b) => b.ranges.filter((r) => r.days.length > 0).flatMap((r) => [hhmmToFloat(r.start), hhmmToFloat(r.end)]));
  const allBounds = [...timedBounds, ...blockBounds];
  const minHour = allBounds.length ? Math.max(0, Math.floor(Math.min(...allBounds))) : 8;
  let maxHour = allBounds.length ? Math.min(24, Math.ceil(Math.max(...allBounds))) : 20;
  if (maxHour <= minHour) maxHour = minHour + 1;

  const hourLines = Array.from({ length: maxHour - minHour + 1 }, (_, i) => minHour + i);
  const gridHeight = (maxHour - minHour) * HOUR_HEIGHT;

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div className="eyebrow" style={{ color: C.dim }}>Horario</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setModalMode("manage")} className="step" aria-label="Editar horarios fijos" title="Editar horarios fijos" style={{ width: 24, height: 24, color: C.dim }}>
            <Pencil size={13} />
          </button>
          <button onClick={() => setModalMode("add")} className="step" aria-label="Agregar horario fijo" title="Agregar horario fijo" style={{ width: 24, height: 24, color: C.dim }}>
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* cabecera de días */}
      <div style={{ display: "flex", gap: 0 }}>
        <div style={{ width: GUTTER, flexShrink: 0 }} />
        {byDay.map(({ date, dayKey }) => {
          const isToday = dayKey === today;
          return (
            <div key={dayKey} className="mono" style={{
              flex: 1, minWidth: 0, textAlign: "center", fontSize: 9.5, color: isToday ? C.text : C.dim,
              fontWeight: isToday ? 800 : 600, paddingBottom: 3, borderBottom: `2px solid ${isToday ? "#57a6e0" : C.line}`,
            }}>
              {DAY_LABELS[date.getDay() === 0 ? 6 : date.getDay() - 1]}<br />{date.getDate()}
            </div>
          );
        })}
      </div>

      {/* grilla horaria */}
      <div style={{ display: "flex", marginTop: 6 }}>
        <div style={{ width: GUTTER, flexShrink: 0, position: "relative", height: gridHeight }}>
          {hourLines.map((h, i) => (
            <div key={h} className="mono" style={{ position: "absolute", top: i * HOUR_HEIGHT - 5, right: 4, fontSize: 8, color: C.dim }}>
              {i < hourLines.length - 1 ? String(h).padStart(2, "0") : ""}
            </div>
          ))}
        </div>
        {byDay.map(({ dayKey, timed, dayBlocks }) => (
          <div key={dayKey} style={{ flex: 1, minWidth: 0, position: "relative", height: gridHeight, borderLeft: `1px solid ${C.line}` }}>
            {dayBlocks.map((b) => <FixedBand key={b.key} band={b} minHour={minHour} maxHour={maxHour} />)}
            {hourLines.map((h, i) => (
              <div key={h} style={{ position: "absolute", top: i * HOUR_HEIGHT, left: 0, right: 0, borderTop: `1px solid ${C.line}`, zIndex: 2 }} />
            ))}
            {timed.map(({ habit, project, start, end, col, totalCols }) => (
              <Block key={project.id + habit.id} habit={habit} project={project} style={{
                top: (start - minHour) * HOUR_HEIGHT + 1, height: Math.max(10, (end - start) * HOUR_HEIGHT - 2),
                left: `${(col / totalCols) * 100}%`, width: `${100 / totalCols}%`,
              }} />
            ))}
          </div>
        ))}
      </div>

      {(projectsWithHabits.length > 0 || blocks.length > 0) && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
          {projectsWithHabits.map((p) => (
            <span key={p.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: C.dim }}>
              <span style={{ width: 8, height: 8, borderRadius: 8, background: p.color, flexShrink: 0 }} />
              {p.name}
            </span>
          ))}
          {blocks.map((b) => (
            <span key={b.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: C.dim }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: b.color, flexShrink: 0 }} />
              {b.title}
            </span>
          ))}
        </div>
      )}

      {modalMode && (
        <ScheduleBlockModal
          mode={modalMode}
          blocks={blocks}
          onClose={() => setModalMode(null)}
          onAdd={onAddBlock}
          onUpdate={onUpdateBlock}
          onDelete={onDeleteBlock}
        />
      )}
    </div>
  );
}
