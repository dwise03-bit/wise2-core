using UnityEngine;
using System.Collections;
using System.Collections.Generic;

namespace Wise2.XR
{
    public sealed class XRCommandCenterRuntime : MonoBehaviour
    {
        private const int HvacStationIndex = 0;
        private const string HvacNodeId = "pocket-node-01";

        private Vector3 worldOffset;
        private readonly string[] stations = { "HVAC", "CRM", "CLOUD", "AI AGENTS", "SOUND LABS", "COMMS", "DIGITAL TWIN" };
        private readonly string[] states = { "DEMO", "DEMO", "NO TELEMETRY", "DEMO", "OFFLINE MIX", "UNAVAILABLE", "AWAITING LINK" };
        private readonly List<TextMesh> stationLabels = new List<TextMesh>();
        private readonly List<Renderer> stationRenderers = new List<Renderer>();
        private Wise2HvacApiClient hvacClient;
        private bool digitalTwinRequested;
        private bool wiseDefenseTrainingRequested;

        private void Start()
        {
            RenderSettings.ambientLight = new Color(.025f, .04f, .03f);
            CreateCamera();
            var view = Camera.main;
            if (view != null)
            {
                var forward = Vector3.ProjectOnPlane(view.transform.forward, Vector3.up).normalized;
                if (forward.sqrMagnitude < .01f) forward = Vector3.forward;
                worldOffset = view.transform.position + forward * 2.4f - new Vector3(0f, 1.6f, 1.8f);
                CreateClientHud(view.transform);
            }
            hvacClient = new Wise2HvacApiClient(Wise2Config.ApiBaseUrl, HvacNodeId, new OfflineDemoServices());
            CreateFloor(); CreateCore(); CreateStations(); CreateHvacWorld(); CreateVoiceMarker();
            UpdateHvacStation();
            StartCoroutine(PollHvacTelemetry());
        }

        private IEnumerator PollHvacTelemetry()
        {
            var wait = new WaitForSeconds(15f);
            while (true)
            {
                yield return hvacClient.Refresh();
                UpdateHvacStation();
                yield return wait;
            }
        }

        private void UpdateHvacStation()
        {
            if (hvacClient == null || stationLabels.Count <= HvacStationIndex) return;

            var snapshot = hvacClient.Latest;
            var state = snapshot.ParsedState;
            var readings = HvacStateMapper.ReadingSummary(snapshot.reading);
            var body = string.IsNullOrEmpty(readings) ? "SELECT TO INSPECT" : readings;
            stationLabels[HvacStationIndex].text = $"HVAC\n{HvacStateMapper.StatusLabel(state)}\n{body}";
            stationRenderers[HvacStationIndex].material.color = HvacStationColor(state);
        }

        private static Color HvacStationColor(HvacConnectionState state)
        {
            switch (state)
            {
                case HvacConnectionState.Connected: return new Color(.12f, .38f, .08f);
                case HvacConnectionState.Demo: return new Color(.02f, .09f, .055f);
                default: return new Color(.12f, .09f, .02f);
            }
        }

        private Vector3 Place(Vector3 position) => position + worldOffset;

        private void CreateClientHud(Transform cameraTransform)
        {
            var hud = GameObject.CreatePrimitive(PrimitiveType.Cube);
            hud.name = "SOUND LABS CLIENT HUD";
            hud.transform.SetParent(cameraTransform, false);
            hud.transform.localPosition = new Vector3(0f, .05f, -1.8f);
            hud.transform.localRotation = Quaternion.identity;
            hud.transform.localScale = new Vector3(1.8f, .85f, .04f);
            Destroy(hud.GetComponent<Collider>());
            hud.GetComponent<Renderer>().material = Material(new Color(.015f, .08f, .045f));
            Label(hud.transform, "WISE² SOUND LABS\nOFFLINE MIX · QUEST CLIENT READY", new Vector3(0f, 0f, -.03f), .1f);
        }

