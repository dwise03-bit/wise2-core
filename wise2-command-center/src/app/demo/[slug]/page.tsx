import type { Metadata } from "next";

import { DemoExperience } from "@/components/demo/demo-experience";
import { resolveDemoProfile } from "@/lib/demo/profiles";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const profile = resolveDemoProfile(slug);

  return {
    title: `${profile.companyName} | WISE² Demo`,
    description: profile.heroCopy,
  };
}

export default async function DemoSlugPage({ params }: PageProps) {
  const { slug } = await params;
  const profile = resolveDemoProfile(slug);

  return <DemoExperience slug={slug} profile={profile} />;
}
