import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [current, setCurrent] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0.35); // 0..1

  const refresh = async () => {
    const { data } = await api.get("/projects");
    setProjects(data);
    const cur = data.find((p) => p.current) || data[0];
    setCurrent(cur);
  };

  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setProgress((p) => (p + 0.003) % 1);
    }, 200);
    return () => clearInterval(id);
  }, [playing]);

  const selectProject = async (id) => {
    try { await api.post(`/projects/${id}/select`); } catch {}
    await refresh();
  };

  const togglePlay = () => setPlaying((p) => !p);

  return (
    <PlayerContext.Provider value={{ projects, current, playing, togglePlay, progress, setProgress, selectProject, refresh, setPlaying }}>
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => useContext(PlayerContext);
