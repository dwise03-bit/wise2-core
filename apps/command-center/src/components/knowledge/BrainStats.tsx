export function BrainStats() {
  return (
    <div className="bg-wise-black/40 border border-border-subtle rounded-lg p-6 space-y-4">
      <h3 className="text-sm font-semibold text-text-primary">Brain Stats</h3>
      <div className="space-y-3">
        <div><p className="text-xs text-text-muted">Documents</p><p className="text-lg font-bold text-wise-neon">0</p></div>
        <div><p className="text-xs text-text-muted">Connections</p><p className="text-lg font-bold text-wise-electric">0</p></div>
      </div>
    </div>
  );
}
