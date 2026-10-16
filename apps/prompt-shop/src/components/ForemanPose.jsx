import React from "react";

const SAFE_POSE = /^[a-z0-9-]+\.[a-z0-9-]+$/;

export function foremanPoseUrl(pose) {
  const value = SAFE_POSE.test(pose || "") ? pose : "social.welcome";
  const [group, name] = value.split(".");
  return `/assets/foreman/poses/${group}/${name}.webp`;
}

export default function ForemanPose({ pose = "social.welcome", alt = "Build Foreman", className = "", size = 220 }) {
  return (
    <img
      src={foremanPoseUrl(pose)}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      decoding="async"
      className={`wt-foreman-pose ${className}`}
      data-pose={pose}
    />
  );
}
