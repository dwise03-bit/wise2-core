const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export function asset(path: string) {
  return `${BASE}${path}`;
}

export function BrandImg({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return <img src={asset(src)} alt={alt} className={className} style={style} />;
}
