import React, { useRef, useState } from "react";
import { Upload, Trash2, ChevronRight, CheckCircle2, Download, Smartphone } from "lucide-react";
import { C } from "../lib/theme.js";
import { projectProgress, isObjectiveManual } from "../lib/model.js";
import { downloadAvailabilityYaml } from "../lib/exportYaml.js";
import YearRail from "./YearRail.jsx";
import TodayChecklist from "./TodayChecklist.jsx";
import WeekSchedule from "./WeekSchedule.jsx";
import ConfirmModal from "./ConfirmModal.jsx";
import SyncModal from "./SyncModal.jsx";

export default function ProjectList({
  projects, onImport, onOpen, onDelete, onToggleRecurring, onToggleSpecific, onChangeColor, onCompleteManual,
  blocks, onAddBlock, onUpdateBlock, onDeleteBlock,
  syncCode, syncStatus, onConnectNewCode, onConnectExistingCode, onDisconnectSync,
}) {
  const fileRef = useRef(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [syncModalOpen, setSyncModalOpen] = useState(false);

  const pickFile = () => fileRef.current && fileRef.current.click();

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const text = await file.text();
      onImport(text);
    } catch (err) {
      setError(err.message || "No se pudo leer el archivo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
        <div className="eyebrow" style={{ color: C.dim }}>Habitual</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setSyncModalOpen(true)} className="step" aria-label="Sincronizar entre dispositivos" title="Sincronizar entre dispositivos" style={{ color: syncCode ? "#3fb79a" : C.dim, position: "relative" }}>
            <Smartphone size={15} />
            {syncCode && <span style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, borderRadius: 6, background: "#3fb79a" }} />}
          </button>
          <button onClick={() => downloadAvailabilityYaml(projects, blocks)} className="step" aria-label="Descargar disponibilidad (YAML)" title="Descargar proyectos y horarios fijos (YAML)" style={{ color: C.dim }}>
            <Download size={15} />
          </button>
        </div>
      </div>
      <h1 style={{ margin: "0 0 14px", fontSize: 26, fontWeight: 800, letterSpacing: "-.01em" }}>Tus proyectos</h1>

      <YearRail projects={projects} />

      <TodayChecklist projects={projects} onToggleRecurring={onToggleRecurring} onToggleSpecific={onToggleSpecific} />

      <WeekSchedule projects={projects} blocks={blocks} onAddBlock={onAddBlock} onUpdateBlock={onUpdateBlock} onDeleteBlock={onDeleteBlock} />

      <div className="eyebrow" style={{ color: C.dim, marginBottom: 8 }}>Proyectos</div>

      {projects.length === 0 && (
        <div style={{ background: C.panel, border: `1px dashed ${C.line}`, borderRadius: 14, padding: "28px 18px", textAlign: "center", color: C.dim, fontSize: 13.5, marginBottom: 16 }}>
          Todavía no importaste ningún proyecto.<br />Subí un archivo YAML con tu proyecto, objetivos y hábitos para arrancar.
        </div>
      )}

      <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
        {projects.map((p) => {
          const prog = projectProgress(p);
          const active = p.objectives.find((o) => o.status === "active");
          const canAdvance = active && isObjectiveManual(active);

          const handleAdvance = () => {
            const ok = window.confirm(
              `¿Marcar "${active.name}" como completado?\n\nUna vez avanzado el objetivo no vas a poder volver atrás.`
            );
            if (ok) onCompleteManual(p.id, active.id);
          };

          return (
            <div key={p.id} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => onOpen(p.id)} style={{ flex: 1, minWidth: 0, background: "transparent", padding: 0, textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ position: "relative", width: 44, height: 44, flexShrink: 0 }}>
                  <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
                    <circle cx="22" cy="22" r="18" fill="none" stroke={C.line} strokeWidth="4" />
                    <circle cx="22" cy="22" r="18" fill="none" stroke={p.color || "#57a6e0"} strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 18} strokeDashoffset={2 * Math.PI * 18 * (1 - prog.pct / 100)} />
                  </svg>
                  <div className="mono" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, color: C.dim }}>{prog.pct}%</div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: C.dim, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {active ? `Objetivo activo: ${active.name}` : "Proyecto completado"} · {prog.done}/{prog.total} objetivos
                  </div>
                </div>
              </button>
              {canAdvance && (
                <button onClick={handleAdvance} className="step" aria-label={`Marcar "${active.name}" como completado`} title="Marcar objetivo como completado" style={{ color: "#3fb79a" }}>
                  <CheckCircle2 size={16} />
                </button>
              )}
              <label className="step" title="Color del proyecto" style={{ position: "relative", overflow: "hidden", background: p.color || "#57a6e0" }}>
                <input type="color" value={p.color || "#57a6e0"} onChange={(e) => onChangeColor(p.id, e.target.value)}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", border: "none", padding: 0 }} />
              </label>
              <button onClick={() => onOpen(p.id)} className="step" aria-label="Abrir" style={{ color: C.dim }}><ChevronRight size={16} /></button>
              <button onClick={() => setDeleteTarget(p)} className="step" aria-label="Eliminar proyecto" style={{ color: "#e0736a" }}><Trash2 size={15} /></button>
            </div>
          );
        })}
      </div>

      <input ref={fileRef} type="file" accept=".yaml,.yml,text/yaml" onChange={handleFile} style={{ display: "none" }} />
      <button onClick={pickFile} disabled={busy} className="seg" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: C.text, padding: "11px 0" }}>
        <Upload size={15} /> {busy ? "Importando…" : "Importar proyecto (YAML)"}
      </button>
      {error && (
        <div style={{ marginTop: 10, background: "rgba(224,115,106,.12)", border: "1px solid rgba(224,115,106,.35)", borderRadius: 9, padding: "9px 11px", fontSize: 12.5, color: "#e0736a" }}>
          {error}
        </div>
      )}
      <p style={{ textAlign: "center", fontSize: 11.5, color: C.dim, marginTop: 18, lineHeight: 1.5 }}>
        ¿No tenés un archivo todavía? Descargá la <a href="/plantilla-proyecto.yaml" download style={{ color: "#57a6e0" }}>plantilla</a> y
        pasásela a un chat de Claude junto con tu idea para que te arme el proyecto.
      </p>

      {deleteTarget && (
        <ConfirmModal
          title="¿Eliminar proyecto?"
          message={`Se va a borrar "${deleteTarget.name}" y todo su progreso. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          danger
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => { onDelete(deleteTarget.id); setDeleteTarget(null); }}
        />
      )}

      {syncModalOpen && (
        <SyncModal
          code={syncCode}
          status={syncStatus}
          onClose={() => setSyncModalOpen(false)}
          onConnectNew={onConnectNewCode}
          onConnectExisting={onConnectExistingCode}
          onDisconnect={onDisconnectSync}
        />
      )}
    </div>
  );
}
