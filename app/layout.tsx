import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WISE² — Ideas Become Systems",
  description: "WISE² connects strategy, design, technology, content, automation and growth to turn raw ideas into working systems.",
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
