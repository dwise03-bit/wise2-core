'use client';

import { BLAKKHAIL } from './brand-tokens';

interface BlakkhailFeaturedVideoProps {
  videoId: string;
  title?: string;
  autoplay?: boolean;
}

export function BlakkhailFeaturedVideo({
  videoId,
  title = 'Blakk Hail & UF Commercial',
  autoplay = true,
}: BlakkhailFeaturedVideoProps) {
  const autoplayParam = autoplay ? '1' : '0';
  const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=${autoplayParam}&mute=${autoplay ? '1' : '0'}&controls=1&rel=0&modestbranding=1`;

  return (
    <section className="w-full bg-black py-0" style={{ backgroundColor: BLAKKHAIL.jetBlack }}>
      {/* Full-width container */}
      <div className="w-full aspect-video">
        <iframe
          width="100%"
          height="100%"
          src={youtubeEmbedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>

      {/* Video title and info below */}
      <div className="w-full px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <h2
            className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 tracking-tight"
            style={{ color: BLAKKHAIL.gold }}
          >
            {title}
          </h2>
          <p
            className="text-sm md:text-base leading-relaxed max-w-3xl"
            style={{ color: BLAKKHAIL.steel }}
          >
            Experience the creative vision of Blakk Hail. Original fashion, designed for the culture.
          </p>
        </div>
      </div>
    </section>
  );
}
