import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://wise2.net"),
  title: { default: "WISE² — Ideas Become Systems", template: "%s | WISE²" },
  description: "WISE² connects strategy, design, technology, content, automation and growth to turn raw ideas into working systems.",
  keywords: ["creative technology studio", "brand systems", "business automation", "website design", "product strategy", "WISE²"],
  robots: { index: true, follow: true },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
