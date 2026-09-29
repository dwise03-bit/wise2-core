/**
 * VREnvironment.cs
 * Main VR workspace scene controller for Meta Quest
 */

using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Collections.Generic;

public class VREnvironment : MonoBehaviour
{
    [SerializeField] private GameObject workspaceRoot;
    [SerializeField] private GameObject cameraRig;
    [SerializeField] private float interactionDistance = 5f;
    [SerializeField] private string routerUrl = "http://localhost:3100";
    [SerializeField] private string apiKey = "sk-test";

    private HandTracking handTracking;
    private SpatialAudio spatialAudio;
    private VRRenderer vrRenderer;
    private List<GameObject> spatialObjects = new();
    private string deviceId = "quest-device-001";
    private float battery = 85f;

    void Start()
    {
        InitializeEnvironment();
        InitializeComponents();
        StartCoroutine(HealthCheck());
    }

    void Update()
    {
        UpdateBattery();
        HandleGestureInput();
    }

    /**
     * Initialize VR environment
     */
    private void InitializeEnvironment()
    {
        // Create workspace root if not assigned
        if (workspaceRoot == null)
        {
            workspaceRoot = new GameObject("WorkspaceRoot");
            workspaceRoot.transform.parent = transform;
        }

        // Create basic environment
        CreateEnvironmentMesh();
        CreateLighting();
    }

    /**
     * Initialize component controllers
     */
    private void InitializeComponents()
    {
        // Get or add components
        handTracking = GetComponent<HandTracking>() ?? gameObject.AddComponent<HandTracking>();
        spatialAudio = GetComponent<SpatialAudio>() ?? gameObject.AddComponent<SpatialAudio>();
        vrRenderer = GetComponent<VRRenderer>() ?? gameObject.AddComponent<VRRenderer>();

        // Initialize
        handTracking.Initialize();
        spatialAudio.Initialize();
        vrRenderer.Initialize();
    }

    /**
     * Create basic environment mesh (placeholder)
     */
    private void CreateEnvironmentMesh()
    {
        // Create a simple floor
        GameObject floor = GameObject.CreatePrimitive(PrimitiveType.Plane);
        floor.transform.parent = workspaceRoot.transform;
        floor.transform.localScale = new Vector3(10, 1, 10);
        floor.transform.position = new Vector3(0, -1.5f, 0);

        // Create back wall
        GameObject wall = GameObject.CreatePrimitive(PrimitiveType.Cube);
        wall.transform.parent = workspaceRoot.transform;
        wall.transform.position = new Vector3(0, 0, -5);
        wall.transform.localScale = new Vector3(10, 3, 0.1f);

        Debug.Log("[VREnvironment] Basic environment created");
    }

    /**
     * Create workspace lighting
     */
    private void CreateLighting()
    {
        // Main light
        GameObject lightObj = new GameObject("MainLight");
        Light light = lightObj.AddComponent<Light>();
        light.type = LightType.Directional;
        light.intensity = 1.2f;
        lightObj.transform.rotation = Quaternion.Euler(50, -30, 0);
        lightObj.transform.parent = workspaceRoot.transform;

        // Ambient light
        RenderSettings.ambientLight = new Color(0.3f, 0.3f, 0.3f);
    }

    /**
     * Handle user gesture input
     */
    private void HandleGestureInput()
    {
        if (!handTracking) return;

        // Get current gesture
        string gesture = handTracking.GetCurrentGesture();
        if (gesture != "idle")
        {
            HandleGesture(gesture);
        }
    }

    /**
     * Process gesture and send to router
     */
    private void HandleGesture(string gesture)
    {
        Debug.Log($"[VREnvironment] Processing gesture: {gesture}");

        // Get gaze direction
        RaycastHit hit;
        Vector3 gazeDirection = cameraRig.transform.forward;
        float gazeDistance = 2f;
        string targetObject = "workspace";

        if (Physics.Raycast(cameraRig.transform.position, gazeDirection, out hit, interactionDistance))
        {
            gazeDistance = hit.distance;
            targetObject = hit.collider.gameObject.name;
        }

        // Create request
        var request = new VRRequest
        {
            project_id = "vr-workspace",
            agent_id = "vr-assistant",
            user_id = deviceId,
            task_type = "vr-interaction",
            devices = new[] { new Device { type = "quest-meta", id = deviceId } },
            messages = new[] { new Message {
                role = "user",
                content = $"VR User gesture: {gesture}. Looking at: {targetObject}. Distance: {gazeDistance:F1}m. Battery: {battery:F0}%"
            }},
            route_mode = "AUTO",
            priority = "normal"
        };

        // Send to router
        StartCoroutine(SendToRouter(request));
    }

