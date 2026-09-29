"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { DEMO_ADMIN_CODE, createGeneratedDemoProfile, resolveDemoProfile } from "@/lib/demo/profiles";
import type { DemoProfile } from "@/lib/demo/types";

const STORAGE_PREFIX = "wise2-demo";

function readUnlocked() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(`${STORAGE_PREFIX}:admin-unlocked`) === "true";
}

function readCustomProfile(slug: string) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}:profile:${slug}`);
    return raw ? (JSON.parse(raw) as DemoProfile) : null;
  } catch {
    return null;
  }
}

function saveCustomProfile(profile: DemoProfile) {
  window.localStorage.setItem(`${STORAGE_PREFIX}:profile:${profile.slug}`, JSON.stringify(profile));
}

export default function DemoAdminPage() {
  const router = useRouter();
  const [unlocked, setUnlocked] = useState(() => readUnlocked());
  const [code, setCode] = useState("");
  const [slug, setSlug] = useState("javon");
  const [profile, setProfile] = useState<DemoProfile>(() => resolveDemoProfile("javon"));

  if (!unlocked) {
    return (
      <main className="min-h-screen bg-[#050505] px-4 py-16 text-[#f6f0e4]">
        <div className="mx-auto max-w-xl rounded-[2rem] border border-[rgba(216,164,58,0.28)] bg-[rgba(8,8,10,0.96)] p-6">
          <Badge className="bg-[rgba(17,119,255,0.12)] text-[#8fb8ff]">Internal admin</Badge>
          <h1 className="mt-4 text-3xl font-semibold">Demo configuration gate</h1>
          <p className="mt-2 text-sm leading-7 text-[#b5aea6]">
            Enter the internal code to configure demo profiles.
          </p>
          <Input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Admin code"
            className="mt-5 border-[rgba(255,255,255,0.08)] bg-black/30 text-[#f6f0e4]"
          />
          <Button
            className="mt-4 w-full bg-[linear-gradient(135deg,#d8a43a,#a36f10)] text-[#0b0b0c]"
              onClick={() => {
                if (code.trim() !== DEMO_ADMIN_CODE) return;
                window.localStorage.setItem(`${STORAGE_PREFIX}:admin-unlocked`, "true");
                setUnlocked(true);
              }}
          >
            Unlock admin controls
          </Button>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[#8fb8ff]">
            Unauthorized admin access remains blocked until the code is entered.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-10 text-[#f6f0e4]">
      <div className="mx-auto grid max-w-5xl gap-6">
        <Card className="border-[rgba(216,164,58,0.22)] bg-[rgba(8,8,10,0.96)]">
          <CardHeader>
            <CardTitle>Demo profile editor</CardTitle>
            <CardDescription className="text-[#a9a39a]">
              Admin controls unlocked for this browser session.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="demo slug" className="border-[rgba(255,255,255,0.08)] bg-black/30 text-[#f6f0e4]" />
            <Input
              value={profile.prospectName}
              onChange={(event) => setProfile((current) => ({ ...current, prospectName: event.target.value }))}
              placeholder="prospect name"
              className="border-[rgba(255,255,255,0.08)] bg-black/30 text-[#f6f0e4]"
            />
            <Input
              value={profile.companyName}
              onChange={(event) => setProfile((current) => ({ ...current, companyName: event.target.value }))}
              placeholder="company"
              className="border-[rgba(255,255,255,0.08)] bg-black/30 text-[#f6f0e4]"
            />
            <Input
              value={profile.industry}
              onChange={(event) => setProfile((current) => ({ ...current, industry: event.target.value }))}
              placeholder="industry"
              className="border-[rgba(255,255,255,0.08)] bg-black/30 text-[#f6f0e4]"
            />
            <Input
              value={profile.pricing.setupFee}
              type="number"
              onChange={(event) => setProfile((current) => ({ ...current, pricing: { ...current.pricing, setupFee: Number(event.target.value) } }))}
              placeholder="setup fee"
              className="border-[rgba(255,255,255,0.08)] bg-black/30 text-[#f6f0e4]"
            />
            <Input
              value={profile.pricing.monthlyPrice}
              type="number"
              onChange={(event) => setProfile((current) => ({ ...current, pricing: { ...current.pricing, monthlyPrice: Number(event.target.value) } }))}
              placeholder="monthly price"
              className="border-[rgba(255,255,255,0.08)] bg-black/30 text-[#f6f0e4]"
            />
            <Textarea
              value={profile.heroCopy}
              onChange={(event) => setProfile((current) => ({ ...current, heroCopy: event.target.value }))}
              placeholder="hero copy"
              className="min-h-28 border-[rgba(255,255,255,0.08)] bg-black/30 text-[#f6f0e4]"
            />
            <Textarea
              value={profile.modules.join(", ")}
              onChange={(event) =>
                setProfile((current) => ({ ...current, modules: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) }))
              }
              placeholder="modules, comma separated"
              className="min-h-28 border-[rgba(255,255,255,0.08)] bg-black/30 text-[#f6f0e4]"
            />
          </CardContent>
        </Card>

        <Card className="border-[rgba(17,119,255,0.2)] bg-[rgba(17,119,255,0.06)]">
          <CardHeader>
            <CardTitle>Preview and save</CardTitle>
            <CardDescription className="text-[#a9a39a]">
              Create or override a profile, then jump into the live demo route.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="border-[rgba(255,255,255,0.08)] bg-transparent text-[#f6f0e4]"
              onClick={() => {
                const existing = readCustomProfile(slug);
                setProfile(existing ?? resolveDemoProfile(slug));
              }}
            >
              Load slug
            </Button>
            <Button
              className="bg-[linear-gradient(135deg,#1177ff,#7ab2ff)] text-[#07101f]"
              onClick={() => {
                const generated = createGeneratedDemoProfile(slug || "demo");
                setProfile((current) => ({ ...generated, ...current, slug: slug || "demo" }));
              }}
            >
              Create template
            </Button>
            <Button
              className="bg-[linear-gradient(135deg,#d8a43a,#a36f10)] text-[#0b0b0c]"
              onClick={() => {
                const nextProfile = { ...profile, slug: slug || profile.slug };
                setProfile(nextProfile);
                saveCustomProfile(nextProfile);
                router.push(`/demo/${nextProfile.slug}`);
              }}
            >
              Save and open demo
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
