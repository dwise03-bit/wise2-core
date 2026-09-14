using System.Collections.Generic;

namespace Wise2.XR.HvacWorld
{
    public readonly struct ServiceFee
    {
        public ServiceFee(string id, string label, decimal price) { Id = id; Label = label; Price = price; }
        public string Id { get; }
        public string Label { get; }
        public decimal Price { get; }
    }

    public static class RooftopWorldCatalog
    {
        public static readonly IReadOnlyList<string> MenuSections = new[]
        {
            "CRM", "Dispatch", "Work Orders", "Schedule", "Invoices", "Clients", "Leads", "Quotes",
            "Contracts", "Equipment", "PM", "Parts", "Inventory", "Reports", "Photos", "Team",
            "Automation", "Integrations", "Analytics", "AI Assist"
        };

        public static readonly IReadOnlyList<string> TrainingModes = new[]
        {
            "Components", "Diagnostics", "Maintenance", "Troubleshooting", "Safety"
        };

        public static readonly IReadOnlyList<ServiceFee> ServiceFees = new[]
        {
            new ServiceFee("diagnostic", "Diagnostic / Service Call", 129m),
            new ServiceFee("rooftop-pm", "Commercial Rooftop PM", 249m),
            new ServiceFee("coil-cleaning", "Condenser Coil Cleaning", 189m),
            new ServiceFee("drain-clear", "Condensate Drain Clearing", 149m),
            new ServiceFee("contactor", "Contactor Replacement", 279m),
            new ServiceFee("capacitor", "Capacitor Replacement", 239m),
            new ServiceFee("refrigerant", "Refrigerant Service", 199m)
        };
    }
}
