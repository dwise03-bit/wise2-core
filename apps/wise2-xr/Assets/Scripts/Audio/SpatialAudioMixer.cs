using System;
using System.Collections.Generic;
using UnityEngine;

namespace Wise2.XR
{
    /// <summary>
    /// Creates and manages the 3D spatial audio mixing console in VR.
    /// Renders 8-track mixer with faders, level meters, and real-time spectrum visualization.
    /// Responds to hand gesture input for mixing controls.
    /// </summary>
    public sealed class SpatialAudioMixer : MonoBehaviour
    {
        [SerializeField] private Material faderMaterial;
        [SerializeField] private Material meterMaterial;
        [SerializeField] private Material spectrumMaterial;

        private GameObject mixerConsole;
        private List<TrackMixer> trackMixers = new List<TrackMixer>();
        private MasterMixer masterMixer;
        private SpectrumAnalyzer spectrumAnalyzer;
        private ISoundLabsDataService audioService;
        private HandGestureDetector gestureDetector;
        private int selectedTrackIndex = -1;

        private class TrackMixer
        {
            public int trackId;
            public string trackName;
            public GameObject faderKnob;
            public GameObject levelMeter;
            public GameObject soloButton;
            public GameObject muteButton;
            public float currentLevel;
            public bool isSelected;
        }

        private class MasterMixer
        {
            public GameObject faderKnob;
            public GameObject levelMeter;
            public GameObject peakIndicator;
            public float currentLevel;
        }

        private class SpectrumAnalyzer
        {
            public GameObject visualizer;
            public List<GameObject> bands = new List<GameObject>();
        }

        public void Initialize(ISoundLabsDataService audioService)
        {
            this.audioService = audioService;
            gestureDetector = FindFirstObjectByType<HandGestureDetector>();

            CreateMixerConsole();
            CreateTrackChannels();
            CreateMasterChannel();
            CreateSpectrumVisualizer();

            if (gestureDetector != null)
            {
                gestureDetector.OnGestureDetected += OnGestureDetected;
            }
        }

        private void CreateMixerConsole()
        {
            // Create main console base (large flat panel in front of user)
            mixerConsole = new GameObject("SOUND LABS MIXER CONSOLE");
            mixerConsole.transform.position = new Vector3(0f, 0.6f, -2f);
            mixerConsole.transform.rotation = Quaternion.identity;

            var consoleBase = GameObject.CreatePrimitive(PrimitiveType.Cube);
            consoleBase.name = "Console Base";
            consoleBase.transform.SetParent(mixerConsole.transform);
            consoleBase.transform.localPosition = Vector3.zero;
            consoleBase.transform.localScale = new Vector3(3.2f, 0.8f, 0.6f);
            Destroy(consoleBase.GetComponent<Collider>());

            var renderer = consoleBase.GetComponent<Renderer>();
            renderer.material = new Material(Shader.Find("Standard"));
            renderer.material.color = new Color(0.02f, 0.08f, 0.06f);

            // Console header label
            var header = new GameObject("Header");
            header.transform.SetParent(mixerConsole.transform);
            header.transform.localPosition = new Vector3(0f, 0.45f, -0.35f);
            var headerText = header.AddComponent<TextMesh>();
            headerText.text = "WISE² SOUND LABS · 8-TRACK MIXER · QUEST VR";
            headerText.fontSize = 24;
            headerText.characterSize = 0.01f;
            headerText.anchor = TextAnchor.MiddleCenter;
            headerText.alignment = TextAlignment.Center;
            headerText.color = new Color(0.72f, 1f, 0.4f);
        }

