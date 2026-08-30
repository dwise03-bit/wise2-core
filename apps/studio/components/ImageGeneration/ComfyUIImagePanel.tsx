"use client";

import { useCallback, useEffect, useState } from "react";

type GenState = "idle" | "generating" | "polling" | "done" | "error";

export function ComfyUIImagePanel() {
  const [online, setOnline] = useState<boolean | null>(null);
  const [prompt, setPrompt] = useState("futuristic WISE² command center, neon purple and green");
  const [state, setState] = useState<GenState>("idle");
  const [images, setImages] = useState<Array<{ filename: string; url: string }>>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/comfyui/status")
      .then((r) => r.json())
      .then((d) => setOnline(d.online))
      .catch(() => setOnline(false));
  }, []);

  const generate = useCallback(async () => {
    setState("generating");
    setError("");
    setImages([]);
    try {
      const r = await fetch("/api/comfyui/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, width: 1024, height: 1024 }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Generate failed");
      setState("polling");
      const promptId = data.promptId;
      for (let i = 0; i < 120; i++) {
        await new Promise((res) => setTimeout(res, 2000));
        const pr = await fetch(`/api/comfyui/result/${promptId}`);
        const pd = await pr.json();
        if (pd.status === "complete") {
          setImages(pd.images);
          setState("done");
          return;
        }
      }
      throw new Error("Timed out waiting for GPU");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setState("error");
    }
  }, [prompt]);

  return (
    <div className="bg-studio-input border border-studio-line rounded p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">ComfyUI · SDXL GPU</h2>
        <span
          className={`text-xs px-2 py-0.5 rounded ${
            online ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"
          }`}
        >
          {online === null ? "…" : online ? "online" : "offline"}
        </span>
      </div>
      <textarea
        className="w-full bg-black/40 border border-studio-line rounded p-3 text-sm text-gray-200 min-h-[80px]"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your WISE² image…"
      />
      <button
        type="button"
        onClick={generate}
        disabled={state === "generating" || state === "polling" || !online}
        className="px-4 py-2 bg-wise-accent text-black font-semibold rounded text-sm disabled:opacity-40"
      >
        {state === "generating" || state === "polling" ? "Generating…" : "Generate image"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((img) => (
            <a key={img.filename} href={img.url} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.filename} className="rounded border border-studio-line w-full" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
