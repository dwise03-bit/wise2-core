'use client';

import React, { useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryImage {
  id: string;
  url: string;
  name: string;
  size: number;
  uploadedAt: Date;
}

interface GalleryProps {
  title?: string;
  onImageSelect?: (image: GalleryImage) => void;
  maxImages?: number;
}

export function Gallery({
  title = 'Gallery',
  onImageSelect,
  maxImages = 50,
}: GalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const dragOverRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load images from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('gallery_images');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setImages(parsed.map((img: any) => ({
          ...img,
          uploadedAt: new Date(img.uploadedAt),
        })));
      } catch (e) {
        console.error('Failed to load gallery:', e);
      }
    }
  }, []);

  // Save images to localStorage
  const saveToStorage = useCallback((newImages: GalleryImage[]) => {
    localStorage.setItem('gallery_images', JSON.stringify(newImages));
  }, []);

  // Handle image upload
  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;
    if (images.length >= maxImages) {
      alert(`Gallery is full. Maximum ${maxImages} images allowed.`);
      return;
    }

    setIsUploading(true);

    for (let i = 0; i < Math.min(files.length, maxImages - images.length); i++) {
      const file = files[i];
      const fileId = `${Date.now()}-${i}`;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.warn(`Skipping non-image file: ${file.name}`);
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.warn(`File too large: ${file.name}`);
        continue;
      }

      try {
        // Simulate upload progress
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

        const reader = new FileReader();

        reader.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            setUploadProgress(prev => ({ ...prev, [fileId]: percentComplete }));
          }
        };

        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          const newImage: GalleryImage = {
            id: fileId,
            url: dataUrl,
            name: file.name,
            size: file.size,
            uploadedAt: new Date(),
          };

          setImages(prev => {
            const updated = [newImage, ...prev];
            saveToStorage(updated);
            return updated;
          });

          setUploadProgress(prev => {
            const updated = { ...prev };
            delete updated[fileId];
            return updated;
          });
        };

        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Upload error:', error);
        setUploadProgress(prev => {
          const updated = { ...prev };
          delete updated[fileId];
          return updated;
        });
      }
    }

    setIsUploading(false);
  }, [images.length, maxImages, saveToStorage]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragOverRef.current = true;
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragOverRef.current = false;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragOverRef.current = false;
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  // Delete image
  const handleDeleteImage = useCallback((id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      saveToStorage(updated);
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }
      return updated;
    });
  }, [selectedImage, saveToStorage]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.8 },
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        <p className="text-wise-text-secondary text-sm">
          {images.length} / {maxImages} images
        </p>
      </div>

      {/* Upload Area */}
      <motion.div
        className={`relative border-2 border-dashed rounded-lg p-8 mb-6 transition-all duration-300 ${
          dragOverRef.current
            ? 'border-wise-primary bg-wise-primary/10'
            : 'border-wise-medium bg-wise-surface-secondary/50 hover:border-wise-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full flex flex-col items-center gap-4"
        >
          <div className="text-4xl">📷</div>
          <div className="text-center">
            <p className="text-white font-semibold mb-1">
              {isUploading ? 'Uploading...' : 'Drag images here or click to upload'}
            </p>
            <p className="text-wise-text-secondary text-sm">
              PNG, JPG, GIF up to 10MB each
            </p>
          </div>
        </button>
      </motion.div>

      {/* Image Grid */}
      <AnimatePresence mode="popLayout">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {images.map((image) => (
            <motion.div
              key={image.id}
              variants={itemVariants}
              exit="exit"
              className="group relative rounded-lg overflow-hidden border border-wise-medium bg-wise-surface hover:border-wise-primary transition-all duration-300"
              onClick={() => {
                setSelectedImage(image);
                onImageSelect?.(image);
              }}
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden bg-black">
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>

              {/* Overlay */}
              <motion.div
                className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(image.id);
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-semibold transition-colors"
                >
                  Delete
                </button>
              </motion.div>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 text-xs">
                <p className="text-white font-semibold truncate">{image.name}</p>
                <p className="text-wise-text-secondary">{formatFileSize(image.size)}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Empty State */}
      {images.length === 0 && !isUploading && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-wise-text-secondary">No images yet. Upload some to get started!</p>
        </motion.div>
      )}

      {/* Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className="relative max-w-4xl w-full bg-wise-surface rounded-lg overflow-hidden"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/80 rounded-full flex items-center justify-center text-white transition-colors"
              >
                ✕
              </button>

              {/* Image */}
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="w-full h-auto"
              />

              {/* Info */}
              <div className="bg-wise-surface-secondary p-4 border-t border-wise-medium">
                <h3 className="text-white font-semibold mb-2">{selectedImage.name}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm text-wise-text-secondary">
                  <div>
                    <p className="text-wise-text-muted mb-1">Size</p>
                    <p className="text-white">{formatFileSize(selectedImage.size)}</p>
                  </div>
                  <div>
                    <p className="text-wise-text-muted mb-1">Uploaded</p>
                    <p className="text-white">{selectedImage.uploadedAt.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
