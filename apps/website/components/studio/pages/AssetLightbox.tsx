'use client';

import { useEffect } from 'react';
import { Asset } from './AssetCard';

interface AssetLightboxProps {
  asset: Asset | null;
  onClose: () => void;
}

export default function AssetLightbox({ asset, onClose }: AssetLightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!asset) return null;

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        gap: '16px',
        padding: '20px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          background: 'rgba(0, 0, 0, 0.5)',
          border: '1px solid #333',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          hover: { background: 'rgba(0, 0, 0, 0.7)' },
        }}
      >
        ✕
      </button>

      {/* Content */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          maxWidth: '90vw',
          maxHeight: '80vh',
        }}
      >
        {/* Media Display */}
        {asset.type === 'photo' ? (
          <img
            src={asset.url}
            alt={asset.name}
            style={{
              maxWidth: '100%',
              maxHeight: '60vh',
              borderRadius: '12px',
              border: '1px solid #333',
              objectFit: 'contain',
            }}
          />
        ) : (
          <video
            src={asset.url}
            controls
            style={{
              maxWidth: '100%',
              maxHeight: '60vh',
              borderRadius: '12px',
              border: '1px solid #333',
            }}
          />
        )}

        {/* Info Panel */}
        <div
          style={{
            background: '#0d0d0d',
            border: '1px solid #222',
            borderRadius: '12px',
            padding: '20px',
            width: '100%',
            maxWidth: '500px',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <div style={{ color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
              Filename
            </div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600, wordBreak: 'break-word' }}>
              {asset.name}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                File Size
              </div>
              <div style={{ color: '#aaa', fontSize: '13px' }}>
                {formatFileSize(asset.size)}
              </div>
            </div>

            <div>
              <div style={{ color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                Uploaded
              </div>
              <div style={{ color: '#aaa', fontSize: '13px' }}>
                {formatDate(asset.uploadedAt)}
              </div>
            </div>

            {asset.type === 'video' && asset.metadata?.duration && (
              <>
                <div>
                  <div style={{ color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                    Duration
                  </div>
                  <div style={{ color: '#aaa', fontSize: '13px' }}>
                    {Math.round(asset.metadata.duration)}s
                  </div>
                </div>
              </>
            )}

            {asset.metadata?.width && asset.metadata?.height && (
              <div>
                <div style={{ color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                  Dimensions
                </div>
                <div style={{ color: '#aaa', fontSize: '13px' }}>
                  {asset.metadata.width}×{asset.metadata.height}
                </div>
              </div>
            )}

            <div>
              <div style={{ color: '#999', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                Type
              </div>
              <div style={{ color: '#aaa', fontSize: '13px' }}>
                {asset.type === 'photo' ? 'Photo' : 'Video'}
              </div>
            </div>
          </div>

          {/* Copy URL */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #222' }}>
            <button
              onClick={() => {
                navigator.clipboard.writeText(asset.url);
              }}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: 'rgba(57, 255, 20, 0.1)',
                border: '1px solid rgba(57, 255, 20, 0.3)',
                borderRadius: '8px',
                color: '#39FF14',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="Copy URL to clipboard"
            >
              Copy Asset Link
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
