using UnityEngine;
using System.Text;

namespace Wise2.XR.HvacWorld
{
    public sealed class RooftopWorldBuilder
    {
        private readonly Material roof = Make(new Color(.16f, .18f, .19f));
        private readonly Material metal = Make(new Color(.20f, .23f, .24f));
        private readonly Material dark = Make(new Color(.015f, .035f, .045f));
        private readonly Material cyan = Make(new Color(.02f, .55f, .78f));
        private readonly Material green = Make(new Color(.12f, .72f, .16f));
        private TextMesh diagnosticText;
        private TextMesh dispatchText;

        public GameObject Build(Vector3 origin)
        {
            var root = new GameObject("WISE2 HVAC ROOFTOP COMMAND WORLD");
            root.transform.position = origin;
            Box(root.transform, "Commercial Roof Deck", new Vector3(0f, -.12f, 6f), new Vector3(14f, .22f, 16f), roof);
            BuildParapet(root.transform);
            BuildRtu(root.transform, "RTU-01", new Vector3(-3.6f, .75f, 5.1f));
            BuildRtu(root.transform, "RTU-02", new Vector3(0f, .75f, 7.2f));
            BuildRtu(root.transform, "RTU-03", new Vector3(3.6f, .75f, 5.1f));
            BuildPanels(root.transform);
            return root;
        }

        public void UpdateTelemetry(string state, string readings)
        {
            if (diagnosticText != null) diagnosticText.text = "LIVE DIAGNOSTICS\n" + state + "\n" + readings;
        }

        public void UpdateDispatch(string status, string job)
        {
            if (dispatchText != null) dispatchText.text = "DISPATCH / CRM\n" + status + "\n" + job;
        }

        private void BuildRtu(Transform parent, string name, Vector3 p)
        {
            var rtu = new GameObject(name); rtu.transform.SetParent(parent, false); rtu.transform.localPosition = p;
            Box(rtu.transform, "Cabinet", Vector3.zero, new Vector3(2.5f, 1.35f, 1.65f), metal);
            Box(rtu.transform, "Control Panel", new Vector3(0f, .05f, -.86f), new Vector3(1.05f, .9f, .06f), dark);
            Box(rtu.transform, "Supply Duct", new Vector3(0f, -.35f, 1.3f), new Vector3(1.2f, .65f, 1.0f), metal);
            Box(rtu.transform, "Disconnect", new Vector3(1.5f, .15f, -.5f), new Vector3(.32f, .55f, .22f), dark);
            Fan(rtu.transform, new Vector3(-.65f, .72f, 0f)); Fan(rtu.transform, new Vector3(.65f, .72f, 0f));
            Label(rtu.transform, name + "\nSELECT COMPONENT TO INSPECT", new Vector3(0f, 1.3f, -.3f), .075f);
        }

        private void BuildPanels(Transform parent)
        {
            diagnosticText = Panel(parent, "Diagnostics", new Vector3(-4.8f, 1.7f, 1.1f), "LIVE DIAGNOSTICS\nCONNECTING\nLOW / HIGH / DELTA-T");
            dispatchText = Panel(parent, "Dispatch CRM", new Vector3(0f, 1.7f, 1.0f), "DISPATCH / CRM\nTODAY'S JOBS\nWORK ORDERS · CLIENTS · EQUIPMENT");
            Panel(parent, "AI Assist", new Vector3(4.8f, 1.7f, 1.1f), "WISE2 AI / HERMES\nDIAGNOSE · EXPLAIN · DOCUMENT\nAPPROVAL REQUIRED FOR ACTIONS");
            Panel(parent, "Training", new Vector3(-4.8f, 1.65f, 9.9f), "TRAINING\nCOMPONENTS · DIAGNOSTICS\nMAINTENANCE · SAFETY");
            Panel(parent, "Pricing", new Vector3(4.8f, 1.65f, 9.9f), PricingText());
        }

        private static string PricingText()
        {
            var b = new StringBuilder("PRICE BOOK / QUOTE\n");
            foreach (var fee in RooftopWorldCatalog.ServiceFees) b.Append(fee.Label).Append("  $").Append(fee.Price).Append('\n');
            b.Append("ADD TO QUOTE · GENERATE · WORK ORDER");
            return b.ToString();
        }

        private TextMesh Panel(Transform parent, string name, Vector3 p, string text)
        {
            var panel = Box(parent, name, p, new Vector3(3.6f, 2.0f, .10f), dark);
            return Label(panel.transform, text, new Vector3(0f, 0f, -.07f), .065f);
        }

        private void BuildParapet(Transform p)
        {
            Box(p, "North Parapet", new Vector3(0f, .45f, 13.8f), new Vector3(14f, .9f, .22f), metal);
            Box(p, "South Parapet", new Vector3(0f, .45f, -1.8f), new Vector3(14f, .9f, .22f), metal);
            Box(p, "West Parapet", new Vector3(-6.9f, .45f, 6f), new Vector3(.22f, .9f, 15.8f), metal);
            Box(p, "East Parapet", new Vector3(6.9f, .45f, 6f), new Vector3(.22f, .9f, 15.8f), metal);
        }

        private void Fan(Transform parent, Vector3 p)
        {
            var fan = GameObject.CreatePrimitive(PrimitiveType.Cylinder); fan.name = "Condenser Fan"; fan.transform.SetParent(parent, false);
            fan.transform.localPosition = p; fan.transform.localScale = new Vector3(.48f, .05f, .48f); fan.GetComponent<Renderer>().material = dark;
        }

        private GameObject Box(Transform parent, string name, Vector3 p, Vector3 scale, Material material)
        {
            var go = GameObject.CreatePrimitive(PrimitiveType.Cube); go.name = name; go.transform.SetParent(parent, false); go.transform.localPosition = p; go.transform.localScale = scale; go.GetComponent<Renderer>().material = material; return go;
        }

        private static TextMesh Label(Transform parent, string text, Vector3 p, float size)
        {
            var go = new GameObject("Label"); go.transform.SetParent(parent, false); go.transform.localPosition = p; go.transform.localRotation = Quaternion.Euler(0f, 180f, 0f);
            var label = go.AddComponent<TextMesh>(); label.text = text; label.fontSize = 42; label.characterSize = size; label.anchor = TextAnchor.MiddleCenter; label.alignment = TextAlignment.Center; label.color = Color.white; return label;
        }

        private static Material Make(Color c) { var m = new Material(Shader.Find("Universal Render Pipeline/Lit") ?? Shader.Find("Standard")); m.color = c; return m; }
    }
}
