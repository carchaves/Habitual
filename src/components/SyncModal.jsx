import React, { useState } from "react";
import { X, Copy, Check, RefreshCw, Unlink } from "lucide-react";
import { C } from "../lib/theme.js";

export default function SyncModal({ code, status, onClose, onConnectNew, onConnectExisting, onDisconnect }) {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {}
  };

  const handleConnectNew = async () => {
    setBusy(true);
    setError(null);
    try { await onConnectNew(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  const handleConnectExisting = async () => {
    if (!input.trim()) return setError("Ingresá un código.");
    setBusy(true);
    setError(null);
    try { await onConnectExisting(input.trim().toUpperCase()); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 100 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 18, width: "100%", maxWidth: 400, boxShadow: "0 20px 50px rgba(0,0,0,.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div className="eyebrow" style={{ color: C.dim }}>Sincronización</div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>Entre dispositivos</div>
          </div>
          <button onClick={onClose} className="step" aria-label="Cerrar" style={{ color: C.dim }}><X size={16} /></button>
        </div>

        {code ? (
          <>
            <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.5, margin: "0 0 12px" }}>
              Ingresá este código en tus otros dispositivos para ver ahí la misma información.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
              <span className="mono" style={{ flex: 1, fontSize: 20, fontWeight: 800, letterSpacing: "0.05em", color: C.text }}>{code}</span>
              <button onClick={handleCopy} className="step" aria-label="Copiar código">
                {copied ? <Check size={15} color="#3fb79a" /> : <Copy size={15} />}
              </button>
            </div>
            <div style={{ fontSize: 11.5, color: C.dim, marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              {status === "syncing" && <><RefreshCw size={11} className="spin" /> Sincronizando…</>}
              {status === "synced" && <>✓ Sincronizado</>}
              {status === "error" && <span style={{ color: "#e0736a" }}>No se pudo sincronizar. Va a reintentar solo.</span>}
            </div>
            <button onClick={onDisconnect} className="seg" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, color: "#e0736a" }}>
              <Unlink size={14} /> Desconectar este dispositivo
            </button>
          </>
        ) : (
          <>
            <p style={{ fontSize: 13, color: C.dim, lineHeight: 1.5, margin: "0 0 16px" }}>
              Sin cuentas ni contraseñas: generá un código y usalo en tus otros dispositivos para compartir proyectos, horarios y check-ins. Quien tenga el código puede ver y editar tus datos, así que no lo compartas.
            </p>
            <button onClick={handleConnectNew} disabled={busy} className="seg" style={{ width: "100%", background: "#57a6e0", color: "#fff", borderColor: "#57a6e0", fontWeight: 700, marginBottom: 16 }}>
              {busy ? "Generando…" : "Generar código nuevo"}
            </button>
            <div className="eyebrow" style={{ color: C.dim, marginBottom: 8 }}>¿Ya tenés un código?</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={input} onChange={(e) => setInput(e.target.value.toUpperCase())} placeholder="XXXX-XXXX"
                className="mono" style={{ flex: 1, background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, padding: "9px 10px", color: C.text, fontSize: 14, letterSpacing: "0.05em" }} />
              <button onClick={handleConnectExisting} disabled={busy} className="seg" style={{ color: C.text }}>Conectar</button>
            </div>
            {error && (
              <div style={{ marginTop: 10, background: "rgba(224,115,106,.12)", border: "1px solid rgba(224,115,106,.35)", borderRadius: 9, padding: "8px 10px", fontSize: 12, color: "#e0736a" }}>
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
