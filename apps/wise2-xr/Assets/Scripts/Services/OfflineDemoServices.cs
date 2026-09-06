using System;
using System.Collections.Generic;

namespace Wise2.XR
{
    public sealed class OfflineDemoServices : IWise2ApiClient, IDiscordCommandService, ICommandApprovalService, IWorldStateService
    {
        public WorldState State => WorldState.OfflineDemo;
        public WorldState Current => State;
        public KpiSnapshot GetKpis() => new KpiSnapshot { ActiveProjects = 12, OpenTasks = 48, Opportunities = 14, AgentsOnline = 6 };
        public IReadOnlyList<ActivityItem> GetActivity() => new List<ActivityItem>
        {
            new ActivityItem { Agent = "REAPER", Message = "Checked Robert's Google reviews", Channel = "live-activity", Priority = "normal", Timestamp = DateTime.UtcNow },
            new ActivityItem { Agent = "Sales Agent", Message = "Found a new upsell opportunity", Channel = "sales-leads", Priority = "normal", Timestamp = DateTime.UtcNow },
            new ActivityItem { Agent = "Project Agent", Message = "Three deliverables waiting for approval", Channel = "wise2-command", Priority = "high", Timestamp = DateTime.UtcNow },
        };
        public IReadOnlyList<ActivityItem> GetRecentMessages() => GetActivity();
        public CommandPreview PrepareMessage(string channel, string message) => Preview("Send Discord message", $"Post to #{channel}: {message}");
        public CommandPreview Preview(string intent, string summary) => new CommandPreview { Intent = intent, Summary = summary, RequiresApproval = true };
        public bool Confirm(CommandPreview preview) => preview != null && preview.RequiresApproval;
    }
}
