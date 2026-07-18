import { useMemo } from 'react';

export interface SpriteAnimationConfig {
  spriteUrl: string;
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
  fps?: number;
  loop?: boolean;
}

export interface SpriteAnimationStyle {
  width: string;
  height: string;
  backgroundImage: string;
  backgroundPosition: string;
  backgroundRepeat: string;
  backgroundSize: string;
  animation: string;
}

/**
 * Hook for sprite sheet animations using pure CSS steps()
 * @param config - Sprite animation configuration
 * @returns Object with style properties and CSS keyframes
 */
export function useSpriteAnimation(config: SpriteAnimationConfig) {
  const {
    spriteUrl,
    frameCount,
    frameWidth,
    frameHeight,
    fps = 12,
    loop = true,
  } = config;

  const duration = (frameCount / fps).toFixed(2);
  const totalWidth = frameCount * frameWidth;

  const style: SpriteAnimationStyle = useMemo(() => ({
    width: `${frameWidth}px`,
    height: `${frameHeight}px`,
    backgroundImage: `url('${spriteUrl}')`,
    backgroundPosition: '0 0',
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${totalWidth}px ${frameHeight}px`,
    animation: `sprite-play ${duration}s steps(${frameCount}) ${loop ? 'infinite' : '1'}`,
  }), [spriteUrl, frameCount, frameWidth, frameHeight, duration, loop]);

  const keyframes = `
    @keyframes sprite-play {
      0% {
        background-position: 0 0;
      }
      100% {
        background-position: -${totalWidth}px 0;
      }
    }
  `;

  return {
    style,
    keyframes,
    duration: parseFloat(duration),
    frameCount,
  };
}
