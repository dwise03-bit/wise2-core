using System.Collections.Generic;
using System.Linq;

namespace Wise2.XR.HvacWorld
{
    public sealed class RooftopQuoteState
    {
        private readonly HashSet<string> selected = new HashSet<string>();
        public IReadOnlyCollection<string> Selected => selected;

        public bool AddService(string id)
        {
            if (!RooftopWorldCatalog.ServiceFees.Any(x => x.Id == id)) return false;
            return selected.Add(id);
        }

        public bool RemoveService(string id) => selected.Remove(id);

        public decimal Total => RooftopWorldCatalog.ServiceFees
            .Where(x => selected.Contains(x.Id))
            .Sum(x => x.Price);
    }
}
