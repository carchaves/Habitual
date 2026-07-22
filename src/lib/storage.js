const KEY = "habitual-projects";

export function getProjects() {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveProjects(projects) {
  try {
    localStorage.setItem(KEY, JSON.stringify(projects));
  } catch (e) {}
}
