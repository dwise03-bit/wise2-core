using System;
using System.Collections.Generic;

namespace Wise2.XR
{
    public enum WorldState { Loading, Connected, OfflineDemo, Degraded, CriticalAlert, AwaitingApproval, Completed, Failed }
    public sealed class KpiSnapshot { public int ActiveProjects, OpenTasks, Opportunities, AgentsOnline; public string PotentialRevenue = "$48.5K"; }
    public sealed class ActivityItem { public string Agent, Message, Channel, Priority; public DateTime Timestamp; }
    public sealed class CommandPreview { public string Intent, Summary; public bool RequiresApproval = true; public string AuditId = Guid.NewGuid().ToString("N"); }

    public interface IWise2ApiClient { WorldState State { get; } KpiSnapshot GetKpis(); IReadOnlyList<ActivityItem> GetActivity(); }
    public interface IDiscordCommandService { IReadOnlyList<ActivityItem> GetRecentMessages(); CommandPreview PrepareMessage(string channel, string message); bool Confirm(CommandPreview preview); }
    public interface ICommandApprovalService { CommandPreview Preview(string intent, string summary); bool Confirm(CommandPreview preview); }
    public interface IVoiceCommandService { void Submit(string transcript); }
    public interface IWorldStateService { WorldState Current { get; } }
}
