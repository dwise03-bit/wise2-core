using UnityEngine;

namespace Wise2.XR
{
    public sealed class XRCommandCenterRuntime : MonoBehaviour
    {
        private readonly string[] stations = { "HVAC", "CRM", "CLOUD", "AI AGENTS", "CLIENT COMMAND", "COMMS" };
        private readonly string[] states = { "DEMO", "DEMO", "NO TELEMETRY", "DEMO", "DEMO", "UNAVAILABLE" };

        private void Start()
        {
            RenderSettings.ambientLight = new Color(.025f, .04f, .03f);
            CreateFloor(); CreateCore(); CreateStations(); CreateVoiceMarker();
        }

        private void CreateFloor()
        {
            var floor = GameObject.CreatePrimitive(PrimitiveType.Plane); floor.name = "MR reference floor"; floor.transform.localScale = Vector3.one * 4f;
            floor.GetComponent<Renderer>().material = Material(new Color(.01f, .025f, .018f));
        }

        private void CreateCore()
        {
            var core = GameObject.CreatePrimitive(PrimitiveType.Sphere); core.name = "W² AI CORE"; core.transform.position = new Vector3(0f, 1.65f, 2.4f); core.transform.localScale = Vector3.one * .42f;
            core.GetComponent<Renderer>().material = Material(new Color(.15f, .8f, .08f)); Label(core.transform, "W²\nAI CORE\nREADY · VOICE ONLINE", new Vector3(0f, -.62f, 0f), .12f);
        }

        private void CreateStations()
        {
            for (var i = 0; i < stations.Length; i++)
            {
                var panel = GameObject.CreatePrimitive(PrimitiveType.Quad); panel.name = stations[i]; var row = i / 3; var col = i % 3;
                panel.transform.position = new Vector3((col - 1) * 1.25f, 1.45f - row * .9f, 2.3f); panel.transform.localScale = new Vector3(1.05f, .64f, 1f);
                panel.GetComponent<Renderer>().material = Material(new Color(.02f, .09f, .055f)); Label(panel.transform, stations[i] + "\n" + states[i] + "\nSELECT TO INSPECT", new Vector3(0f, -.02f, -.02f), .1f);
            }
        }

        private void CreateVoiceMarker()
        {
            var voice = new GameObject("WISE² AI Voice"); voice.transform.position = new Vector3(0f, .35f, 2.3f); Label(voice.transform, "WISE² AI VOICE\nSAY: SHOW TODAY'S HVAC CALLS  ·  OPEN CRM  ·  GO HOME", Vector3.zero, .085f);
        }

        private static void Label(Transform parent, string value, Vector3 position, float size)
        {
            var obj = new GameObject("Label"); obj.transform.SetParent(parent); obj.transform.localPosition = position; obj.transform.localRotation = Quaternion.identity;
            var text = obj.AddComponent<TextMesh>(); text.text = value; text.fontSize = 48; text.characterSize = size; text.anchor = TextAnchor.MiddleCenter; text.alignment = TextAlignment.Center; text.color = new Color(.72f, 1f, .4f);
        }

        private static Material Material(Color color) => new Material(Shader.Find("Unlit/Color")) { color = color };
    }
}
