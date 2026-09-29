'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

interface GalleryImage {
  id: string;
  url: string;
  name: string;
  category?: string;
  uploadedAt: Date;
}

interface CinematicGalleryProps {
  title?: string;
  onImageSelect?: (image: GalleryImage) => void;
  maxImages?: number;
}

export function CinematicGallery({
  title = 'Cinematic Gallery',
  onImageSelect,
  maxImages = 50,
}: CinematicGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [filterCategory, setFilterCategory] = useState('all');
  const [isSlideshow, setIsSlideshow] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'masonry' | 'list'>('masonry');
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // Load images from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('cinematic_gallery_images');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setImages(
          parsed.map((img: any) => ({
            ...img,
            uploadedAt: new Date(img.uploadedAt),
          }))
        );
      } catch (e) {
        console.error('Failed to load gallery:', e);
      }
    }
  }, []);

  // Save images to localStorage
  const saveToStorage = useCallback((newImages: GalleryImage[]) => {
    localStorage.setItem('cinematic_gallery_images', JSON.stringify(newImages));
  }, []);

  // Handle image upload
  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files) return;
      if (images.length >= maxImages) {
        alert(`Gallery is full. Maximum ${maxImages} images allowed.`);
        return;
      }

      for (let i = 0; i < Math.min(files.length, maxImages - images.length); i++) {
        const file = files[i];
        const fileId = `${Date.now()}-${i}`;

        if (!file.type.startsWith('image/')) {
          console.warn(`Skipping non-image file: ${file.name}`);
          continue;
        }

        if (file.size > 10 * 1024 * 1024) {
          console.warn(`File too large: ${file.name}`);
          continue;
        }

        try {
          setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

          const reader = new FileReader();

          reader.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              setUploadProgress((prev) => ({ ...prev, [fileId]: percentComplete }));
            }
          };

          reader.onload = (event) => {
            const dataUrl = event.target?.result as string;
            const newImage: GalleryImage = {
              id: fileId,
              url: dataUrl,
              name: file.name,
              category: 'uncategorized',
              uploadedAt: new Date(),
            };

            setImages((prev) => {
              const updated = [newImage, ...prev];
              saveToStorage(updated);
              return updated;
            });

            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
          };

          reader.readAsDataURL(file);
        } catch (e) {
          console.error('Failed to upload file:', e);
        }
      }
    },
    [images.length, maxImages, saveToStorage]
  );

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files);
  };

  // Reorder images
  const handleReorder = (newOrder: GalleryImage[]) => {
    setImages(newOrder);
    saveToStorage(newOrder);
  };

  // Navigate fullscreen
  const goToNextImage = () => {
    const filtered = filterCategory === 'all'
      ? images
      : images.filter((img) => img.category === filterCategory);
    setCurrentImageIndex((prev) => (prev + 1) % filtered.length);
  };

  const goToPreviousImage = () => {
    const filtered = filterCategory === 'all'
      ? images
      : images.filter((img) => img.category === filterCategory);
    setCurrentImageIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
  };

  // Auto slideshow
  useEffect(() => {
    if (!isSlideshow || !isFullscreen) return;
    const interval = setInterval(goToNextImage, 4000);
    return () => clearInterval(interval);
  }, [isSlideshow, isFullscreen]);

  const filteredImages = filterCategory === 'all'
    ? images
    : images.filter((img) => img.category === filterCategory);

  const categories = ['all', ...Array.from(new Set(images.map((img) => img.category)))];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col bg-wise-bg text-wise-text-primary"
    >
      {/* Header */}
      <motion.div
        className="sticky top-0 z-40 bg-wise-surface-secondary border-b border-wise-medium backdrop-blur-lg"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-bold">{title}</h2>
            <motion.button
              onClick={() => setIsFullscreen(false)}
              className="text-xs sm:text-sm px-3 py-2 bg-wise-primary hover:bg-wise-primary-hover text-wise-text-primary rounded font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ← Back
            </motion.button>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center justify-between">
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <motion.button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                    filterCategory === cat
                      ? 'bg-wise-primary text-white'
                      : 'bg-wise-surface text-wise-text-secondary hover:bg-wise-surface-secondary'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </motion.button>
              ))}
            </div>

            {/* View Mode and Actions */}
            <div className="flex gap-2 items-center">
              <div className="flex gap-1 bg-wise-surface rounded-lg p-1">
                {(['grid', 'masonry', 'list'] as const).map((mode) => (
                  <motion.button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-2 py-1 rounded text-xs font-semibold transition ${
                      viewMode === mode
                        ? 'bg-wise-primary text-white'
                        : 'text-wise-text-secondary hover:text-wise-text-primary'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {mode === 'grid' && '⊞'}
                    {mode === 'masonry' && '≡'}
                    {mode === 'list' && '☰'}
                  </motion.button>
                ))}
              </div>

              <motion.label className="px-3 py-2 bg-wise-accent-green/20 hover:bg-wise-accent-green/30 text-wise-accent-green rounded-lg text-sm font-semibold cursor-pointer transition">
                📁 Upload
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                />
              </motion.label>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Upload Area */}
        {images.length === 0 && (
          <motion.div
            className="flex items-center justify-center h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.label
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="text-center cursor-pointer p-8 sm:p-12"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                className="text-5xl mb-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📸
              </motion.div>
              <div className="text-xl font-bold mb-2">Drag images here</div>
              <div className="text-wise-text-muted mb-4">or click to browse</div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />
            </motion.label>
          </motion.div>
        )}

        {/* Images Grid */}
        {images.length > 0 && viewMode === 'grid' && (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 p-3 sm:p-6"
            layout
          >
            <Reorder.Group axis="y" values={filteredImages} onReorder={handleReorder} layoutId="grid">
              <AnimatePresence mode="popLayout">
                {filteredImages.map((image, idx) => (
                  <Reorder.Item key={image.id} value={image} layoutId={image.id}>
                    <motion.div
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group bg-wise-surface border-2 border-transparent hover:border-wise-primary transition"
                      onClick={() => {
                        setSelectedImage(image);
                        setCurrentImageIndex(idx);
                      }}
                      whileHover={{ scale: 1.05, borderColor: 'var(--wise-primary)' }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                      <motion.div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="text-white text-2xl">👁</span>
                      </motion.div>
                    </motion.div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </motion.div>
        )}

        {/* Masonry Layout */}
        {images.length > 0 && viewMode === 'masonry' && (
          <motion.div
            className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 p-3 sm:p-6 space-y-3"
            layout
          >
            <Reorder.Group axis="y" values={filteredImages} onReorder={handleReorder} layoutId="masonry">
              <AnimatePresence mode="popLayout">
                {filteredImages.map((image, idx) => (
                  <Reorder.Item key={image.id} value={image} layoutId={image.id}>
                    <motion.div
                      className="relative rounded-lg overflow-hidden cursor-pointer group break-inside-avoid bg-wise-surface border-2 border-transparent hover:border-wise-primary transition"
                      onClick={() => {
                        setSelectedImage(image);
                        setCurrentImageIndex(idx);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-auto group-hover:scale-110 transition duration-300"
                      />
                      <motion.div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <span className="text-white text-2xl">👁</span>
                      </motion.div>
                    </motion.div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </motion.div>
        )}

        {/* List View */}
        {images.length > 0 && viewMode === 'list' && (
          <motion.div className="space-y-2 p-3 sm:p-6">
            <Reorder.Group axis="y" values={filteredImages} onReorder={handleReorder} layoutId="list">
              <AnimatePresence mode="popLayout">
                {filteredImages.map((image, idx) => (
                  <Reorder.Item key={image.id} value={image} layoutId={image.id}>
                    <motion.div
                      className="flex gap-3 p-3 bg-wise-surface rounded-lg border border-wise-medium hover:border-wise-primary cursor-pointer transition"
                      onClick={() => {
                        setSelectedImage(image);
                        setCurrentImageIndex(idx);
                      }}
                      whileHover={{ scale: 1.01, x: 5 }}
                      whileTap={{ scale: 0.98 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm truncate">{image.name}</div>
                        <div className="text-xs text-wise-text-muted">
                          {image.uploadedAt.toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  </Reorder.Item>
                ))}
              </AnimatePresence>
            </Reorder.Group>
          </motion.div>
        )}

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <motion.div className="p-4 space-y-2 bg-wise-surface-secondary border-t border-wise-medium">
            {Object.entries(uploadProgress).map(([id, progress]) => (
              <motion.div key={id} className="bg-wise-surface rounded p-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Uploading...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <motion.div className="w-full h-2 bg-wise-surface-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-wise-primary to-wise-accent-green"
                    animate={{ width: `${progress}%` }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Fullscreen Viewer */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            {/* Close Button */}
            <motion.button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white text-2xl hover:scale-110 transition z-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>

            {/* Main Image */}
            <motion.div
              className="flex-1 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="max-w-full max-h-full object-contain"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              />
            </motion.div>

            {/* Controls */}
            <motion.div
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur px-6 py-3 rounded-full"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                onClick={goToPreviousImage}
                className="text-white text-2xl hover:scale-110 transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ◀
              </motion.button>

              <div className="flex items-center gap-2 text-white">
                <span className="text-xs">
                  {currentImageIndex + 1} / {filteredImages.length}
                </span>
              </div>

              <motion.button
                onClick={goToNextImage}
                className="text-white text-2xl hover:scale-110 transition"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ▶
              </motion.button>

              <div className="h-8 w-px bg-white/30" />

              <motion.button
                onClick={() => setIsSlideshow(!isSlideshow)}
                className={`px-3 py-1 rounded text-sm font-semibold transition ${
                  isSlideshow
                    ? 'bg-wise-primary text-white'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isSlideshow ? '⏸' : '▶'}
              </motion.button>
            </motion.div>

            {/* Image Info */}
            <motion.div
              className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center text-white"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <h3 className="text-lg font-bold">{selectedImage.name}</h3>
              <p className="text-sm text-white/70">
                {selectedImage.uploadedAt.toLocaleDateString()}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
