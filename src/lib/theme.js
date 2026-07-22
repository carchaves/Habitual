export const C = {
  board: "#14161d", panel: "#1b1e28", panel2: "#212533", line: "#2c3040",
  paper: "#f3efe5", paperLine: "#e0dac8", ink: "#22252f", inkSoft: "#6a6355",
  text: "#e8eaf1", dim: "#8a90a2",
};

// paleta cíclica para distinguir objetivos consecutivos
export const OBJECTIVE_COLORS = ["#57a6e0", "#3fb79a", "#e7b84b", "#f2683c", "#9b7be0"];
export const colorForIndex = (i) => OBJECTIVE_COLORS[i % OBJECTIVE_COLORS.length];

// color por defecto para un proyecto nuevo (determinístico según su nombre, el usuario lo puede cambiar después)
export const colorForName = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return colorForIndex(hash);
};
