using System;
using System.Collections.Generic;

namespace Wise2.XR
{
    public static class CommandCenterCatalog
    {
        public static readonly string[] Domains =
        {
            "BUSINESS", "INFRASTRUCTURE", "AI AGENTS",
            "WORLDS", "PEOPLE", "OPPORTUNITY"
        };

        public static readonly string[] Systems =
        {
            "CODEBASE", "DEPLOYMENTS", "VPS & SERVERS",
            "MAC SYSTEMS", "RASPBERRY PI", "AUTOMATION"
        };

        public static readonly string[] Operations =
        {
            "DOCUMENTATION", "RESEARCH", "MARKETING",
            "CRM", "FINANCE", "PLANNING"
        };

        public static readonly string[] Worlds = { "NEXUS", "ORBITAL", "FOUNDRY" };
    }

    public sealed class CommandCenterNavigator
    {
        private static readonly HashSet<string> Routes = BuildRoutes();
        public string CurrentRoute { get; private set; } = "HOME";
        public string Status { get; private set; } = "READY";

        public bool Navigate(string route)
        {
            var normalized = (route ?? string.Empty).Trim().ToUpperInvariant();
            if (!Routes.Contains(normalized))
            {
                Status = "UNAVAILABLE";
                return false;
            }
            CurrentRoute = normalized;
            Status = "READY";
            return true;
        }

        public void GoHome()
        {
            CurrentRoute = "HOME";
            Status = "READY";
        }

        private static HashSet<string> BuildRoutes()
        {
            var routes = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "HOME", "SYSTEMS", "OPERATIONS", "WORLDS" };
            foreach (var route in CommandCenterCatalog.Domains) routes.Add(route);
            foreach (var route in CommandCenterCatalog.Systems) routes.Add(route);
            foreach (var route in CommandCenterCatalog.Operations) routes.Add(route);
            foreach (var route in CommandCenterCatalog.Worlds) routes.Add(route);
            return routes;
        }
    }
}