    /**
     * Send request to WISE² Router
     */
    private IEnumerator SendToRouter(VRRequest request)
    {
        string json = JsonUtility.ToJson(request);
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(json);

        UnityWebRequest www = new UnityWebRequest($"{routerUrl}/api/generate", "POST");
        www.uploadHandler = new UploadHandlerRaw(bodyRaw);
        www.downloadHandler = new DownloadHandlerBuffer();
        www.SetRequestHeader("Content-Type", "application/json");
        www.SetRequestHeader("X-API-Key", apiKey);

        yield return www.SendWebRequest();

        if (www.result == UnityWebRequest.Result.Success)
        {
            string responseJson = www.downloadHandler.text;
            var response = JsonUtility.FromJson<RouterResponse>(responseJson);

            if (response != null)
            {
                OnRouterResponse(response);
            }
        }
        else
        {
            Debug.LogError($"[VREnvironment] Router request failed: {www.error}");
        }
    }

    /**
     * Handle router response
     */
    private void OnRouterResponse(RouterResponse response)
    {
        Debug.Log($"[VREnvironment] Router response: {response.response}");

        // Create spatial text object
        GameObject textObject = CreateSpatialText(response.response);
        spatialObjects.Add(textObject);

        // Play spatial audio if available
        if (!string.IsNullOrEmpty(response.audio_url))
        {
            StartCoroutine(PlaySpatialAudio(response.audio_url, textObject.transform.position));
        }

        // Auto-destroy after 5 seconds
        Destroy(textObject, 5f);
    }

    /**
     * Create 3D text object in VR space
     */
    private GameObject CreateSpatialText(string text)
    {
        // Create text mesh
        GameObject textObj = new GameObject("SpatialText");
        textObj.transform.position = cameraRig.transform.position + cameraRig.transform.forward * 2;

        // Add text mesh pro component (simplified)
        var textMesh = textObj.AddComponent<TextMesh>();
        textMesh.text = text;
        textMesh.fontSize = 40;
        textMesh.alignment = TextAlignment.Center;
        textMesh.color = new Color(0.2f, 0.8f, 1f); // Cyan

        return textObj;
    }

    /**
     * Play spatial audio at position
     */
    private IEnumerator PlaySpatialAudio(string audioUrl, Vector3 position)
    {
        // Create audio source
        GameObject audioObj = new GameObject("SpatialAudio");
        audioObj.transform.position = position;
        AudioSource audioSource = audioObj.AddComponent<AudioSource>();
        audioSource.spatialBlend = 1f; // 3D audio
        audioSource.maxDistance = 20f;
        audioSource.minDistance = 0.5f;

        // Load audio clip (placeholder)
        Debug.Log($"[VREnvironment] Playing audio from: {audioUrl}");
        // In production: use UnityWebRequestMultimedia.GetAudioClip()

        yield return new WaitForSeconds(5f);
        Destroy(audioObj);
    }

    /**
     * Update battery simulation
     */
    private void UpdateBattery()
    {
        // Simulate battery drain (0.1% per second)
        battery -= Time.deltaTime * 0.0001f;
        if (battery < 0) battery = 0;
    }

    /**
     * Periodic health check
     */
    private IEnumerator HealthCheck()
    {
        while (true)
        {
            Debug.Log($"[VREnvironment] Health: FPS={1f / Time.deltaTime:F0}, Battery={battery:F1}%, Objects={spatialObjects.Count}");
            yield return new WaitForSeconds(5f);
        }
    }

    // Request/Response data structures
    [System.Serializable] public class VRRequest
    {
        public string project_id;
        public string agent_id;
        public string user_id;
        public string task_type;
        public Device[] devices;
        public Message[] messages;
        public string route_mode;
        public string priority;
    }

    [System.Serializable] public class Device
    {
        public string type;
        public string id;
    }

    [System.Serializable] public class Message
    {
        public string role;
        public string content;
    }

    [System.Serializable] public class RouterResponse
    {
        public string response;
        public string audio_url;
        public SpatialObjectData[] spatial_objects;
    }

    [System.Serializable] public class SpatialObjectData
    {
        public string type;
        public float[] position;
        public string data;
    }
}
