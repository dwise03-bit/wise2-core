'use client';

import { useState, useCallback } from 'react';
import UploadZone from './UploadZone';
import AssetGrid from './AssetGrid';
import AssetFilters from './AssetFilters';
import AssetLightbox from './AssetLightbox';
import { Asset } from './AssetCard';

export default function ClientShowcase() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'photos' | 'videos'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'size'>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 12;

  // Filter and sort assets
  const filteredAssets = assets.filter((asset) => {
    if (activeFilter === 'photos') return asset.type === 'photo';
    if (activeFilter === 'videos') return asset.type === 'video';
    return true;
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      case 'size':
        return b.size - a.size;
      default:
        return 0;
    }
  });

  const handleFilesSelected = useCallback(async (files: File[]) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progress = Math.round(((i + 1) / files.length) * 100);
        setUploadProgress(progress);

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/intake/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();

        // Generate unique ID and create asset
        const asset: Asset = {
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          type: file.type.startsWith('image') ? 'photo' : 'video',
          url: URL.createObjectURL(file), // Use blob URL for now
          size: file.size,
          uploadedAt: new Date().toISOString(),
          metadata: {
            width: file.type.startsWith('image') ? 1920 : undefined,
            height: file.type.startsWith('image') ? 1080 : undefined,
            duration: file.type.startsWith('video') ? 0 : undefined,
          },
        };

        setAssets((prev) => [asset, ...prev]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const handleDelete = useCallback((id: string) => {
    setAssets((prev) => prev.filter((asset) => asset.id !== id));
    if (previewAsset?.id === id) {
      setPreviewAsset(null);
    }
  }, [previewAsset]);

  const handleDownload = useCallback((asset: Asset) => {
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = asset.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      {/* Upload Zone */}
      <div>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ color: '#777', fontSize: '13px', fontWeight: 600, letterSpacing: '1px' }}>
            UPLOAD ASSETS
          </div>
        </div>
        <UploadZone
          onFilesSelected={handleFilesSelected}
          isLoading={isUploading}
          progress={uploadProgress}
        />
      </div>

      {/* Assets Section */}
      {assets.length > 0 && (
        <div>
          <div style={{ marginBottom: '12px' }}>
            <div
              style={{
                color: '#777',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '1px',
                marginBottom: '8px',
              }}
            >
              ASSET LIBRARY
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>
              {assets.length} total • {assets.filter((a) => a.type === 'photo').length} photos
              {' '}•{' '}
              {assets.filter((a) => a.type === 'video').length} videos
            </div>
          </div>

          <AssetFilters
            activeFilter={activeFilter}
            onFilterChange={(filter) => {
              setActiveFilter(filter);
              setCurrentPage(1);
            }}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <AssetGrid
            assets={sortedAssets}
            onPreview={setPreviewAsset}
            onDelete={handleDelete}
            onDownload={handleDownload}
            currentPage={currentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Preview Lightbox */}
      <AssetLightbox asset={previewAsset} onClose={() => setPreviewAsset(null)} />
    </div>
  );
}
