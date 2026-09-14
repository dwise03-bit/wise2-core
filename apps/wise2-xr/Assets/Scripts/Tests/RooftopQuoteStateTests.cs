using NUnit.Framework;
using Wise2.XR.HvacWorld;

namespace Wise2.XR.Tests
{
    public class RooftopQuoteStateTests
    {
        [Test]
        public void AddsEachServiceOnceAndTotalsQuote()
        {
            var quote = new RooftopQuoteState();
            Assert.That(quote.AddService("diagnostic"), Is.True);
            Assert.That(quote.AddService("diagnostic"), Is.False);
            Assert.That(quote.AddService("drain-clear"), Is.True);
            Assert.That(quote.Total, Is.EqualTo(278m));
        }

        [Test]
        public void RemovesSelectedService()
        {
            var quote = new RooftopQuoteState();
            quote.AddService("rooftop-pm");
            Assert.That(quote.RemoveService("rooftop-pm"), Is.True);
            Assert.That(quote.Total, Is.EqualTo(0m));
        }
    }
}
