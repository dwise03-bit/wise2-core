/**
 * ExampleVRApp.cs
 * Complete production example of VR Workspace using Quest SDK
 *
 * This demonstrates:
 * - Hand gesture recognition
 * - Router integration
 * - Spatial object placement
 * - Spatial audio
 * - Error handling + graceful degradation
 */

using UnityEngine;
using UnityEngine.Networking;
using System.Collections;
using System.Collections.Generic;

public class ExampleVRApp : MonoBehaviour
{
    [SerializeField] private Transform cameraRig;
    [SerializeField] private string routerUrl = "http://localhost:3100";
    [SerializeField] private string apiKey = "sk-test";
    [SerializeField] private float maxObjectDistance = 10f;
    [SerializeField] private int maxConcurrentObjects = 5;

    private HandTracking handTracking;
    private SpatialAudio spatialAudio;
    private VRRenderer vrRenderer;

    private Queue<GameObject> spatialObjects = new();
    private string deviceId = "quest-device-001";
    private float battery = 100f;
    private int requestCount = 0;

    // Request debouncing (don't spam requests)
    private float lastGestureTime = 0f;
    private float gestureDebounceTime = 0.5f;

    void Start()
    {
        Debug.Log("[ExampleVRApp] Initializing VR Workspace...");

        // Get components
        handTracking = GetComponent<HandTracking>();
        spatialAudio = GetComponent<SpatialAudio>();
        vrRenderer = GetComponent<VRRenderer>();

        if (!handTracking || !spatialAudio || !vrRenderer)
        {
            Debug.LogError("[ExampleVRApp] Missing required components!");
            return;
        }

        Debug.Log("[ExampleVRApp] ✅ Initialization complete");
    }

    void Update()
    {
        // Update battery (simulation)
        battery -= Time.deltaTime * 0.001f; // 0.1% per 100 seconds
        if (battery < 0) battery = 0;

        // Check for gestures
        CheckForGestures();

        // Health monitor every 5 seconds
        if (Time.frameCount % 300 == 0)
        {
            LogHealth();
        }
    }

    /**
     * Check for hand gestures and route to handler
     */
    private void CheckForGestures()
    {
        string gesture = handTracking.GetCurrentGesture();

        // Debounce rapid gestures
        if (Time.time - lastGestureTime < gestureDebounceTime)
            return;

        if (gesture != "idle")
        {
            lastGestureTime = Time.time;
            HandleGesture(gesture);
        }
    }

    /**
     * Route gesture to appropriate handler
     */
    private void HandleGesture(string gesture)
    {
        Debug.Log($"[ExampleVRApp] Gesture detected: {gesture}");

        switch (gesture)
        {
            case "pinch":
                HandlePinch();
                break;
            case "grab":
                HandleGrab();
                break;
            case "point":
                HandlePoint();
                break;
            case "palm":
                HandlePalm();
                break;
        }
    }

    /**
     * PINCH: Ask AI a question about what you're looking at
     */
    private void HandlePinch()
    {
        Debug.Log("[ExampleVRApp] Pinch → Asking AI question...");

        // Get gaze direction
        Vector3 gazeDir = cameraRig.transform.forward;
        float distance = GetGazeDistance();
        string targetObject = "workspace";

        // Create request
        var request = new VRRequest
        {
            project_id = "vr-workspace",
            agent_id = "vr-assistant",
            user_id = deviceId,
            task_type = "vr-pinch-query",
            devices = new[] { new Device { type = "quest-meta", id = deviceId } },
            messages = new[] {
                new Message {
                    role = "user",
                    content = $"User pinched. Looking at {targetObject} {distance:F1}m away. " +
                              $"Battery: {battery:F0}%. What do you see?"
                }
            },
            route_mode = "AUTO",
            priority = "normal"
        };

        SendToRouter(request);
    }

    /**
     * GRAB: Select an object or confirm action
     */
    private void HandleGrab()
    {
        Debug.Log("[ExampleVRApp] Grab → Selecting object...");

        var request = new VRRequest
        {
            project_id = "vr-workspace",
            agent_id = "vr-assistant",
            user_id = deviceId,
            task_type = "vr-grab-select",
            devices = new[] { new Device { type = "quest-meta", id = deviceId } },
            messages = new[] {
                new Message {
                    role = "user",
                    content = "User performed grab gesture. Confirm selection and provide next action."
                }
            },
            route_mode = "AUTO",
            priority = "normal"
        };

        SendToRouter(request);
    }

    /**
     * POINT: Direct attention to area and get information
     */
    private void HandlePoint()
    {
        Debug.Log("[ExampleVRApp] Point → Requesting information...");

        Vector3 gazeDir = cameraRig.transform.forward;
        Vector3 pointPosition = cameraRig.transform.position + gazeDir * 2f;

        var request = new VRRequest
        {
            project_id = "vr-workspace",
            agent_id = "vr-assistant",
            user_id = deviceId,
            task_type = "vr-point-info",
            devices = new[] { new Device { type = "quest-meta", id = deviceId } },
            messages = new[] {
                new Message {
                    role = "user",
                    content = $"User pointing at position {pointPosition}. Provide information about that area."
                }
            },
            route_mode = "AUTO",
            priority = "normal"
        };

        SendToRouter(request);
    }

