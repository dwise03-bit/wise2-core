'use client';

import { useState } from 'react';

export interface Asset {
  id: string;
  name: string;
  type: 'photo' | 'video';
  url: string;
  size: number;
  uploadedAt: string;
  thumbnail?: string;
  metadata?: {
    duration?: number;
    width?: number;
    height?: number;
  };
}

interface AssetCardProps {
  asset: Asset;
  onPreview: (asset: Asset) => void;
  onDelete: (id: string) => void;
  onDownload: (asset: Asset) => void;
}

export default function AssetCard({ asset, onPreview, onDelete, onDownload }: AssetCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        background: '#0d0d0d',
        border: '1px solid #222',
        borderRadius: '10px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        ...(isHovered && {
          borderColor: '#39FF14',
          boxShadow: '0 0 12px rgba(57, 255, 20, 0.2)',
        }),
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '100%',
          background: '#1a1a1a',
          overflow: 'hidden',
          cursor: 'pointer',
        }}
        onClick={() => onPreview(asset)}
      >
        {asset.type === 'photo' ? (
          <img
            src={asset.url}
            alt={asset.name}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isHovered ? 0.8 : 1,
              transition: 'opacity 0.2s ease',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
              fontSize: '48px',
            }}
          >
            🎬
          </div>
        )}

        {/* Hover Overlay */}
        {isHovered && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview(asset);
              }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                background: '#39FF14',
                border: 'none',
                color: '#000',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 700,
              }}
              title="Preview"
            >
              👁
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload(asset);
              }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                background: '#333',
                border: '1px solid #555',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
              title="Download"
            >
              ↓
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                background: '#FF0040',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
              }}
              title="Delete"
            >
              🗑
            </button>
          </div>
        )}

        {/* Video Duration Badge */}
        {asset.type === 'video' && asset.metadata?.duration && (
          <div
            style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              background: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {Math.round(asset.metadata.duration)}s
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '12px' }}>
        <div
          style={{
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: '8px',
          }}
          title={asset.name}
        >
          {asset.name}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ fontSize: '11px', color: '#777' }}>
            {formatFileSize(asset.size)}
          </div>
          <div style={{ fontSize: '11px', color: '#777' }}>
            {formatDate(asset.uploadedAt)}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setShowDeleteConfirm(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#0d0d0d',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '320px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '16px' }}>
              Delete "{asset.name}"?
            </div>
            <div style={{ color: '#999', fontSize: '13px' }}>
              This action cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #333',
                  background: 'transparent',
                  color: '#aaa',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(asset.id);
                  setShowDeleteConfirm(false);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#FF0040',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
