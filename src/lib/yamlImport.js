import yaml from "js-yaml";
import { STATUS } from "./model.js";
import { colorForName } from "./theme.js";

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{1,2}:\d{2}$/;

class ImportError extends Error {}

function assert(cond, msg) {
  if (!cond) throw new ImportError(msg);
}

// YAML interpreta "2026-07-20" sin comillas como fecha nativa (spec YAML 1.1),
// no como texto — la normalizamos a "AAAA-MM-DD" en ambos casos.
function normalizeDate(raw) {
  if (raw instanceof Date) {
    return `${raw.getUTCFullYear()}-${String(raw.getUTCMonth() + 1).padStart(2, "0")}-${String(raw.getUTCDate()).padStart(2, "0")}`;
  }
  return typeof raw === "string" ? raw.trim() : null;
}

// YAML interpreta "19:00" sin comillas como sexagesimal (spec YAML 1.1) y lo
// devuelve como número (19*60+0=1140) en vez de texto — lo reconstruimos.
function normalizeTime(raw) {
  if (typeof raw === "number") {
    const h = Math.floor(raw / 60), m = raw % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  return typeof raw === "string" ? raw.trim() : null;
}

function buildHabit(raw, objIdx, habIdx) {
  const where = `objetivo ${objIdx + 1}, hábito ${habIdx + 1}`;
  assert(raw && typeof raw === "object", `${where}: cada hábito debe ser un objeto.`);
  assert(typeof raw.titulo === "string" && raw.titulo.trim(), `${where}: falta "titulo".`);
  const date = normalizeDate(raw.fecha);
  assert(date && DATE_RE.test(date), `${where} ("${raw.titulo}"): "fecha" es obligatoria con formato AAAA-MM-DD.`);

  const start = normalizeTime(raw.hora_inicio);
  assert(start && TIME_RE.test(start), `${where} ("${raw.titulo}"): "hora_inicio" es obligatoria con formato HH:MM.`);
  const end = normalizeTime(raw.hora_fin);
  assert(end && TIME_RE.test(end), `${where} ("${raw.titulo}"): "hora_fin" es obligatoria con formato HH:MM.`);
  assert(start < end, `${where} ("${raw.titulo}"): "hora_inicio" tiene que ser antes que "hora_fin".`);

  return {
    id: uid(),
    title: raw.titulo.trim(),
    description: typeof raw.descripcion === "string" ? raw.descripcion.trim() : "",
    date,
    time: start,
    endTime: end,
    recurring: !!raw.recurrente,
    completed: false,
    completedAt: null,
    log: {},
  };
}

function buildObjective(raw, idx) {
  const where = `objetivo ${idx + 1}`;
  assert(raw && typeof raw === "object", `${where}: debe ser un objeto.`);
  assert(typeof raw.nombre === "string" && raw.nombre.trim(), `${where}: falta "nombre".`);
  assert(Array.isArray(raw.habitos) && raw.habitos.length > 0, `${where} ("${raw.nombre}"): necesita al menos un hábito en "habitos".`);

  return {
    id: uid(),
    name: raw.nombre.trim(),
    description: typeof raw.descripcion === "string" ? raw.descripcion.trim() : "",
    status: idx === 0 ? STATUS.ACTIVE : STATUS.LOCKED,
    activatedAt: idx === 0 ? new Date().toISOString() : null,
    completedAt: null,
    habits: raw.habitos.map((h, i) => buildHabit(h, idx, i)),
  };
}

export function parseProjectYaml(text) {
  let raw;
  try {
    raw = yaml.load(text);
  } catch (e) {
    throw new ImportError(`El archivo no es YAML válido: ${e.message}`);
  }
  assert(raw && typeof raw === "object", "El archivo está vacío o no tiene el formato esperado.");
  assert(typeof raw.proyecto === "string" && raw.proyecto.trim(), 'Falta el campo "proyecto" con el nombre del proyecto.');
  assert(Array.isArray(raw.objetivos) && raw.objetivos.length > 0, 'Necesitás al menos un objetivo en "objetivos".');

  const name = raw.proyecto.trim();
  return {
    id: uid(),
    name,
    description: typeof raw.descripcion === "string" ? raw.descripcion.trim() : "",
    color: colorForName(name),
    createdAt: new Date().toISOString(),
    objectives: raw.objetivos.map((o, i) => buildObjective(o, i)),
  };
}

export { ImportError };
