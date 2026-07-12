import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WISE² Dashboard",
  description: "Unified Control Center",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
