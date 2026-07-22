import { todayKey, maxKey, minKey } from "./dates.js";

export const STATUS = { LOCKED: "locked", ACTIVE: "active", COMPLETED: "completed" };

export const isObjectiveManual = (objective) => objective.habits.some((h) => h.recurring);

export const isObjectiveAutoDone = (objective) =>
  !isObjectiveManual(objective) && objective.habits.length > 0 && objective.habits.every((h) => h.completed);

// Recalcula qué objetivo está activo y dispara auto-completados en cadena.
// Pura: no muta `project`, devuelve un proyecto nuevo.
export function advanceProject(project) {
  const objectives = project.objectives.map((o) => ({ ...o }));
  const now = new Date().toISOString();

  for (let i = 0; i < objectives.length; i++) {
    const o = objectives[i];
    if (o.status === STATUS.COMPLETED) continue;

    // El primer objetivo no completado pasa a activo (si no lo era ya).
    if (o.status !== STATUS.ACTIVE) {
      o.status = STATUS.ACTIVE;
      o.activatedAt = o.activatedAt || now;
    }

    if (isObjectiveAutoDone(o)) {
      o.status = STATUS.COMPLETED;
      o.completedAt = o.completedAt || now;
      continue; // sigue el loop: el siguiente objetivo pendiente se activa en la próxima iteración
    }

    // Este es el objetivo activo real; todo lo que sigue queda bloqueado.
    for (let j = i + 1; j < objectives.length; j++) {
      if (objectives[j].status !== STATUS.COMPLETED) objectives[j] = { ...objectives[j], status: STATUS.LOCKED };
    }
    return { ...project, objectives };
  }

  return { ...project, objectives };
}

export function toggleRecurringHabitToday(project, objectiveId, habitId, dateKey = todayKey()) {
  const objectives = project.objectives.map((o) => {
    if (o.id !== objectiveId) return o;
    const habits = o.habits.map((h) => {
      if (h.id !== habitId || !h.recurring) return h;
      const log = { ...h.log };
      if (log[dateKey]) delete log[dateKey]; else log[dateKey] = true;
      return { ...h, log };
    });
    return { ...o, habits };
  });
  return advanceProject({ ...project, objectives });
}

export function toggleSpecificHabit(project, objectiveId, habitId) {
  const now = new Date().toISOString();
  const objectives = project.objectives.map((o) => {
    if (o.id !== objectiveId) return o;
    const habits = o.habits.map((h) => {
      if (h.id !== habitId || h.recurring) return h;
      const completed = !h.completed;
      return { ...h, completed, completedAt: completed ? now : null };
    });
    return { ...o, habits };
  });
  return advanceProject({ ...project, objectives });
}

export function completeObjectiveManually(project, objectiveId) {
  const now = new Date().toISOString();
  const objectives = project.objectives.map((o) => {
    if (o.id !== objectiveId || o.status !== STATUS.ACTIVE || !isObjectiveManual(o)) return o;
    return { ...o, status: STATUS.COMPLETED, completedAt: now };
  });
  return advanceProject({ ...project, objectives });
}

export function computeHabitStats(habit, objective, today = todayKey()) {
  if (!habit.recurring) {
    return { recurring: false, completed: !!habit.completed, completedAt: habit.completedAt || null };
  }
  const start = maxKey(habit.date, objective.activatedAt ? objective.activatedAt.slice(0, 10) : habit.date);
  const end = minKey(objective.completedAt ? objective.completedAt.slice(0, 10) : today, today);

  let streak = 0;
  let cursor = end;
  while (cursor >= start) {
    if (habit.log && habit.log[cursor]) {
      streak++;
      cursor = new Date(new Date(cursor).getTime() - 86400000).toISOString().slice(0, 10);
    } else break;
  }

  return { recurring: true, streak };
}

export function projectProgress(project) {
  const total = project.objectives.length;
  const done = project.objectives.filter((o) => o.status === STATUS.COMPLETED).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}
