'use client';

import React, { useState, useEffect, useRef } from 'react';

const COLORS = {
  accent: '#39FF14',
  accentDim: 'rgba(57, 255, 20, 0.1)',
  black: '#000',
  darkBg: '#0a0a0a',
  borderColor: '#1a1a1a',
};

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  resolution: string;
  duration: string;
  prompt: string;
  tags: string[];
  isUploaded?: boolean;
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'item-1',
    title: 'Neon Cipher',
    category: 'Motion Graphics',
    description: 'Hypnotic digital landscape with cascading glitch elements',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"%3E%3Cdefs%3E%3ClinearGradient id="g1" x1="0" y1="0" x2="100" y2="100"%3E%3Cstop offset="0" style="stop-color:%2339FF14;stop-opacity:0.2"/%3E%3Cstop offset="100" style="stop-color:%23000;stop-opacity:1"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23g1)" width="1920" height="1080"/%3E%3Ccircle cx="960" cy="540" r="300" fill="none" stroke="%2339FF14" stroke-width="2" opacity="0.6"/%3E%3C/svg%3E',
    resolution: '4K',
    duration: '2m 34s',
    prompt: 'Cyberpunk neon grid landscape, particles flowing through digital space',
    tags: ['Neon', 'Digital', 'Cinematic'],
  },
  {
    id: 'item-2',
    title: 'Crystalline Dreams',
    category: 'Visual Effects',
    description: 'Ethereal crystal formations morphing through impossible geometry',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"%3E%3Cdefs%3E%3CradialGradient id="g2"%3E%3Cstop offset="0" style="stop-color:%23fff;stop-opacity:0.3"/%3E%3Cstop offset="100" style="stop-color:%23000;stop-opacity:1"/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect fill="url(%23g2)" width="1920" height="1080"/%3E%3C/svg%3E',
    resolution: '4K',
    duration: '1m 48s',
    prompt: 'Crystalline structures, light refraction, iridescent morphing',
    tags: ['Abstract', 'Light', 'Geometric'],
  },
  {
    id: 'item-3',
    title: 'Void Requiem',
    category: 'Cinematic',
    description: 'Apocalyptic landscape with towering structures emerging from cosmic void',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"%3E%3Cdefs%3E%3ClinearGradient id="g3" x1="0" y1="0" x2="0" y2="100"%3E%3Cstop offset="0" style="stop-color:%23ff00ff;stop-opacity:0.4"/%3E%3Cstop offset="100" style="stop-color:%23000;stop-opacity:1"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23g3)" width="1920" height="1080"/%3E%3C/svg%3E',
    resolution: '4K',
    duration: '3m 12s',
    prompt: 'Alien landscape, dark atmospheric void, massive structures',
    tags: ['Cinematic', 'Sci-Fi', 'Epic'],
  },
  {
    id: 'item-4',
    title: 'Liquid Metal Flow',
    category: 'Motion Graphics',
    description: 'Molten surface with hypnotic ripple dynamics and metallic reflections',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080"%3E%3Cdefs%3E%3ClinearGradient id="g4" x1="0" y1="0" x2="100" y2="0"%3E%3Cstop offset="0" style="stop-color:%23ffaa00;stop-opacity:0.5"/%3E%3Cstop offset="100" style="stop-color:%23000;stop-opacity:1"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect fill="url(%23g4)" width="1920" height="1080"/%3E%3C/svg%3E',
    resolution: '4K',
    duration: '2m 08s',
    prompt: 'Liquid metal surface, ripples, molten textures',
    tags: ['Metal', 'Fluid', 'Abstract'],
  },
];

