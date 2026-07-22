import React, { useState, useEffect } from "react";
import { C, colorForName } from "./lib/theme.js";
import { getProjects, saveProjects } from "./lib/storage.js";
import { getBlocks, saveBlocks, uid } from "./lib/scheduleBlocks.js";
import { getSyncCode, setSyncCode, generateSyncCode, pullFromCloud, pushToCloud } from "./lib/sync.js";
import { parseProjectYaml } from "./lib/yamlImport.js";
import { advanceProject, toggleRecurringHabitToday, toggleSpecificHabit, completeObjectiveManually } from "./lib/model.js";
import ProjectList from "./components/ProjectList.jsx";
import StatsView from "./components/StatsView.jsx";

export default function App() {
  const [projects, setProjects] = useState(() =>
    getProjects().map((p) => advanceProject({ ...p, color: p.color || colorForName(p.name) }))
  );
  const [activeId, setActiveId] = useState(null);
  const [view, setView] = useState("home"); // home | project
  const [blocks, setBlocks] = useState(() => getBlocks());
  const [syncCode, setSyncCodeState] = useState(() => getSyncCode());
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | syncing | synced | error

  const pushCloud = async (nextProjects, nextBlocks, code = syncCode) => {
    if (!code) return;
    setSyncStatus("syncing");
    try {
      await pushToCloud(code, { projects: nextProjects, blocks: nextBlocks });
      setSyncStatus("synced");
    } catch (e) {
      setSyncStatus("error");
    }
  };

  const applyRemoteData = (data) => {
    const nextProjects = (data.projects || []).map((p) => advanceProject({ ...p, color: p.color || colorForName(p.name) }));
    const nextBlocks = data.blocks || [];
    setProjects(nextProjects); saveProjects(nextProjects);
    setBlocks(nextBlocks); saveBlocks(nextBlocks);
  };

  // al abrir la app con un código ya conectado, trae lo último de la nube
  useEffect(() => {
    if (!syncCode) return;
    (async () => {
      setSyncStatus("syncing");
      try {
        const data = await pullFromCloud(syncCode);
        if (data) applyRemoteData(data);
        setSyncStatus("synced");
      } catch (e) {
        setSyncStatus("error");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectNewCode = async () => {
    const code = generateSyncCode();
    setSyncCode(code);
    setSyncCodeState(code);
    await pushCloud(projects, blocks, code); // siembra la nube con lo que ya tenías localmente
  };

  const connectExistingCode = async (code) => {
    setSyncStatus("syncing");
    const data = await pullFromCloud(code); // si falla, el error se propaga al modal
    setSyncCode(code);
    setSyncCodeState(code);
    if (data) {
      applyRemoteData(data);
      setSyncStatus("synced");
    } else {
      await pushCloud(projects, blocks, code); // código nuevo/vacío: lo sembramos con lo local
    }
  };

  const disconnectSync = () => {
    setSyncCode(null);
    setSyncCodeState(null);
    setSyncStatus("idle");
  };

  const persist = (next) => { setProjects(next); saveProjects(next); pushCloud(next, blocks); };
  const persistBlocks = (next) => { setBlocks(next); saveBlocks(next); pushCloud(projects, next); };

  const addBlock = (data) => persistBlocks([...blocks, { id: uid(), ...data }]);
  const updateBlock = (id, data) => persistBlocks(blocks.map((b) => (b.id === id ? { ...b, ...data } : b)));
  const deleteBlock = (id) => persistBlocks(blocks.filter((b) => b.id !== id));

  const updateProject = (id, updater) => {
    persist(projects.map((p) => (p.id === id ? updater(p) : p)));
  };

  const toggleRecurring = (projectId, objectiveId, habitId) =>
    updateProject(projectId, (p) => toggleRecurringHabitToday(p, objectiveId, habitId));
  const toggleSpecific = (projectId, objectiveId, habitId) =>
    updateProject(projectId, (p) => toggleSpecificHabit(p, objectiveId, habitId));
  const completeManual = (projectId, objectiveId) =>
    updateProject(projectId, (p) => completeObjectiveManually(p, objectiveId));
  const changeColor = (projectId, color) => updateProject(projectId, (p) => ({ ...p, color }));

  const handleImport = (text) => {
    const project = parseProjectYaml(text); // lanza ImportError si el archivo no es válido
    persist([...projects, project]);
    setActiveId(project.id);
    setView("project");
  };

  const handleDelete = (id) => {
    persist(projects.filter((p) => p.id !== id));
    if (activeId === id) { setActiveId(null); setView("home"); }
  };

  const activeProject = projects.find((p) => p.id === activeId);

  return (
    <div className="tp" style={{ minHeight: "100vh", background: C.board, color: C.text, fontFamily: "-apple-system, system-ui, 'Segoe UI', Roboto, sans-serif", padding: "20px 14px 60px" }}>
      <style>{`
        .tp * { box-sizing: border-box; }
        .tp .mono { font-family: ui-monospace, 'SF Mono', Menlo, Consolas, monospace; }
        .tp .eyebrow { font-size: 11px; letter-spacing: .18em; text-transform: uppercase; font-weight: 700; }
        .tp button { cursor: pointer; border: none; font-family: inherit; }
        .tp .tick { transition: transform .15s, opacity .15s; }
        .tp .tick:hover { transform: scaleY(1.15); }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
        .tp .now { animation: pulse 1.8s infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .tp .spin { animation: spin 1s linear infinite; }
        .tp .step { width: 30px; height: 30px; border-radius: 8px; display: grid; place-items: center; background: ${C.panel2}; flex-shrink: 0; }
        .tp .step:active { transform: scale(.92); }
        .tp .seg { padding: 7px 0; border-radius: 8px; font-size: 13px; font-weight: 600; background: ${C.panel2}; color: ${C.dim}; border: 1px solid ${C.line}; }
        .tp input, .tp textarea { font-family: inherit; }
        @media (prefers-reduced-motion: reduce) { .tp .now { animation: none; } }
        .tp .wrap { max-width: 760px; margin: 0 auto; }
      `}</style>
      <div className="wrap">
        {view === "home" && (
          <ProjectList
            projects={projects}
            onImport={handleImport}
            onOpen={(id) => { setActiveId(id); setView("project"); }}
            onDelete={handleDelete}
            onToggleRecurring={toggleRecurring}
            onToggleSpecific={toggleSpecific}
            onChangeColor={changeColor}
            onCompleteManual={completeManual}
            blocks={blocks}
            onAddBlock={addBlock}
            onUpdateBlock={updateBlock}
            onDeleteBlock={deleteBlock}
            syncCode={syncCode}
            syncStatus={syncStatus}
            onConnectNewCode={connectNewCode}
            onConnectExistingCode={connectExistingCode}
            onDisconnectSync={disconnectSync}
          />
        )}

        {view === "project" && activeProject && (
          <StatsView
            project={activeProject}
            onBack={() => { setActiveId(null); setView("home"); }}
            onCompleteManual={(objectiveId) => completeManual(activeProject.id, objectiveId)}
          />
        )}
      </div>
    </div>
  );
}