        public void OpenDigitalTwin()
        {
            digitalTwinRequested = true;
            if (stationLabels.Count == 0) return;

            var index = stations.Length - 1;
            stationLabels[index].text = "DIGITAL TWIN\nSESSION LINKED\nOPENED FROM WISE2.NET";
            stationRenderers[index].material.color = new Color(.12f, .38f, .08f);
            Debug.Log("WISE² XR: Digital Twin context opened from wise2.net.");
        }

        public void OpenWiseDefenseTraining()
        {
            wiseDefenseTrainingRequested = true;
            if (stationLabels.Count == 0) return;

            var index = stations.Length - 1;
            stationLabels[index].text = "WISE DEFENSE\nVR TRAINING\nTIMER LINK READY";
            stationRenderers[index].material.color = new Color(.18f, .42f, .08f);
            Debug.Log("WISE² XR: Wise Defense training context opened from wisedefensellc.com.");
        }

        private static void CreateCamera()
        {
            var cameraObject = Camera.main != null ? Camera.main.gameObject : new GameObject("XR Main Camera");
            cameraObject.tag = "MainCamera";
            var camera = cameraObject.GetComponent<Camera>() ?? cameraObject.AddComponent<Camera>();
            camera.stereoTargetEye = StereoTargetEyeMask.Both;
            camera.cullingMask = ~0;
            camera.enabled = true;
            camera.allowHDR = false;
            camera.allowMSAA = true;
            camera.enabled = true;
            camera.cullingMask = -1;
            camera.depth = 0f;
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(.005f, .012f, .02f);
            camera.fieldOfView = 70f;
            camera.nearClipPlane = .05f;
            camera.farClipPlane = 100f;
        }

        private void CreateFloor()
        {
            var floor = GameObject.CreatePrimitive(PrimitiveType.Plane); floor.name = "MR reference floor"; floor.transform.position = Place(Vector3.zero); floor.transform.localScale = Vector3.one * 4f;
            Destroy(floor.GetComponent<Collider>());
            floor.GetComponent<Renderer>().material = Material(new Color(.01f, .025f, .018f));
        }

        private void CreateCore()
        {
            var core = GameObject.CreatePrimitive(PrimitiveType.Sphere); core.name = "W² AI CORE"; core.transform.position = Place(new Vector3(0f, 1.65f, 1.8f)); core.transform.localScale = Vector3.one * .42f;
            Destroy(core.GetComponent<Collider>());
            core.GetComponent<Renderer>().material = Material(new Color(.15f, .8f, .08f)); Label(core.transform, "W²\nAI CORE\nREADY · VOICE ONLINE", new Vector3(0f, -.62f, 0f), .12f);
        }

        private void CreateStations()
        {
            for (var i = 0; i < stations.Length; i++)
            {
                var panel = GameObject.CreatePrimitive(PrimitiveType.Cube); panel.name = stations[i]; Destroy(panel.GetComponent<Collider>()); var row = i / 3; var col = i % 3;
                panel.transform.position = Place(new Vector3((col - 1) * 1.25f, 1.45f - row * .9f, 1.7f)); panel.transform.localScale = new Vector3(1.05f, .64f, .08f);
                var renderer = panel.GetComponent<Renderer>();
                renderer.material = Material(new Color(.02f, .09f, .055f));
                stationRenderers.Add(renderer);
                stationLabels.Add(Label(panel.transform, stations[i] + "\n" + states[i] + "\nSELECT TO INSPECT", new Vector3(0f, -.02f, -.02f), .1f));
            }

            if (wiseDefenseTrainingRequested) OpenWiseDefenseTraining();
            else if (digitalTwinRequested) OpenDigitalTwin();
        }

        private void CreateVoiceMarker()
        {
            var voice = new GameObject("WISE² AI Voice"); voice.transform.position = Place(new Vector3(0f, .35f, 1.7f)); Label(voice.transform, "WISE² AI VOICE\nSAY: OPEN SOUND LABS  ·  SHOW TODAY'S HVAC CALLS  ·  OPEN CRM  ·  GO HOME", Vector3.zero, .085f);
        }

