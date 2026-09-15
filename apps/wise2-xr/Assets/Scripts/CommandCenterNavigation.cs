using System;
using System.Collections.Generic;

namespace Wise2.XR
{
    public sealed class CommandCenterItem
    {
        public string Id { get; }
        public string Title { get; }
        public CommandCenterItem(string id, string title) { Id = id; Title = title; }
    }

    public sealed class CommandCenterScreen
    {
        public string Id { get; }
        public string Title { get; }
        public IReadOnlyList<CommandCenterItem> Items { get; }
        public CommandCenterScreen(string id, string title, params string[] items)
        {
            Id = id; Title = title;
            var list = new List<CommandCenterItem>();
            foreach (var item in items) list.Add(new CommandCenterItem(Slug(item), item));
            Items = list;
        }
        private static string Slug(string value) => value.ToLowerInvariant().Replace(" & ", "-").Replace(" ", "-");
    }

    public static class CommandCenterCatalog
    {
        public static readonly IReadOnlyList<CommandCenterItem> PrimaryDomains = new List<CommandCenterItem>
        {
            new CommandCenterItem("business", "BUSINESS"), new CommandCenterItem("infrastructure", "INFRASTRUCTURE"),
            new CommandCenterItem("ai-agents", "AI AGENTS"), new CommandCenterItem("worlds", "WORLDS"),
            new CommandCenterItem("people", "PEOPLE"), new CommandCenterItem("opportunity", "OPPORTUNITY")
        };

        private static readonly Dictionary<string, CommandCenterScreen> Screens =
            new Dictionary<string, CommandCenterScreen>(StringComparer.OrdinalIgnoreCase)
            {
                ["systems"] = new CommandCenterScreen("systems", "SYSTEMS", "CODEBASE", "DEPLOYMENTS", "VPS & SERVERS", "MAC SYSTEMS", "RASPBERRY PI", "AUTOMATION"),
                ["operations"] = new CommandCenterScreen("operations", "OPERATIONS", "DOCUMENTATION", "RESEARCH", "MARKETING", "CRM", "FINANCE", "PLANNING"),
                ["worlds"] = new CommandCenterScreen("worlds", "WORLDS", "NEXUS", "ORBITAL", "FOUNDRY")
            };

        public static bool TryGetScreen(string id, out CommandCenterScreen screen) => Screens.TryGetValue(id ?? string.Empty, out screen);
    }

    public sealed class CommandCenterNavigator
    {
        public string CurrentScreenId { get; private set; } = "home";
        public string StatusMessage { get; private set; } = string.Empty;

        public bool Open(string screenId)
        {
            if (!CommandCenterCatalog.TryGetScreen(screenId, out _))
            {
                StatusMessage = "DESTINATION UNAVAILABLE";
                return false;
            }
            CurrentScreenId = screenId.ToLowerInvariant();
            StatusMessage = string.Empty;
            return true;
        }

        public void Home()
        {
            CurrentScreenId = "home";
            StatusMessage = string.Empty;
        }
    }
}
