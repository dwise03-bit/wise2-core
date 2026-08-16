'use client';

interface AssetFiltersProps {
  activeFilter: 'all' | 'photos' | 'videos';
  onFilterChange: (filter: 'all' | 'photos' | 'videos') => void;
  sortBy: 'newest' | 'name' | 'size';
  onSortChange: (sort: 'newest' | 'name' | 'size') => void;
}

export default function AssetFilters({
  activeFilter,
  onFilterChange,
  sortBy,
  onSortChange,
}: AssetFiltersProps) {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'photos', label: 'Photos' },
    { id: 'videos', label: 'Videos' },
  ];

  const sorts = [
    { id: 'newest', label: 'Newest First' },
    { id: 'name', label: 'Name' },
    { id: 'size', label: 'File Size' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '24px',
        padding: '16px 0',
        borderBottom: '1px solid #222',
        marginBottom: '20px',
      }}
    >
      {/* Type Filters */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id as 'all' | 'photos' | 'videos')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: activeFilter === filter.id ? '1px solid #39FF14' : '1px solid #333',
              background:
                activeFilter === filter.id ? 'rgba(57, 255, 20, 0.1)' : 'transparent',
              color: activeFilter === filter.id ? '#39FF14' : '#777',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'all 0.2s ease',
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#777', fontSize: '13px' }}>Sort:</span>
        <select
          value={sortBy}
          onChange={(e) =>
            onSortChange(e.target.value as 'newest' | 'name' | 'size')
          }
          style={{
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #333',
            background: '#0d0d0d',
            color: '#aaa',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          {sorts.map((sort) => (
            <option key={sort.id} value={sort.id} style={{ background: '#0a0a0a' }}>
              {sort.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
