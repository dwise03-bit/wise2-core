import '../../src/styles/sound-lab.css';

export default function SoundLabLayout({ children }: { children: React.ReactNode }) {
  return <div className="sl-root min-h-[calc(100vh-var(--topbar-height))]">{children}</div>;
}
