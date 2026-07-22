import React from "react";
import { Check, Flame, ArrowLeft } from "lucide-react";
import { C, colorForIndex } from "../lib/theme.js";
import { computeHabitStats, isObjectiveManual, STATUS } from "../lib/model.js";
import HabitHeatmap from "./HabitHeatmap.jsx";

const STATUS_LABEL = { [STATUS.ACTIVE]: "Activo", [STATUS.COMPLETED]: "Completado", [STATUS.LOCKED]: "Bloqueado" };

export default function StatsView({ project, onBack, onCompleteManual }) {
  return (
    <div>
      <button onClick={onBack} className="eyebrow" style={{ color: C.dim, display: "flex", alignItems: "center", gap: 5, background: "transparent", padding: 0, marginBottom: 4 }}>
        <ArrowLeft size={12} /> Proyectos
      </button>
      <h1 style={{ margin: "0 0 18px", fontSize: 24, fontWeight: 800, letterSpacing: "-.01em" }}>{project.name}</h1>

      <div style={{ display: "grid", gap: 14 }}>
        {project.objectives.map((o, i) => {
          const color = colorForIndex(i);
          const canComplete = o.status === STATUS.ACTIVE && isObjectiveManual(o);

          const handleComplete = () => {
            const ok = window.confirm(
              `¿Marcar "${o.name}" como completado?\n\nUna vez avanzado el objetivo no vas a poder volver atrás.`
            );
            if (ok) onCompleteManual(o.id);
          };

          return (
            <div key={o.id} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "13px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 8, background: color, flexShrink: 0 }} />
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{o.name}</div>
                </div>
                <span className="mono" style={{ fontSize: 10.5, color: C.dim, letterSpacing: ".06em", textTransform: "uppercase" }}>{STATUS_LABEL[o.status]}</span>
              </div>
              {o.description && <p style={{ margin: "0 0 10px", fontSize: 12, color: C.dim, lineHeight: 1.4 }}>{o.description}</p>}

              <div style={{ display: "grid", gap: 12 }}>
                {o.habits.map((h) => {
                  const stats = computeHabitStats(h, o);
                  if (!stats.recurring) {
                    return (
                      <div key={h.id} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                        <span style={{ width: 16, height: 16, borderRadius: 5, border: `1.5px solid ${stats.completed ? color : C.line}`, background: stats.completed ? color : "transparent", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}>
                          {stats.completed && <Check size={10} color="#fff" strokeWidth={3} />}
                        </span>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: C.text }}>{h.title}</div>
                          {h.description && <div style={{ fontSize: 11.5, color: C.dim, marginTop: 1 }}>{h.description}</div>}
                        </span>
                        <span className="mono" style={{ fontSize: 11.5, color: C.dim, flexShrink: 0 }}>{stats.completed ? "hecho" : "pendiente"}</span>
                      </div>
                    );
                  }
                  return (
                    <div key={h.id}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 6 }}>
                        <span style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: C.text }}>{h.title}</div>
                          {h.description && <div style={{ fontSize: 11.5, color: C.dim, marginTop: 1 }}>{h.description}</div>}
                        </span>
                        {stats.streak > 0 && (
                          <span className="mono" style={{ fontSize: 11, color, display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
                            <Flame size={11} /> {stats.streak}
                          </span>
                        )}
                      </div>
                      <HabitHeatmap habit={h} objective={o} color={color} />
                    </div>
                  );
                })}
              </div>

              {canComplete && (
                <button onClick={handleComplete}
                  style={{ width: "100%", marginTop: 14, background: color, color: "#fff", fontSize: 13, fontWeight: 700, borderRadius: 9, padding: "10px 0" }}>
                  Marcar objetivo como completado
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
