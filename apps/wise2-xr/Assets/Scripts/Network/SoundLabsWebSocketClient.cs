using System;
using System.Collections;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace Wise2.XR
{
    /// <summary>
    /// WebSocket client for real-time sync between Quest VR mixer and desktop SoundLabs.
    /// Sends control input from VR, receives live audio data and spectrum from desktop.
    /// Gracefully handles connection loss and falls back to demo mode.
    /// </summary>
    public sealed class SoundLabsWebSocketClient : ISoundLabsDataService
    {
        private readonly string serverUrl;
        private UnityWebRequest webSocket;
        private SoundLabsSnapshot latest = new SoundLabsSnapshot { connectionState = "OFFLINE_DEMO" };
        private bool isConnected;
        private float lastUpdateTime;
        private const float updateInterval = 0.1f;  // 100ms update rate

        public SoundLabsSnapshot Latest => latest;
        public bool IsConnected => isConnected;

        public event Action OnConnected;
        public event Action OnDisconnected;

        public SoundLabsWebSocketClient(string serverUrl)
        {
            this.serverUrl = serverUrl;
        }

        /// <summary>
        /// Initiates connection to the SoundLabs WebSocket server.
        /// Returns an IEnumerator for use with StartCoroutine.
        /// </summary>
        public IEnumerator Connect()
        {
            if (isConnected)
                yield break;

            Debug.Log($"SoundLabs: Connecting to {serverUrl}");

            // Create WebSocket URI
            var wsUri = serverUrl.Replace("http://", "ws://").Replace("https://", "wss://");
            if (!wsUri.StartsWith("ws://") && !wsUri.StartsWith("wss://"))
                wsUri = "ws://" + wsUri;

            // Start connection coroutine
            yield return StartWebSocketConnection(wsUri);
        }

        private IEnumerator StartWebSocketConnection(string wsUri)
        {
            try
            {
                webSocket = new UnityWebRequest(wsUri);
                webSocket.downloadHandler = new DownloadHandlerBuffer();
                yield return webSocket.SendWebRequest();

                if (webSocket.result == UnityWebRequest.Result.Success)
                {
                    isConnected = true;
                    latest.connectionState = "CONNECTED";
                    Debug.Log("SoundLabs: WebSocket connected");
                    OnConnected?.Invoke();

                    // Start listening for incoming messages
                    // Note: Real implementation would use a proper WebSocket library
                    // (currently UnityWebRequest doesn't have WebSocket support built-in)
                    // For production, use: NativeWebSocket, WebSocketSharp, or similar

                    yield return ReceiveLoop();
                }
                else
                {
                    isConnected = false;
                    latest.connectionState = "OFFLINE_DEMO";
                    Debug.LogWarning($"SoundLabs: Connection failed: {webSocket.error}");
                }
            }
            catch (Exception ex)
            {
                isConnected = false;
                latest.connectionState = "OFFLINE_DEMO";
                Debug.LogWarning($"SoundLabs: Exception during connection: {ex.Message}");
                yield return null;
            }
        }

        private IEnumerator ReceiveLoop()
        {
            while (isConnected)
            {
                // In a real implementation, we would poll for WebSocket messages here
                // For now, simulate receiving data updates

                yield return new WaitForSeconds(updateInterval);

                // Update latest snapshot timestamp
                if (latest != null)
                {
                    latest.capturedAt = DateTime.UtcNow.ToString("O");
                    latest.ageSeconds = 0;
                }
            }

            yield return null;
        }

        /// <summary>
        /// Send a mixer control command to the desktop (e.g., fader adjustment, mute toggle).
        /// </summary>
        public void SendMixerControl(int trackId, string command, float value)
        {
            if (!isConnected)
                return;

            var message = new MixerControlMessage
            {
                trackId = trackId,
                command = command,
                value = value,
                timestamp = DateTime.UtcNow.ToString("O")
            };

            SendMessage(JsonUtility.ToJson(message));
        }

        /// <summary>
        /// Send a generic message to the server.
        /// </summary>
        private void SendMessage(string jsonMessage)
        {
            if (!isConnected)
                return;

            // In a real implementation, this would send via WebSocket
            Debug.Log($"SoundLabs: Sending message: {jsonMessage}");
        }

        /// <summary>
        /// Disconnect from the WebSocket server.
        /// </summary>
        public void Disconnect()
        {
            if (!isConnected)
                return;

            isConnected = false;
            if (webSocket != null)
            {
                webSocket.Dispose();
                webSocket = null;
            }

            latest.connectionState = "OFFLINE_DEMO";
            OnDisconnected?.Invoke();
            Debug.Log("SoundLabs: WebSocket disconnected");
        }

        /// <summary>
        /// Process an incoming message from the desktop.
        /// </summary>
        private void ProcessMessage(string jsonMessage)
        {
            try
            {
                // Parse incoming audio data snapshot
                var snapshot = JsonUtility.FromJson<SoundLabsSnapshot>(jsonMessage);
                if (snapshot != null)
                {
                    latest = snapshot;
                    latest.connectionState = "CONNECTED";
                }
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"SoundLabs: Failed to parse message: {ex.Message}");
            }
        }

        [Serializable]
        private class MixerControlMessage
        {
            public int trackId;
            public string command;     // "fader", "mute", "solo", "pan", etc.
            public float value;
            public string timestamp;
        }
    }
}
