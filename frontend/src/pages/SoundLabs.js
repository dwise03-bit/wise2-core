import React from "react";
import HeroBanner from "@/components/soundlabs/HeroBanner";
import StudioStatus from "@/components/soundlabs/StudioStatus";
import ActiveProjects from "@/components/soundlabs/ActiveProjects";
import StudioOverview from "@/components/soundlabs/StudioOverview";
import RecentActivity from "@/components/soundlabs/RecentActivity";
import HermesChat from "@/components/soundlabs/HermesChat";
import AudioMeters from "@/components/soundlabs/AudioMeters";
import BeatMaker from "@/components/soundlabs/BeatMaker";
import PluginsEffects from "@/components/soundlabs/PluginsEffects";
import SoundLibrary from "@/components/soundlabs/SoundLibrary";

export default function SoundLabs() {
  return (
    <div className="p-6 space-y-6" data-testid="sound-labs-page">
      {/* Row 1 */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8"><HeroBanner /></div>
        <div className="col-span-12 xl:col-span-4"><StudioStatus /></div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4"><ActiveProjects /></div>
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <StudioOverview />
          <div className="grid grid-cols-2 gap-4">
            <RecentActivity />
            <HermesChat compact />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4"><AudioMeters /></div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-6"><BeatMaker /></div>
        <div className="col-span-12 lg:col-span-3"><PluginsEffects /></div>
        <div className="col-span-12 lg:col-span-3"><SoundLibrary /></div>
      </div>
    </div>
  );
}
