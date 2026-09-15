#if UNITY_EDITOR
using NUnit.Framework;
using System.Linq;

namespace Wise2.XR.Tests
{
    public class CommandCenterNavigationTest
    {
        [Test]
        public void Catalog_HasSixPrimaryDomains()
        {
            var domains = CommandCenterCatalog.PrimaryDomains;

            Assert.AreEqual(6, domains.Count);
            CollectionAssert.AreEqual(
                new[] { "BUSINESS", "INFRASTRUCTURE", "AI AGENTS", "WORLDS", "PEOPLE", "OPPORTUNITY" },
                domains.Select(item => item.Title).ToArray());
        }

        [Test]
        public void Catalog_HasRequiredConsoleScreens()
        {
            Assert.IsTrue(CommandCenterCatalog.TryGetScreen("systems", out var systems));
            Assert.IsTrue(CommandCenterCatalog.TryGetScreen("operations", out var operations));
            Assert.IsTrue(CommandCenterCatalog.TryGetScreen("worlds", out var worlds));

            CollectionAssert.Contains(systems.Items.Select(item => item.Title).ToArray(), "RASPBERRY PI");
            CollectionAssert.Contains(operations.Items.Select(item => item.Title).ToArray(), "FINANCE");
            CollectionAssert.Contains(worlds.Items.Select(item => item.Title).ToArray(), "NEXUS");
        }

        [Test]
        public void Navigator_KeepsUnknownRoutesClosed()
        {
            var navigator = new CommandCenterNavigator();

            var changed = navigator.Open("not-a-real-screen");

            Assert.IsFalse(changed);
            Assert.AreEqual("home", navigator.CurrentScreenId);
            Assert.AreEqual("DESTINATION UNAVAILABLE", navigator.StatusMessage);
        }

        [Test]
        public void Navigator_HomeRestoresCommandCenter()
        {
            var navigator = new CommandCenterNavigator();
            Assert.IsTrue(navigator.Open("systems"));

            navigator.Home();

            Assert.AreEqual("home", navigator.CurrentScreenId);
            Assert.AreEqual(string.Empty, navigator.StatusMessage);
        }
    }
}
#endif