        private void CreateTrackChannels()
        {
            // Create 8 track channels in a row
            for (int i = 0; i < 8; i++)
            {
                var mixer = new TrackMixer { trackId = i + 1, trackName = $"Track {i + 1}", currentLevel = 0.5f };

                // Track channel base
                var trackBase = GameObject.CreatePrimitive(PrimitiveType.Cube);
                trackBase.name = $"Track {i + 1}";
                trackBase.transform.SetParent(mixerConsole.transform);
                var xPos = (i - 3.5f) * 0.35f;
                trackBase.transform.localPosition = new Vector3(xPos, -0.15f, 0f);
                trackBase.transform.localScale = new Vector3(0.28f, 0.5f, 0.4f);
                Destroy(trackBase.GetComponent<Collider>());

                var trackRenderer = trackBase.GetComponent<Renderer>();
                trackRenderer.material = new Material(Shader.Find("Standard"));
                trackRenderer.material.color = new Color(0.04f, 0.12f, 0.08f);

                // Fader knob (vertical slider)
                var faderKnob = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
                faderKnob.name = $"Fader {i + 1}";
                faderKnob.transform.SetParent(trackBase.transform);
                faderKnob.transform.localPosition = new Vector3(0f, mixer.currentLevel * 0.35f - 0.175f, 0.15f);
                faderKnob.transform.localRotation = Quaternion.Euler(90f, 0f, 0f);
                faderKnob.transform.localScale = new Vector3(0.08f, 0.05f, 0.08f);
                Destroy(faderKnob.GetComponent<Collider>());

                var faderRenderer = faderKnob.GetComponent<Renderer>();
                faderRenderer.material = new Material(Shader.Find("Standard"));
                faderRenderer.material.color = new Color(0.22f, 0.8f, 0.15f);

                mixer.faderKnob = faderKnob;

                // Level meter (vertical bar showing current level)
                var levelMeter = GameObject.CreatePrimitive(PrimitiveType.Cube);
                levelMeter.name = $"Meter {i + 1}";
                levelMeter.transform.SetParent(trackBase.transform);
                levelMeter.transform.localPosition = new Vector3(0.1f, (mixer.currentLevel - 0.5f) * 0.35f, 0f);
                levelMeter.transform.localScale = new Vector3(0.04f, mixer.currentLevel * 0.4f, 0.3f);
                Destroy(levelMeter.GetComponent<Collider>());

                var meterRenderer = levelMeter.GetComponent<Renderer>();
                meterRenderer.material = new Material(Shader.Find("Standard"));
                meterRenderer.material.color = new Color(0f, 0.7f, 0.3f);

                mixer.levelMeter = levelMeter;

                // Track name label
                var nameLabel = new GameObject("Label");
                nameLabel.transform.SetParent(trackBase.transform);
                nameLabel.transform.localPosition = new Vector3(0f, -0.25f, 0.2f);
                var nameText = nameLabel.AddComponent<TextMesh>();
                nameText.text = mixer.trackName;
                nameText.fontSize = 16;
                nameText.characterSize = 0.008f;
                nameText.anchor = TextAnchor.MiddleCenter;
                nameText.alignment = TextAlignment.Center;
                nameText.color = new Color(0.72f, 1f, 0.4f);

                trackMixers.Add(mixer);
            }
        }

        private void CreateMasterChannel()
        {
            masterMixer = new MasterMixer { currentLevel = 0.85f };

            // Master channel (larger, to the right)
            var masterBase = GameObject.CreatePrimitive(PrimitiveType.Cube);
            masterBase.name = "Master Channel";
            masterBase.transform.SetParent(mixerConsole.transform);
            masterBase.transform.localPosition = new Vector3(1.5f, -0.15f, 0f);
            masterBase.transform.localScale = new Vector3(0.35f, 0.5f, 0.4f);
            Destroy(masterBase.GetComponent<Collider>());

            var masterRenderer = masterBase.GetComponent<Renderer>();
            masterRenderer.material = new Material(Shader.Find("Standard"));
            masterRenderer.material.color = new Color(0.08f, 0.15f, 0.1f);

            // Master fader
            var masterFader = GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            masterFader.name = "Master Fader";
            masterFader.transform.SetParent(masterBase.transform);
            masterFader.transform.localPosition = new Vector3(0f, masterMixer.currentLevel * 0.35f - 0.175f, 0.15f);
            masterFader.transform.localRotation = Quaternion.Euler(90f, 0f, 0f);
            masterFader.transform.localScale = new Vector3(0.1f, 0.06f, 0.1f);
            Destroy(masterFader.GetComponent<Collider>());

            var faderRenderer = masterFader.GetComponent<Renderer>();
            faderRenderer.material = new Material(Shader.Find("Standard"));
            faderRenderer.material.color = new Color(0.92f, 0.3f, 0.08f);

            masterMixer.faderKnob = masterFader;

            // Master label
            var masterLabel = new GameObject("Label");
            masterLabel.transform.SetParent(masterBase.transform);
            masterLabel.transform.localPosition = new Vector3(0f, 0.3f, 0.2f);
            var masterText = masterLabel.AddComponent<TextMesh>();
            masterText.text = "MASTER";
            masterText.fontSize = 18;
            masterText.characterSize = 0.009f;
            masterText.anchor = TextAnchor.MiddleCenter;
            masterText.alignment = TextAlignment.Center;
            masterText.color = new Color(0.72f, 1f, 0.4f);

            // Peak indicator
            var peakIndicator = GameObject.CreatePrimitive(PrimitiveType.Cube);
            peakIndicator.name = "Peak Indicator";
            peakIndicator.transform.SetParent(masterBase.transform);
            peakIndicator.transform.localPosition = new Vector3(0.12f, 0.2f, 0f);
            peakIndicator.transform.localScale = new Vector3(0.05f, 0.12f, 0.3f);
            Destroy(peakIndicator.GetComponent<Collider>());

            var peakRenderer = peakIndicator.GetComponent<Renderer>();
            peakRenderer.material = new Material(Shader.Find("Standard"));
            peakRenderer.material.color = new Color(1f, 0.2f, 0.2f);

            masterMixer.peakIndicator = peakIndicator;
        }

