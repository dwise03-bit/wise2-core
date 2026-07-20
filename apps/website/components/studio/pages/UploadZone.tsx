'use client';

import { useRef, useState } from 'react';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  isLoading?: boolean;
  progress?: number;
}

export default function UploadZone({ onFilesSelected, isLoading, progress }: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'video/mp4', 'video/webm', 'video/x-matroska'];
  const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

  const validateFiles = (files: File[]): File[] => {
    return files.filter(file => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        console.warn(`Skipped invalid file type: ${file.name}`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        console.warn(`Skipped file exceeding size limit: ${file.name}`);
        return false;
      }
      return true;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(files);

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = validateFiles(files);

      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }

      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      style={{
        background: isDragging ? 'rgba(57, 255, 20, 0.08)' : '#0d0d0d',
        border: isDragging ? '2px dashed #39FF14' : '2px dashed #333',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: isLoading ? 0.6 : 1,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".jpg,.jpeg,.png,.mp4,.webm,.mkv"
        onChange={handleFileInput}
        disabled={isLoading}
        style={{ display: 'none' }}
      />

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
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
          <div style={{ color: '#aaa' }}>
            Uploading... {progress !== undefined && `${Math.round(progress)}%`}
          </div>
          {progress !== undefined && (
            <div
              style={{
                width: '100%',
                maxWidth: '300px',
                height: '4px',
                background: 'rgba(57, 255, 20, 0.1)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: '#39FF14',
                  width: `${progress}%`,
                  transition: 'width 0.2s ease',
                  boxShadow: '0 0 8px rgba(57, 255, 20, 0.5)',
                }}
              />
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '32px' }}>📁</div>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, marginBottom: '4px' }}>
              Drop files here or click to browse
            </div>
            <div style={{ color: '#777', fontSize: '13px' }}>
              JPG, PNG, MP4, WebM, MKV • Max 100MB per file
            </div>
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
