export function KnowledgeSearch() {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Search knowledge base..."
        className="flex-1 px-4 py-2 rounded-lg bg-wise-black/40 border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-wise-electric"
      />
      <button className="px-4 py-2 rounded-lg bg-wise-electric text-wise-black font-medium text-sm">Search</button>
    </div>
  );
}
