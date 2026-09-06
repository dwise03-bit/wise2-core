using System;
using NUnit.Framework;
using WISE2.SoundLabs.Networking;

namespace WISE2.SoundLabs.Tests.EditMode
{
    public class WiseApiConfigTests
    {
        [Test]
        public void ProductionBaseUrlMustUseHttps()
        {
            Assert.Throws<ArgumentException>(() => new WiseApiConfig("http://api.wise2.net", true));
        }

        [Test]
        public void ProductionBaseUrlAcceptsHttps()
        {
            var config = new WiseApiConfig("https://studio.wise2.net", true);
            Assert.That(config.BaseUrl.Scheme, Is.EqualTo(Uri.UriSchemeHttps));
        }
    }
}
