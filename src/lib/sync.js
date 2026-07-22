const CODE_KEY = "habitual-sync-code";
// sin 0/O/1/I/L para evitar confusiones al tipear el código a mano
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function getSyncCode() {
  try { return localStorage.getItem(CODE_KEY) || null; } catch (e) { return null; }
}

export function setSyncCode(code) {
  try {
    if (code) localStorage.setItem(CODE_KEY, code);
    else localStorage.removeItem(CODE_KEY);
  } catch (e) {}
}

export function generateSyncCode() {
  let code = "";
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += "-";
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

async function call(code, options) {
  const res = await fetch(`/api/sync?code=${encodeURIComponent(code)}`, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `No se pudo sincronizar (${res.status}).`);
  }
  return res.json();
}

// null si todavía no hay nada guardado con ese código
export async function pullFromCloud(code) {
  const { data } = await call(code);
  return data;
}

export async function pushToCloud(code, payload) {
  await call(code, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
