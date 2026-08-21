import type { Metadata } from "next";
import { Lora, Poppins } from "next/font/google";
import "./globals.css";

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CC Craft & Create — Custom Personalized Products",
  description: "Custom personalized products for every occasion. Fast turnaround, high-quality printing, made with love.",
  openGraph: {
    title: "CC Craft & Create — Crafted for the Moment. Created for the Memory.",
    description: "Custom products for birthdays, graduations, memorials, holidays, and more.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lora.variable} ${poppins.variable}`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
