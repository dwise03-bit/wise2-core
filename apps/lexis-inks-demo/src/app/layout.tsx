import type { Metadata } from "next";
import { Geist, Geist_Mono, Amatic_SC, Cabin } from "next/font/google";
import "./design-tokens.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const amaticSC = Amatic_SC({
  variable: "--font-script",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const cabin = Cabin({
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lexi's Inks × WISE²",
  description: "Custom handmade pens for your brand. Powered by WISE².",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${amaticSC.variable} ${cabin.variable}`}>
        {children}
      </body>
    </html>
  );
}
