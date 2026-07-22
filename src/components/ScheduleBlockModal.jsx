import React, { useState } from "react";
import { X, Pencil, Trash2, Plus } from "lucide-react";
import { C } from "../lib/theme.js";

const DAY_LABELS = ["L", "M", "X", "J", "V", "S", "D"];
const emptyRange = () => ({ days: [], start: "09:00", end: "10:00" });
const EMPTY = { title: "", color: "#57a6e0", ranges: [emptyRange()] };

export default function ScheduleBlockModal({ mode, blocks, onClose, onAdd, onUpdate, onDelete }) {
  const isManage = mode === "manage";
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);

  const startEdit = (block) => {
    setEditingId(block.id);
    setForm({ title: block.title, color: block.color, ranges: block.ranges.map((r) => ({ ...r })) });
    setError(null);
  };

  const resetForm = () => { setEditingId(null); setForm(EMPTY); setError(null); };

  const toggleDay = (ri, di) =>
    setForm((f) => ({
      ...f,
      ranges: f.ranges.map((r, i) => (i !== ri ? r : { ...r, days: r.days.includes(di) ? r.days.filter((d) => d !== di) : [...r.days, di].sort() })),
    }));

  const updateRange = (ri, patch) =>
    setForm((f) => ({ ...f, ranges: f.ranges.map((r, i) => (i === ri ? { ...r, ...patch } : r)) }));

  const addRange = () => setForm((f) => ({ ...f, ranges: [...f.ranges, emptyRange()] }));
  const removeRange = (ri) => setForm((f) => ({ ...f, ranges: f.ranges.filter((_, i) => i !== ri) }));

  const handleSave = () => {
    if (!form.title.trim()) return setError("Ponele un título.");
    for (const r of form.ranges) {
      if (r.days.length === 0) return setError("Elegí al menos un día en cada rango horario.");
      if (r.start >= r.end) return setError("En cada rango, el horario de inicio tiene que ser antes que el de fin.");
    }
    const data = { title: form.title.trim(), color: form.color, ranges: form.ranges.map((r) => ({ days: r.days, start: r.start, end: r.end })) };
    if (editingId) onUpdate(editingId, data);
    else onAdd(data);
    resetForm();
  };

  const showForm = !isManage || editingId;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 100 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 18, width: "100%", maxWidth: 420, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 50px rgba(0,0,0,.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div className="eyebrow" style={{ color: C.dim }}>Horario</div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>{isManage ? "Editar horarios fijos" : "Nuevo horario fijo"}</div>
          </div>
          <button onClick={onClose} className="step" aria-label="Cerrar" style={{ color: C.dim }}><X size={16} /></button>
        </div>

        {isManage && (
          blocks.length > 0 ? (
            <div style={{ display: "grid", gap: 6, marginBottom: showForm ? 16 : 0 }}>
              {blocks.map((b) => (
                <div key={b.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, background: C.panel2, border: `1px solid ${editingId === b.id ? b.color : C.line}`, borderRadius: 10, padding: "8px 10px" }}>
                  <span style={{ width: 10, height: 10, borderRadius: 10, background: b.color, flexShrink: 0, marginTop: 3 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{b.title}</div>
                    {b.ranges.map((r, i) => (
                      <div key={i} className="mono" style={{ fontSize: 10.5, color: C.dim }}>
                        {r.days.map((d) => DAY_LABELS[d]).join("")} · {r.start}–{r.end}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => startEdit(b)} className="step" aria-label={`Editar ${b.title}`} style={{ width: 26, height: 26, color: C.dim, flexShrink: 0 }}><Pencil size={13} /></button>
                  <button onClick={() => onDelete(b.id)} className="step" aria-label={`Eliminar ${b.title}`} style={{ width: 26, height: 26, color: "#e0736a", flexShrink: 0 }}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 13, color: C.dim, textAlign: "center", padding: "10px 0" }}>
              Todavía no tenés horarios fijos. Agregá uno con el botón "+".
            </p>
          )
        )}

        {showForm && (
          <>
            <div className="eyebrow" style={{ color: C.dim, marginBottom: 10 }}>{editingId ? "Editar horario" : "Nuevo horario"}</div>

            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Título (ej. Trabajo)" style={{ flex: 1, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 10px", color: C.text, fontSize: 13.5 }} />
                <label className="step" title="Color" style={{ position: "relative", overflow: "hidden", width: 38, background: form.color }}>
                  <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer", border: "none", padding: 0 }} />
                </label>
              </div>

              <div style={{ display: "grid", gap: 10 }}>
                {form.ranges.map((r, ri) => (
                  <div key={ri} style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${C.line}`, borderRadius: 10, padding: 10, display: "grid", gap: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 11.5, color: C.dim }}>Rango {ri + 1}</div>
                      {form.ranges.length > 1 && (
                        <button onClick={() => removeRange(ri)} aria-label={`Quitar rango ${ri + 1}`} style={{ background: "transparent", color: C.dim, padding: 2 }}>
                          <X size={13} />
                        </button>
                      )}
                    </div>

                    <div>
                      <div style={{ fontSize: 11.5, color: C.dim, marginBottom: 6 }}>Días</div>
                      <div style={{ display: "flex", gap: 5 }}>
                        {DAY_LABELS.map((label, di) => {
                          const on = r.days.includes(di);
                          return (
                            <button key={di} onClick={() => toggleDay(ri, di)} className="seg"
                              style={{ flex: 1, background: on ? form.color : C.panel2, color: on ? "#fff" : C.dim, borderColor: on ? form.color : C.line, fontWeight: on ? 700 : 600 }}>
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11.5, color: C.dim, marginBottom: 6 }}>Desde</div>
                        <input type="time" value={r.start} onChange={(e) => updateRange(ri, { start: e.target.value })}
                          className="mono" style={{ width: "100%", background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 10px", color: C.text, fontSize: 13.5 }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 11.5, color: C.dim, marginBottom: 6 }}>Hasta</div>
                        <input type="time" value={r.end} onChange={(e) => updateRange(ri, { end: e.target.value })}
                          className="mono" style={{ width: "100%", background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 10px", color: C.text, fontSize: 13.5 }} />
                      </div>
                    </div>
                  </div>
                ))}

                <button onClick={addRange} className="seg" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: C.text }}>
                  <Plus size={14} /> Agregar rango horario
                </button>
              </div>

              {error && (
                <div style={{ background: "rgba(224,115,106,.12)", border: "1px solid rgba(224,115,106,.35)", borderRadius: 9, padding: "8px 10px", fontSize: 12, color: "#e0736a" }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                {editingId && (
                  <button onClick={resetForm} className="seg" style={{ flex: 1, color: C.text }}>Cancelar edición</button>
                )}
                <button onClick={handleSave} className="seg" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: form.color, color: "#fff", borderColor: form.color }}>
                  {editingId ? <Pencil size={14} /> : <Plus size={14} />} {editingId ? "Guardar cambios" : "Agregar"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
