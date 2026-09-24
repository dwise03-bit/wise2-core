import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WISE² Command Center",
  description: "Premium business operating system for brand, CRM, automation, content, and analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-[#050505] text-[#f6f0e4]">{children}</body>
    </html>
  );
}