        private void CreateSpectrumVisualizer()
        {
            spectrumAnalyzer = new SpectrumAnalyzer();

            // Spectrum analyzer display (above mixer)
            spectrumAnalyzer.visualizer = new GameObject("Spectrum Analyzer");
            spectrumAnalyzer.visualizer.transform.SetParent(mixerConsole.transform);
            spectrumAnalyzer.visualizer.transform.localPosition = new Vector3(0f, 0.55f, -0.1f);

            // Create 16 frequency band visualizers
            for (int i = 0; i < 16; i++)
            {
                var band = GameObject.CreatePrimitive(PrimitiveType.Cube);
                band.name = $"Spectrum Band {i + 1}";
                band.transform.SetParent(spectrumAnalyzer.visualizer.transform);
                var xPos = (i - 7.5f) * 0.2f;
                band.transform.localPosition = new Vector3(xPos, 0f, 0f);
                band.transform.localScale = new Vector3(0.15f, 0.3f, 0.3f);
                Destroy(band.GetComponent<Collider>());

                var bandRenderer = band.GetComponent<Renderer>();
                bandRenderer.material = new Material(Shader.Find("Standard"));
                bandRenderer.material.color = new Color(0f, 0.8f, 0.4f);

                spectrumAnalyzer.bands.Add(band);
            }

            // Spectrum label
            var spectrumLabel = new GameObject("Label");
            spectrumLabel.transform.SetParent(spectrumAnalyzer.visualizer.transform);
            spectrumLabel.transform.localPosition = new Vector3(0f, -0.3f, 0.2f);
            var spectrumText = spectrumLabel.AddComponent<TextMesh>();
            spectrumText.text = "FREQUENCY SPECTRUM · 20Hz - 20kHz";
            spectrumText.fontSize = 16;
            spectrumText.characterSize = 0.008f;
            spectrumText.anchor = TextAnchor.MiddleCenter;
            spectrumText.alignment = TextAlignment.Center;
            spectrumText.color = new Color(0.72f, 1f, 0.4f);
        }

        private void Update()
        {
            if (audioService == null) return;

            var snapshot = audioService.Latest;

            // Update master channel display
            if (snapshot.master != null)
            {
                masterMixer.currentLevel = snapshot.master.level;
                UpdateMasterDisplay(snapshot.master);
            }

            // Update track displays
            if (snapshot.tracks != null && snapshot.tracks.Count > 0)
            {
                for (int i = 0; i < Mathf.Min(trackMixers.Count, snapshot.tracks.Count); i++)
                {
                    var track = snapshot.tracks[i];
                    UpdateTrackDisplay(trackMixers[i], track);
                }
            }

            // Update spectrum analyzer
            if (snapshot.spectrum != null && snapshot.spectrum.Count > 0)
            {
                UpdateSpectrumDisplay(snapshot.spectrum);
            }
        }

