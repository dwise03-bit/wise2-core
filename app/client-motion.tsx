"use client";
import { useEffect } from "react";

export default function ClientMotion() {
  useEffect(() => {
    const items = document.querySelectorAll<HTMLElement>("section:not(.hero)");
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.1 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);
  return null;
}
