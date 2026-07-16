import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import LiveStudio from "@/components/dash/LiveStudio";
import LiveChat from "@/components/dash/LiveChat";
import DiscordCard from "@/components/dash/DiscordCard";
import LiveSchedule from "@/components/dash/LiveSchedule";
import ActiveProjects from "@/components/dash/ActiveProjects";
import CommunityFeed from "@/components/dash/CommunityFeed";
import Leaderboard from "@/components/dash/Leaderboard";
import EnterpriseFooter from "@/components/dash/EnterpriseFooter";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    api.get("/dashboard").then((r) => setData(r.data)).catch(() => setErr(true));
  }, []);

  if (err) return <div className="p-8 text-red-400">Failed to load command center.</div>;
  if (!data) return (
    <div className="h-full flex items-center justify-center">
      <div className="neon-text font-display animate-pulse tracking-mega">LOADING COMMAND CENTER…</div>
    </div>
  );

  return (
    <div className="p-4 space-y-4" data-testid="dashboard">
      {/* Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr_0.85fr] gap-4">
        <LiveStudio data={data} />
        <LiveChat />
        <DiscordCard data={data} />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <LiveSchedule data={data} />
        <ActiveProjects data={data} />
        <CommunityFeed data={data} />
        <Leaderboard data={data} />
      </div>

      {/* Row 3 */}
      <EnterpriseFooter data={data} />
    </div>
  );
}
