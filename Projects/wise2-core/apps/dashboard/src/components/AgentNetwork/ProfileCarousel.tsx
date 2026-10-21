import React, { useState } from 'react';
import styles from './ProfileCarousel.module.css';

/**
 * Profile Carousel Component
 * Instagram-style story ring carousel
 */

interface Profile {
  id: string;
  name: string;
  imageUrl: string;
  gradient: 'red' | 'magenta' | 'orange' | 'yellow';
  isStory?: boolean;
}

interface ProfileCarouselProps {
  profiles: Profile[];
  onProfileSelect?: (profileId: string) => void;
  onAddStory?: () => void;
}

const gradientMap = {
  red: 'linear-gradient(135deg, #FF0000, #FF6B6B)',
  magenta: 'linear-gradient(135deg, #FF00FF, #FF69B4)',
  orange: 'linear-gradient(135deg, #FF8800, #FFB347)',
  yellow: 'linear-gradient(135deg, #FFD700, #FFA500)',
};

export const ProfileCarousel: React.FC<ProfileCarouselProps> = ({
  profiles,
  onProfileSelect,
  onAddStory,
}) => {
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const handleProfileClick = (profileId: string) => {
    setSelectedProfile(profileId);
    onProfileSelect?.(profileId);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.addButton} onClick={onAddStory}>
          +
        </button>
        <h2 className={styles.title}>Instagram</h2>
        <div className={styles.heart}>♥</div>
      </div>

      <div className={styles.carousel}>
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className={`${styles.profileRing} ${
              selectedProfile === profile.id ? styles.selected : ''
            }`}
            onClick={() => handleProfileClick(profile.id)}
          >
            <div
              className={styles.ringBorder}
              style={{ background: gradientMap[profile.gradient] }}
            >
              <img
                src={profile.imageUrl}
                alt={profile.name}
                className={styles.image}
              />
            </div>
            <div className={styles.label}>{profile.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
