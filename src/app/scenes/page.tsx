"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Scene } from "@/types";
import api from "@/lib/api";
import Sidebar from "@/components/Sidebar";
import Icon from "@/components/Icon";
import { useSocket } from "@/hooks/useSocket";

// Soft accent per card, cycled for visual variety
const accents = [
  "bg-cc-cyan/10 text-cc-cyan",
  "bg-cc-green/10 text-cc-green",
  "bg-cc-amber/10 text-cc-amber",
  "bg-cc-purple/10 text-cc-purple",
];

function AddSceneModal({
  onAdd,
  onClose,
}: {
  onAdd: (scene: { name: string; sceneKey: string; description: string; tags: string[]; thumbnailUrl: string }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [sceneKey, setSceneKey] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && sceneKey.trim()) {
      const tags = tagsInput.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
      onAdd({ name: name.trim(), sceneKey: sceneKey.trim(), description: description.trim(), tags, thumbnailUrl: thumbnailUrl.trim() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-cc-navy/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong rounded-3xl p-6 max-w-lg w-full animate-slide-up">
        <h2 className="text-lg font-semibold text-cc-text mb-4">Add New Scenario</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-cc-text-dim mb-1.5">Scenario Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Safety Training Module" className="input-dark" autoFocus />
          </div>
          <div>
            <label className="block text-xs font-medium text-cc-text-dim mb-1.5">Level Name (Scene Key)</label>
            <input value={sceneKey} onChange={(e) => setSceneKey(e.target.value)} placeholder="Must match Unreal Engine level name" className="input-dark font-mono" />
            <p className="text-[10px] text-cc-text-muted mt-1">Must exactly match the Unreal level name (e.g., VRTemplateMap)</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-cc-text-dim mb-1.5">Tags</label>
            <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="comma separated, e.g. safety, beginner" className="input-dark" />
          </div>
          <div>
            <label className="block text-xs font-medium text-cc-text-dim mb-1.5">Thumbnail URL</label>
            <input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://…/image.jpg (optional)" className="input-dark" />
            {thumbnailUrl.trim() && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={thumbnailUrl} alt="" className="mt-2 w-full h-28 object-cover rounded-2xl border border-cc-border" onError={(e) => ((e.currentTarget.style.display = "none"))} />
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-cc-text-dim mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description..." rows={3} className="input-dark resize-none" />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
            <button type="submit" className="btn-primary" disabled={!name.trim() || !sceneKey.trim()}>Create Scenario</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SceneDetailModal({
  scene,
  isConnected,
  onPlay,
  onDelete,
  onClose,
}: {
  scene: Scene;
  isConnected: boolean;
  onPlay: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-cc-navy/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-strong rounded-3xl p-6 max-w-md w-full animate-slide-up overflow-hidden">
        {scene.thumbnailUrl && (
          <div className="-mx-6 -mt-6 mb-4 h-40 bg-cc-surface-light relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={scene.thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            <button onClick={onClose} className="absolute top-3 right-3 icon-btn !w-8 !h-8 !bg-white/90">
              <Icon name="close" size={15} />
            </button>
          </div>
        )}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {!scene.thumbnailUrl && (
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cc-cyan/10 text-cc-cyan">
                <Icon name="film" size={22} />
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-cc-text leading-tight">{scene.name}</h2>
              <code className="text-xs font-mono text-cc-cyan">{scene.sceneKey}</code>
            </div>
          </div>
          {!scene.thumbnailUrl && (
            <button onClick={onClose} className="icon-btn !w-8 !h-8"><Icon name="close" size={15} /></button>
          )}
        </div>

        {scene.description && <p className="text-sm text-cc-text-dim mb-4">{scene.description}</p>}

        {scene.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {scene.tags.map((t) => (
              <span key={t} className="text-[11px] px-2.5 py-1 rounded-full bg-cc-surface-light text-cc-text-dim">#{t}</span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button onClick={onPlay} disabled={!isConnected} className="btn-primary flex-1 disabled:opacity-30 disabled:cursor-not-allowed">
            <Icon name="play" size={15} /> Play to all headsets
          </button>
          {confirmDelete ? (
            <button onClick={onDelete} className="btn-danger">Confirm</button>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="icon-btn hover:!text-cc-red" title="Delete">
              <Icon name="trash" size={16} />
            </button>
          )}
        </div>
        {!isConnected && <p className="text-[11px] text-cc-text-muted mt-2 text-center">Not connected — start the server / log in a headset to play.</p>}
      </div>
    </div>
  );
}

export default function ScenesPage() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [selected, setSelected] = useState<Scene | null>(null);

  const { isConnected, broadcastScene, headsetStatuses, lastEvent } = useSocket();

  const onlineCount = useMemo(
    () => Array.from(headsetStatuses.values()).filter((h) => h.status === "online").length,
    [headsetStatuses]
  );

  const fetchScenes = useCallback(async () => {
    const res = await api.get<Scene[]>("/scenes");
    if (res.data) setScenes(res.data);
  }, []);

  useEffect(() => {
    fetchScenes();
  }, [fetchScenes]);

  const handleAdd = async (scene: { name: string; sceneKey: string; description: string; tags: string[]; thumbnailUrl: string }) => {
    const res = await api.post<Scene>("/scenes", scene);
    if (res.data) {
      setScenes((p) => [...p, res.data!]);
      setShowAdd(false);
    }
  };

  const handleDelete = async (id: string) => {
    await api.delete(`/scenes/${id}`);
    setScenes((p) => p.filter((s) => s.id !== id));
    setSelected(null);
  };

  const handlePlay = (scene: Scene) => {
    broadcastScene(scene.sceneKey);
    setSelected(null);
  };

  const allTags = useMemo(() => {
    const set = new Set<string>();
    scenes.forEach((s) => s.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [scenes]);

  const visibleScenes = activeTag ? scenes.filter((s) => s.tags?.includes(activeTag)) : scenes;

  const chip = (active: boolean) =>
    `text-xs px-3 py-1.5 rounded-full border transition-colors ${
      active ? "bg-cc-navy text-white border-cc-navy" : "text-cc-text-dim border-cc-border hover:border-cc-text-muted bg-white"
    }`;

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-cc-navy tracking-tight">Scenario Library</h1>
              <p className="text-sm text-cc-text-muted mt-0.5">Tap a scene to see options and play it to headsets</p>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                  isConnected ? "bg-cc-green/10 text-cc-green border border-cc-green/20" : "bg-cc-red/10 text-cc-red border border-cc-red/20"
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-cc-green animate-status-pulse" : "bg-cc-red"}`} />
                {isConnected ? `${onlineCount} online` : "Disconnected"}
              </div>
              <button onClick={() => setShowAdd(true)} className="btn-primary"><Icon name="plus" size={16} /> New Scenario</button>
            </div>
          </div>

          {/* Tag filter chips */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setActiveTag(null)} className={chip(activeTag === null)}>All ({scenes.length})</button>
              {allTags.map((tag) => (
                <button key={tag} onClick={() => setActiveTag(tag)} className={chip(activeTag === tag)}>#{tag}</button>
              ))}
            </div>
          )}

          {/* Scene cards */}
          {visibleScenes.length === 0 ? (
            <div className="glass-card text-center py-16">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cc-surface-light text-cc-text-muted mb-3">
                <Icon name="film" size={22} />
              </div>
              <p className="text-cc-text-dim text-base font-medium">No scenarios found</p>
              <p className="text-cc-text-muted text-sm mt-1 mb-4">
                {activeTag ? "Try a different tag, or add one." : "Add your first Unreal level to broadcast."}
              </p>
              <button onClick={() => setShowAdd(true)} className="btn-primary mx-auto"><Icon name="plus" size={16} /> Create Scenario</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleScenes.map((scene, i) => (
                <button
                  key={scene.id}
                  onClick={() => setSelected(scene)}
                  className="glass-card text-left group cursor-pointer flex flex-col overflow-hidden"
                >
                  {scene.thumbnailUrl ? (
                    <div className="-mx-6 -mt-6 mb-4 relative h-32 bg-cc-surface-light">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={scene.thumbnailUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.style.display = "none")}
                      />
                      <span className="absolute top-2 right-2 icon-btn !w-8 !h-8 !bg-white/90 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Icon name="chevronRight" size={15} />
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between mb-4">
                      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${accents[i % accents.length]}`}>
                        <Icon name="film" size={22} />
                      </div>
                      <span className="icon-btn !w-8 !h-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Icon name="chevronRight" size={15} />
                      </span>
                    </div>
                  )}
                  <h3 className="font-semibold text-cc-text mb-1 truncate">{scene.name}</h3>
                  <code className="text-[11px] font-mono text-cc-cyan mb-3 block truncate">{scene.sceneKey}</code>
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {scene.tags?.length ? (
                      scene.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-cc-surface-light text-cc-text-muted">#{t}</span>
                      ))
                    ) : (
                      <span className="text-[10px] text-cc-text-muted">no tags</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {lastEvent && <p className="text-xs text-cc-text-muted">{lastEvent}</p>}

          {showAdd && <AddSceneModal onAdd={handleAdd} onClose={() => setShowAdd(false)} />}
          {selected && (
            <SceneDetailModal
              scene={selected}
              isConnected={isConnected}
              onPlay={() => handlePlay(selected)}
              onDelete={() => handleDelete(selected.id)}
              onClose={() => setSelected(null)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
