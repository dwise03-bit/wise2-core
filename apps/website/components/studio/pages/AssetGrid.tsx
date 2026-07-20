'use client';

import AssetCard, { Asset } from './AssetCard';

interface AssetGridProps {
  assets: Asset[];
  onPreview: (asset: Asset) => void;
  onDelete: (id: string) => void;
  onDownload: (asset: Asset) => void;
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function AssetGrid({
  assets,
  onPreview,
  onDelete,
  onDownload,
  currentPage,
  itemsPerPage,
  onPageChange,
  isLoading,
}: AssetGridProps) {
  const totalPages = Math.ceil(assets.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedAssets = assets.slice(startIdx, endIdx);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          color: '#666',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(57, 255, 20, 0.2)',
              borderTop: '3px solid #39FF14',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <div>Loading assets...</div>
        </div>
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '300px',
          color: '#666',
          textAlign: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
          <div>No assets yet. Upload photos or videos to get started.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {paginatedAssets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onPreview={onPreview}
            onDelete={onDelete}
            onDownload={onDownload}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            paddingTop: '16px',
            borderTop: '1px solid #222',
          }}
        >
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #333',
              background: currentPage === 1 ? 'transparent' : '#0d0d0d',
              color: currentPage === 1 ? '#555' : '#aaa',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: currentPage === page ? '1px solid #39FF14' : '1px solid #333',
                background:
                  currentPage === page ? 'rgba(57, 255, 20, 0.1)' : 'transparent',
                color: currentPage === page ? '#39FF14' : '#777',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {page}
            </button>
          ))}

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #333',
              background: currentPage === totalPages ? 'transparent' : '#0d0d0d',
              color: currentPage === totalPages ? '#555' : '#aaa',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: 600,
            }}
          >
            Next →
          </button>

          <div style={{ marginLeft: '16px', color: '#777', fontSize: '12px' }}>
            {startIdx + 1}–{Math.min(endIdx, assets.length)} of {assets.length}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
