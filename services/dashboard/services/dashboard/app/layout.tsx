import type { Metadata } from "next";
import './globals.css';

export const metadata: Metadata = {
  title: "WISE² Enterprise - Organized Chaos. Perfectly Executed.",
  description: "WISE² - The AI-powered operating system for modern businesses. From creative production to business operations, community and AI automation.",
  openGraph: {
    title: "WISE² Enterprise",
    description: "Build the future. Organized chaos, perfectly executed.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="blueprint-bg">
        {children}
      </body>
    </html>
  );
}