        private void CreateHvacWorld()
        {
            var room = new GameObject("WISE² HVAC DIAGNOSTIC WORLD");
            room.transform.position = new Vector3(0f, 0f, -4.2f);

            var header = GameObject.CreatePrimitive(PrimitiveType.Cube);
            header.name = "HVAC telemetry header";
            header.transform.SetParent(room.transform);
            header.transform.localPosition = new Vector3(0f, 2.45f, 0f);
            header.transform.localScale = new Vector3(5.8f, .08f, .08f);
            header.GetComponent<Renderer>().material = Material(new Color(.05f, .9f, .45f));
            Label(header.transform, "WISE² HVAC SOLUTIONS  ·  CIRCUIT 01  ·  BLE TOOLS ONLINE", new Vector3(0f, .12f, 0f), .10f);

            CreateGauge(room.transform, "LOW SIDE\n118.0 psig", new Vector3(-1.8f, 1.6f, 0f), new Color(0f, .69f, 1f));
            CreateGauge(room.transform, "HIGH SIDE\n300.0 psig", new Vector3(0f, 1.6f, 0f), new Color(1f, .34f, .13f));
            CreateGauge(room.transform, "AIR DELTA-T\n15.0 °F", new Vector3(1.8f, 1.6f, 0f), new Color(0f, .9f, .46f));

            var assessment = GameObject.CreatePrimitive(PrimitiveType.Cube);
            assessment.name = "IMP assessment panel";
            assessment.transform.SetParent(room.transform);
            assessment.transform.localPosition = new Vector3(0f, .35f, .02f);
            assessment.transform.localScale = new Vector3(4.8f, .85f, .06f);
            assessment.GetComponent<Renderer>().material = Material(new Color(.025f, .10f, .07f));
            Label(assessment.transform, "WISE² IMP SYSTEM ASSESSMENT\nAIRFLOW OR CHARGE ISSUE  ·  82% CONFIDENCE\nVERIFY FILTER / BLOWER  ·  CONFIRM CHARGE PROCEDURE", new Vector3(0f, 0f, -.04f), .085f);
        }

        private void CreateGauge(Transform parent, string value, Vector3 position, Color color)
        {
            var gauge = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            gauge.name = "HVAC digital gauge";
            gauge.transform.SetParent(parent);
            gauge.transform.localPosition = position;
            gauge.transform.localRotation = Quaternion.Euler(90f, 0f, 0f);
            gauge.transform.localScale = new Vector3(.75f, .05f, .75f);
            gauge.GetComponent<Renderer>().material = Material(new Color(.015f, .04f, .035f));
            var ring = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            ring.transform.SetParent(parent);
            ring.transform.localPosition = position + new Vector3(0f, 0f, -.05f);
            ring.transform.localRotation = Quaternion.Euler(90f, 0f, 0f);
            ring.transform.localScale = new Vector3(.43f, .02f, .43f);
            ring.GetComponent<Renderer>().material = Material(color);
            Label(gauge.transform, value, new Vector3(0f, 0f, -.08f), .10f);
        }

        private static TextMesh Label(Transform parent, string value, Vector3 position, float size)
        {
            var obj = new GameObject("Label"); obj.transform.SetParent(parent); obj.transform.localPosition = position; obj.transform.localRotation = Quaternion.identity;
            var text = obj.AddComponent<TextMesh>(); text.text = value; text.fontSize = 48; text.characterSize = size; text.anchor = TextAnchor.MiddleCenter; text.alignment = TextAlignment.Center; text.color = new Color(.72f, 1f, .4f);
            return text;
        }

        private static Material Material(Color color)
        {
            var shader = Shader.Find("Universal Render Pipeline/Unlit") ?? Shader.Find("Standard") ?? Shader.Find("Unlit/Color") ?? Shader.Find("UI/Default") ?? Shader.Find("Sprites/Default");
            if (shader == null) return null;
            return new Material(shader) { color = color };
        }
    }
}