export default function GalleryPage() {
  const [selectedId, setSelectedId] = useState<string>('item-1');
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoPlayTimer, setAutoPlayTimer] = useState<NodeJS.Timeout | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(GALLERY_ITEMS);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentItem = galleryItems.find((item) => item.id === selectedId);
  const currentIndex = galleryItems.findIndex((item) => item.id === selectedId);

  useEffect(() => {
    return () => {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
    };
  }, [autoPlayTimer]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadMessage('Uploading...');

    try {
      const file = files[0];
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        setUploadMessage(`Error: ${error.error}`);
        setIsUploading(false);
        setTimeout(() => setUploadMessage(''), 3000);
        return;
      }

      const data = await response.json();
      const newItem: GalleryItem = {
        id: `uploaded-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        category: data.type === 'video' ? 'Video' : 'Image',
        description: 'Uploaded from gallery',
        image: data.url,
        resolution: data.type === 'video' ? '1080p' : '4K',
        duration: data.type === 'video' ? 'Video' : 'Image',
        prompt: 'User uploaded content',
        tags: ['Custom', 'Uploaded'],
        isUploaded: true,
      };

      setGalleryItems([newItem, ...galleryItems]);
      setSelectedId(newItem.id);
      setUploadMessage('✓ File uploaded successfully!');
      setTimeout(() => setUploadMessage(''), 2000);
    } catch (error) {
      setUploadMessage(`Error: ${String(error)}`);
      setTimeout(() => setUploadMessage(''), 3000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const nextItem = () => {
    const nextIdx = (currentIndex + 1) % galleryItems.length;
    setSelectedId(galleryItems[nextIdx].id);
  };

  const previousItem = () => {
    const prevIdx = (currentIndex - 1 + galleryItems.length) % galleryItems.length;
    setSelectedId(galleryItems[prevIdx].id);
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (autoPlayTimer) clearInterval(autoPlayTimer);
      setAutoPlayTimer(null);
      setIsPlaying(false);
    } else {
      const timer = setInterval(() => {
        setSelectedId((prevId) => {
          const idx = galleryItems.findIndex((i) => i.id === prevId);
          return galleryItems[(idx + 1) % galleryItems.length].id;
        });
      }, 4000);
      setAutoPlayTimer(timer);
      setIsPlaying(true);
    }
  };

  if (!currentItem) {
    return <div style={{ background: COLORS.black, color: '#fff', padding: '20px' }}>Loading gallery...</div>;
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: COLORS.black,
        display: 'flex',
        overflow: 'hidden',
        fontFamily: 'Rajdhani, sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@500;700;900&family=Rajdhani:wght@400;500;600;700&display=swap');

        @keyframes w2enter {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(20px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        @keyframes w2pan {
          0% {
            transform: scale(1);
          }
          100% {
            transform: scale(1.05);
          }
        }

        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }

        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-thumb {
          background: #2a2a2a;
          border-radius: 4px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>

      {/* Main Viewport */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          background: 'linear-gradient(135deg, #0a0a0a 0%, #000 50%, #0a0a0a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Background Image */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
          }}
        >
          <img
            src={currentItem.image}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              animation: 'w2pan 8s ease-in-out infinite',
              filter: 'contrast(1.1) brightness(0.95)',
            }}
            alt={currentItem.title}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(0,0,0,.4), transparent 30%, transparent 70%, rgba(0,0,0,.4))',
            }}
          />
        </div>

        {/* Content Overlay */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            maxWidth: '700px',
            textAlign: 'center',
            animation: 'w2enter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          <div
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '13px',
              letterSpacing: '3px',
              color: COLORS.accent,
              textTransform: 'uppercase',
              fontWeight: 700,
              marginBottom: '16px',
            }}
          >
            {currentItem.category}
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: '48px',
              fontWeight: 900,
              lineHeight: 1.2,
              color: '#fff',
              textShadow: `0 4px 20px rgba(57,255,20,.3)`,
              marginBottom: '12px',
              fontFamily: 'Orbitron, sans-serif',
            }}
          >
            {currentItem.title}
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: '14px',
              color: '#bbb',
              lineHeight: 1.6,
              marginBottom: '20px',
            }}
          >
            {currentItem.description}
          </p>

          {/* Tags */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              fontSize: '12px',
            }}
          >
            {currentItem.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: 'rgba(57, 255, 20, 0.1)',
                  border: '1px solid rgba(57, 255, 20, 0.3)',
                  color: COLORS.accent,
                  borderRadius: '20px',
                  padding: '6px 12px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Play Button */}
        <button
          onClick={togglePlay}
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '40px',
            zIndex: 20,
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(57, 255, 20, 0.2)',
            border: `2px solid ${COLORS.accent}`,
            color: COLORS.accent,
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(57, 255, 20, 0.4)';
            (e.target as HTMLButtonElement).style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(57, 255, 20, 0.2)';
            (e.target as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>

        {/* Previous Button */}
        <button
          onClick={previousItem}
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            width: '50px',
            height: '50px',
            borderRadius: '8px',
            background: 'rgba(57, 255, 20, 0.15)',
            border: `1px solid rgba(57, 255, 20, 0.3)`,
            color: COLORS.accent,
            fontSize: '20px',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(57, 255, 20, 0.35)';
            (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(57, 255, 20, 0.15)';
            (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          ‹
        </button>

        {/* Next Button */}
        <button
          onClick={nextItem}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 20,
            width: '50px',
            height: '50px',
            borderRadius: '8px',
            background: 'rgba(57, 255, 20, 0.15)',
            border: `1px solid rgba(57, 255, 20, 0.3)`,
            color: COLORS.accent,
            fontSize: '20px',
            cursor: 'pointer',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(57, 255, 20, 0.35)';
            (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(57, 255, 20, 0.15)';
            (e.target as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
          }}
        >
          ›
        </button>
      </div>

      {/* Right Sidebar */}
      <div
        style={{
          flex: '0 0 320px',
          background: COLORS.darkBg,
          borderLeft: `1px solid ${COLORS.borderColor}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: `1px solid ${COLORS.borderColor}`,
            background: `linear-gradient(180deg, rgba(57,255,20,.08), transparent)`,
          }}
        >
          <div
            style={{
              fontFamily: 'Orbitron, sans-serif',
              fontSize: '11px',
              color: COLORS.accent,
              letterSpacing: '2px',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Gallery
          </div>
          <div style={{ fontSize: '13px', color: '#bbb' }}>
            {currentIndex + 1}/{galleryItems.length}
          </div>
        </div>

        {/* Thumbnails */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          {/* Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            style={{
              width: '100%',
              padding: '12px',
              background: isUploading ? 'rgba(57, 255, 20, 0.1)' : 'rgba(57, 255, 20, 0.2)',
              border: `1px solid ${COLORS.accent}`,
              borderRadius: '8px',
              color: COLORS.accent,
              fontSize: '12px',
              fontWeight: 700,
              cursor: isUploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              marginBottom: '8px',
              textTransform: 'uppercase',
              opacity: isUploading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isUploading) {
                (e.target as HTMLButtonElement).style.background = 'rgba(57, 255, 20, 0.35)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isUploading) {
                (e.target as HTMLButtonElement).style.background = 'rgba(57, 255, 20, 0.2)';
              }
            }}
          >
            {isUploading ? '⏳ Uploading...' : '+ Upload'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={handleUpload}
            disabled={isUploading}
          />
          {uploadMessage && (
            <div
              style={{
                padding: '8px',
                fontSize: '11px',
                color: uploadMessage.includes('Error') ? '#ff6b6b' : COLORS.accent,
                background: uploadMessage.includes('Error') ? 'rgba(255, 107, 107, 0.1)' : 'rgba(57, 255, 20, 0.1)',
                borderRadius: '6px',
                marginBottom: '8px',
                textAlign: 'center',
              }}
            >
              {uploadMessage}
            </div>
          )}

          {galleryItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              style={{
                textAlign: 'left',
                background: selectedId === item.id ? 'rgba(57, 255, 20, 0.2)' : 'rgba(57, 255, 20, 0.05)',
                border: selectedId === item.id ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.borderColor}`,
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s',
                aspectRatio: '4/3',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (selectedId !== item.id) {
                  (e.target as HTMLButtonElement).style.borderColor = COLORS.accent;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedId !== item.id) {
                  (e.target as HTMLButtonElement).style.borderColor = COLORS.borderColor;
                }
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: selectedId === item.id ? 'brightness(1.1)' : 'brightness(0.8)',
                  transition: 'filter 0.2s',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(180deg, transparent, rgba(0,0,0,.6))',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '8px',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                >
                  {item.title.substring(0, 20)}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Metadata Footer */}
        <div
          style={{
            borderTop: `1px solid ${COLORS.borderColor}`,
            padding: '16px',
            background: `linear-gradient(180deg, transparent, rgba(57,255,20,.05))`,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                background: COLORS.darkBg,
                border: `1px solid ${COLORS.borderColor}`,
                borderRadius: '6px',
                padding: '10px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  color: '#888',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                Resolution
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: COLORS.accent,
                  fontWeight: 700,
                }}
              >
                {currentItem.resolution}
              </div>
            </div>
            <div
              style={{
                background: COLORS.darkBg,
                border: `1px solid ${COLORS.borderColor}`,
                borderRadius: '6px',
                padding: '10px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '10px',
                  color: '#888',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                Duration
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: COLORS.accent,
                  fontWeight: 700,
                }}
              >
                {currentItem.duration}
              </div>
            </div>
          </div>

          <div
            style={{
              fontSize: '11px',
              color: '#888',
              textTransform: 'uppercase',
              marginBottom: '6px',
              fontWeight: 700,
            }}
          >
            Prompt
          </div>
          <div
            style={{
              fontSize: '11px',
              color: '#bbb',
              lineHeight: 1.4,
              fontStyle: 'italic',
            }}
          >
            {currentItem.prompt}
          </div>
        </div>
      </div>
    </div>
  );
}
