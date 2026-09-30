import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WISE² Video Clipper",
  description: "AI-powered video clipping and multi-platform publishing",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-wise-navy text-white font-sans">
        {children}
      </body>
    </html>
  );
}
