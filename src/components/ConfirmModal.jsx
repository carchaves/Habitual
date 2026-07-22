import React from "react";
import { C } from "../lib/theme.js";

export default function ConfirmModal({ title, message, confirmLabel = "Confirmar", cancelLabel = "Cancelar", danger, onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 200 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 18, width: "100%", maxWidth: 360, boxShadow: "0 20px 50px rgba(0,0,0,.5)" }}>
        {title && <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8, color: C.text }}>{title}</div>}
        {message && <p style={{ margin: "0 0 18px", fontSize: 13.5, color: C.dim, lineHeight: 1.5, whiteSpace: "pre-line" }}>{message}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onCancel} className="seg" style={{ flex: 1, color: C.text }}>{cancelLabel}</button>
          <button onClick={onConfirm} className="seg" style={{ flex: 1, background: danger ? "#e0736a" : "#57a6e0", color: "#fff", borderColor: danger ? "#e0736a" : "#57a6e0", fontWeight: 700 }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