        private void UpdateTrackDisplay(TrackMixer mixer, AudioTrack track)
        {
            mixer.currentLevel = track.level;
            mixer.trackName = track.name;

            // Update fader position
            if (mixer.faderKnob != null)
            {
                var faderPos = mixer.faderKnob.transform.localPosition;
                faderPos.y = track.level * 0.35f - 0.175f;
                mixer.faderKnob.transform.localPosition = faderPos;

                // Change color based on solo/mute
                var faderRenderer = mixer.faderKnob.GetComponent<Renderer>();
                if (track.solo)
                    faderRenderer.material.color = new Color(1f, 0.8f, 0.2f);  // Yellow when soloed
                else if (track.muted)
                    faderRenderer.material.color = new Color(0.5f, 0.5f, 0.5f);  // Gray when muted
                else
                    faderRenderer.material.color = new Color(0.22f, 0.8f, 0.15f);  // Green normally
            }

            // Update level meter
            if (mixer.levelMeter != null)
            {
                var meterScale = mixer.levelMeter.transform.localScale;
                meterScale.y = track.level * 0.4f;
                mixer.levelMeter.transform.localScale = meterScale;

                var meterPos = mixer.levelMeter.transform.localPosition;
                meterPos.y = (track.level - 0.5f) * 0.35f;
                mixer.levelMeter.transform.localPosition = meterPos;

                // Color indicates clipping
                var meterRenderer = mixer.levelMeter.GetComponent<Renderer>();
                if (track.clipping)
                    meterRenderer.material.color = new Color(1f, 0.2f, 0.2f);  // Red when clipping
                else
                    meterRenderer.material.color = new Color(0f, 0.7f, 0.3f);  // Green normally
            }
        }

        private void UpdateMasterDisplay(MasterChannel master)
        {
            // Update master fader
            if (masterMixer.faderKnob != null)
            {
                var faderPos = masterMixer.faderKnob.transform.localPosition;
                faderPos.y = master.level * 0.35f - 0.175f;
                masterMixer.faderKnob.transform.localPosition = faderPos;
            }

            // Update peak indicator
            if (masterMixer.peakIndicator != null)
            {
                var peakScale = masterMixer.peakIndicator.transform.localScale;
                peakScale.y = master.peakLevel * 0.3f;
                masterMixer.peakIndicator.transform.localScale = peakScale;

                var peakRenderer = masterMixer.peakIndicator.GetComponent<Renderer>();
                if (master.clipping)
                    peakRenderer.material.color = new Color(1f, 0.1f, 0.1f);  // Bright red when clipping
                else
                    peakRenderer.material.color = new Color(1f, 0.2f, 0.2f);  // Dim red otherwise
            }
        }

        private void UpdateSpectrumDisplay(List<FrequencyBand> spectrum)
        {
            for (int i = 0; i < Mathf.Min(spectrumAnalyzer.bands.Count, spectrum.Count); i++)
            {
                var band = spectrum[i];
                var bandObj = spectrumAnalyzer.bands[i];

                // Scale band height based on magnitude
                var scale = bandObj.transform.localScale;
                scale.y = Mathf.Max(0.1f, band.magnitude * 0.5f);
                bandObj.transform.localScale = scale;

                // Color gradient: green (low) → yellow (mid) → red (high)
                var renderer = bandObj.GetComponent<Renderer>();
                if (band.magnitude < 0.33f)
                    renderer.material.color = new Color(0f, 0.8f, 0.4f);
                else if (band.magnitude < 0.66f)
                    renderer.material.color = new Color(1f, 0.8f, 0.2f);
                else
                    renderer.material.color = new Color(1f, 0.3f, 0.2f);
            }
        }

        private void OnGestureDetected(HandGestureDetector.Gesture gesture, HandGestureDetector.Hand hand)
        {
            switch (gesture)
            {
                case HandGestureDetector.Gesture.Pinch:
                    // Pinch on fader to adjust level
                    if (selectedTrackIndex >= 0 && selectedTrackIndex < trackMixers.Count)
                    {
                        // Move fader up/down based on hand Y position
                    }
                    break;

                case HandGestureDetector.Gesture.ThumbsUp:
                    // Toggle solo on selected track
                    if (selectedTrackIndex >= 0 && selectedTrackIndex < trackMixers.Count)
                    {
                        Debug.Log($"Solo toggled on track {selectedTrackIndex + 1}");
                    }
                    break;

                case HandGestureDetector.Gesture.PalmOpen:
                    // Show mixer menu / settings
                    Debug.Log("Mixer menu opened");
                    break;

                case HandGestureDetector.Gesture.IndexPoint:
                    // Point to select track or parameter
                    Debug.Log("Pointing gesture detected");
                    break;
            }
        }

        private void OnDestroy()
        {
            if (gestureDetector != null)
            {
                gestureDetector.OnGestureDetected -= OnGestureDetected;
            }
        }
    }
}
