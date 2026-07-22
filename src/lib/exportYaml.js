import yaml from "js-yaml";
import { STATUS } from "./model.js";

const STATUS_ES = { [STATUS.ACTIVE]: "activo", [STATUS.LOCKED]: "bloqueado", [STATUS.COMPLETED]: "completado" };
const DAY_NAMES = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

function exportHabit(h) {
  const out = { titulo: h.title, fecha: h.date, hora_inicio: h.time, hora_fin: h.endTime, recurrente: !!h.recurring };
  if (h.description) out.descripcion = h.description;
  if (!h.recurring) out.completado = !!h.completed;
  return out;
}

function exportObjective(o) {
  const out = { nombre: o.name, estado: STATUS_ES[o.status] || o.status, habitos: o.habits.map(exportHabit) };
  if (o.description) out.descripcion = o.description;
  return out;
}

function exportProject(p) {
  const out = { proyecto: p.name, objetivos: p.objectives.map(exportObjective) };
  if (p.description) out.descripcion = p.description;
  return out;
}

function exportBlock(b) {
  return {
    titulo: b.title,
    rangos: b.ranges.map((r) => ({ dias: r.days.map((d) => DAY_NAMES[d]), desde: r.start, hasta: r.end })),
  };
}

// Volcado en YAML de los proyectos y horarios fijos actuales, pensado para
// pasarle a un asistente y que sepa qué disponibilidad de tiempo hay.
export function buildAvailabilityYaml(projects, blocks) {
  const data = {
    exportado: new Date().toISOString().slice(0, 10),
    proyectos: projects.map(exportProject),
    horarios_fijos: blocks.map(exportBlock),
  };
  return (
    "# Disponibilidad exportada desde Habitual.\n" +
    "# Incluye los proyectos (con sus objetivos y hábitos, indicando cuál\n" +
    "# objetivo está activo) y los horarios fijos, para saber qué franjas\n" +
    "# horarias ya están ocupadas antes de planificar hábitos nuevos.\n\n" +
    yaml.dump(data, { lineWidth: 100 })
  );
}

export function downloadAvailabilityYaml(projects, blocks) {
  const text = buildAvailabilityYaml(projects, blocks);
  const blob = new Blob([text], { type: "text/yaml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `habitual-disponibilidad-${new Date().toISOString().slice(0, 10)}.yaml`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
