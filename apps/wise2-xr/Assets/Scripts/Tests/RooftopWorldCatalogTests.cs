using NUnit.Framework;
using System.Linq;
using Wise2.XR.HvacWorld;

namespace Wise2.XR.Tests
{
    public class RooftopWorldCatalogTests
    {
        [Test]
        public void IncludesCoreMenus()
        {
            var required = new[] { "CRM", "Dispatch", "Work Orders", "Schedule", "Invoices", "Clients", "Equipment", "Parts", "Analytics", "AI Assist" };
            foreach (var item in required) Assert.That(RooftopWorldCatalog.MenuSections.Contains(item), Is.True, item);
        }

        [Test]
        public void IncludesCoreTrainingModes()
        {
            CollectionAssert.IsSubsetOf(new[] { "Components", "Diagnostics", "Maintenance", "Troubleshooting", "Safety" }, RooftopWorldCatalog.TrainingModes);
        }

        [Test]
        public void IncludesCommonServiceFees()
        {
            Assert.That(RooftopWorldCatalog.ServiceFees.Any(x => x.Id == "diagnostic"), Is.True);
            Assert.That(RooftopWorldCatalog.ServiceFees.Any(x => x.Id == "rooftop-pm"), Is.True);
            Assert.That(RooftopWorldCatalog.ServiceFees.Any(x => x.Id == "coil-cleaning"), Is.True);
            Assert.That(RooftopWorldCatalog.ServiceFees.Any(x => x.Id == "drain-clear"), Is.True);
        }
    }
}
