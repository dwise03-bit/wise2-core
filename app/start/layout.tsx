import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start a Project",
  description: "Bring WISE² the rough idea. Choose a starting path and create a clear project brief.",
};

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