    /**
     * PALM: Cancel action or go back
     */
    private void HandlePalm()
    {
        Debug.Log("[ExampleVRApp] Palm → Cancel/Back...");

        // Clear all spatial objects
        while (spatialObjects.Count > 0)
        {
            GameObject obj = spatialObjects.Dequeue();
            Destroy(obj);
        }

        var request = new VRRequest
        {
            project_id = "vr-workspace",
            agent_id = "vr-assistant",
            user_id = deviceId,
            task_type = "vr-palm-cancel",
            devices = new[] { new Device { type = "quest-meta", id = deviceId } },
            messages = new[] {
                new Message {
                    role = "user",
                    content = "User cancelled current action. Go back to main menu."
                }
            },
            route_mode = "AUTO",
            priority = "normal"
        };

        SendToRouter(request);
    }

    /**
     * Send request to WISE² Router
     */
    private void SendToRouter(VRRequest request)
    {
        requestCount++;
        StartCoroutine(SendRequest(request));
    }

    private IEnumerator SendRequest(VRRequest request)
    {
        string json = JsonUtility.ToJson(request);
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(json);

        UnityWebRequest www = new UnityWebRequest($"{routerUrl}/api/generate", "POST");
        www.uploadHandler = new UploadHandlerRaw(bodyRaw);
        www.downloadHandler = new DownloadHandlerBuffer();
        www.SetRequestHeader("Content-Type", "application/json");
        www.SetRequestHeader("X-API-Key", apiKey);

        float startTime = Time.time;
        yield return www.SendWebRequest();
        float latency = (Time.time - startTime) * 1000f;

        if (www.result == UnityWebRequest.Result.Success)
        {
            string responseJson = www.downloadHandler.text;
            var response = JsonUtility.FromJson<RouterResponse>(responseJson);

            if (response != null)
            {
                Debug.Log($"[ExampleVRApp] ✅ Response received ({latency:F0}ms)");
                OnRouterSuccess(response);
            }
        }
        else
        {
            Debug.LogError($"[ExampleVRApp] ❌ Router request failed: {www.error}");
            OnRouterError(www.error);
        }

        www.Dispose();
    }

    /**
     * Handle successful router response
     */
    private void OnRouterSuccess(RouterResponse response)
    {
        // Limit spatial objects
        if (spatialObjects.Count >= maxConcurrentObjects)
        {
            GameObject oldObj = spatialObjects.Dequeue();
            Destroy(oldObj);
        }

        // Create spatial text
        GameObject textObj = CreateSpatialText(response.response);
        spatialObjects.Enqueue(textObj);

        // Play spatial audio if available
        if (!string.IsNullOrEmpty(response.audio_url))
        {
            Vector3 audioPos = textObj.transform.position;
            spatialAudio.PlaySpatialAudio(response.audio_url, audioPos, 5f);
        }

        // Auto-destroy after 5 seconds
        Destroy(textObj, 5f);
    }

    /**
     * Handle router error gracefully
     */
    private void OnRouterError(string error)
    {
        // Show error to user
        GameObject errorObj = CreateSpatialText($"⚠️ Error: {error}");
        spatialObjects.Enqueue(errorObj);
        Destroy(errorObj, 3f);

        // Log for debugging
        Debug.LogError($"[ExampleVRApp] Router error: {error}");
    }

    /**
     * Create 3D text in VR space
     */
    private GameObject CreateSpatialText(string text)
    {
        GameObject textObj = new GameObject("SpatialText");
        textObj.transform.position = cameraRig.transform.position + cameraRig.transform.forward * 2f;

        var textMesh = textObj.AddComponent<TextMesh>();
        textMesh.text = text;
        textMesh.fontSize = 40;
        textMesh.alignment = TextAlignment.Center;
        textMesh.color = new Color(0.2f, 0.8f, 1f); // Cyan

        var renderer = textObj.GetComponent<MeshRenderer>();
        renderer.material.color = textMesh.color;

        return textObj;
    }

    /**
     * Get distance to gaze direction intersection
     */
    private float GetGazeDistance()
    {
        RaycastHit hit;
        if (Physics.Raycast(cameraRig.transform.position, cameraRig.transform.forward, out hit, maxObjectDistance))
        {
            return hit.distance;
        }
        return maxObjectDistance;
    }

    /**
     * Log health metrics
     */
    private void LogHealth()
    {
        float fps = 1f / Time.deltaTime;
        int objectCount = spatialObjects.Count;

        Debug.Log($"[ExampleVRApp] Health: FPS={fps:F0}, Battery={battery:F1}%, Objects={objectCount}, Requests={requestCount}");
    }

    // Data structures
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
        public SpatialObject[] spatial_objects;
    }

    [System.Serializable] public class SpatialObject
    {
        public string type;
        public float[] position;
        public string data;
    }
}
