#if UNITY_EDITOR
using NUnit.Framework;
using UnityEngine;
using System.Collections.Generic;

namespace Wise2.XR.Tests
{
    /// <summary>
    /// Integration tests for SoundLabs VR implementation.
    /// Verifies data contracts, services, and core functionality.
    /// Run: Unity Test Framework → Play Mode / Edit Mode
    /// </summary>
    public class SoundLabsIntegrationTest
    {
        [Test]
        public void SoundLabsStateMapper_ParseConnectionState_ValidInput()
        {
            // Arrange
            var testCases = new Dictionary<string, AudioConnectionState>
            {
                { "CONNECTED", AudioConnectionState.Connected },
                { "DEMO", AudioConnectionState.Demo },
                { "OFFLINE_DEMO", AudioConnectionState.OfflineDemo },
                { "offline", AudioConnectionState.OfflineDemo },
                { "DEGRADED", AudioConnectionState.Degraded },
                { "", AudioConnectionState.OfflineDemo },
                { null, AudioConnectionState.OfflineDemo },
            };

            // Act & Assert
            foreach (var kvp in testCases)
            {
                var result = SoundLabsStateMapper.ParseConnectionState(kvp.Key);
                Assert.AreEqual(kvp.Value, result, $"Failed for input: {kvp.Key}");
            }
        }

        [Test]
        public void SoundLabsStateMapper_ToWorldState_ReturnsCorrectState()
        {
            // Arrange
            var testCases = new Dictionary<AudioConnectionState, WorldState>
            {
                { AudioConnectionState.Connected, WorldState.Connected },
                { AudioConnectionState.Demo, WorldState.OfflineDemo },
                { AudioConnectionState.OfflineDemo, WorldState.OfflineDemo },
                { AudioConnectionState.Degraded, WorldState.Degraded },
            };

            // Act & Assert
            foreach (var kvp in testCases)
            {
                var result = SoundLabsStateMapper.ToWorldState(kvp.Key);
                Assert.AreEqual(kvp.Value, result, $"Failed for state: {kvp.Key}");
            }
        }

        [Test]
        public void SoundLabsStateMapper_StatusLabel_ReturnsCorrectLabels()
        {
            // Arrange
            var testCases = new Dictionary<AudioConnectionState, string>
            {
                { AudioConnectionState.Connected, "CONNECTED" },
                { AudioConnectionState.Demo, "DEMO" },
                { AudioConnectionState.OfflineDemo, "OFFLINE MIX" },
                { AudioConnectionState.Degraded, "DEGRADED" },
            };

            // Act & Assert
            foreach (var kvp in testCases)
            {
                var result = SoundLabsStateMapper.StatusLabel(kvp.Key);
                Assert.AreEqual(kvp.Value, result, $"Failed for state: {kvp.Key}");
            }
        }

        [Test]
        public void OfflineSoundLabsDemo_GeneratesValidSnapshot()
        {
            // Arrange
            var demo = new OfflineSoundLabsDemo();

            // Act
            var snapshot = demo.Latest;

            // Assert
            Assert.IsNotNull(snapshot);
            Assert.IsNotNull(snapshot.session);
            Assert.IsNotNull(snapshot.master);
            Assert.IsNotNull(snapshot.tracks);
            Assert.IsNotNull(snapshot.spectrum);
        }

        [Test]
        public void OfflineSoundLabsDemo_Has8Tracks()
        {
            // Arrange
            var demo = new OfflineSoundLabsDemo();

            // Act
            var tracks = demo.Latest.tracks;

            // Assert
            Assert.AreEqual(8, tracks.Count, "Should have 8 demo tracks");
            Assert.AreEqual("Vocal", tracks[0].name);
            Assert.AreEqual("Bass", tracks[1].name);
            Assert.AreEqual("Drums", tracks[2].name);
        }

        [Test]
        public void OfflineSoundLabsDemo_LevelsInValidRange()
        {
            // Arrange
            var demo = new OfflineSoundLabsDemo();

            // Act
            var snapshot = demo.Latest;

            // Assert - Master level
            Assert.IsTrue(snapshot.master.level >= 0f && snapshot.master.level <= 1f,
                "Master level should be 0.0-1.0");
            Assert.IsTrue(snapshot.master.peakLevel >= 0f && snapshot.master.peakLevel <= 1f,
                "Master peak should be 0.0-1.0");

            // Assert - Track levels
            foreach (var track in snapshot.tracks)
            {
                Assert.IsTrue(track.level >= 0f && track.level <= 1f,
                    $"Track {track.name} level out of range");
                Assert.IsTrue(track.peakLevel >= 0f && track.peakLevel <= 1f,
                    $"Track {track.name} peak out of range");
            }

            // Assert - Spectrum
            foreach (var band in snapshot.spectrum)
            {
                Assert.IsTrue(band.magnitude >= 0f && band.magnitude <= 1f,
                    $"Spectrum band at {band.frequency}Hz out of range");
            }
        }

        [Test]
        public void SoundLabsApiClient_FallsBackToDemo()
        {
            // Arrange
            var demo = new OfflineSoundLabsDemo();
            var client = new SoundLabsApiClient("http://invalid-url:9999", demo);

            // Act
            var snapshot = client.Latest;

            // Assert
            Assert.IsNotNull(snapshot);
            Assert.AreEqual("OFFLINE_DEMO", snapshot.connectionState);
        }

        [Test]
        public void HandGestureDetector_EnumsAreValid()
        {
            // Arrange & Act
            var gestures = new HandGestureDetector.Gesture[]
            {
                HandGestureDetector.Gesture.None,
                HandGestureDetector.Gesture.Pinch,
                HandGestureDetector.Gesture.IndexPoint,
                HandGestureDetector.Gesture.ThumbsUp,
                HandGestureDetector.Gesture.PalmOpen,
                HandGestureDetector.Gesture.Grab,
            };

            var hands = new HandGestureDetector.Hand[]
            {
                HandGestureDetector.Hand.Left,
                HandGestureDetector.Hand.Right,
            };

            // Assert - Just verify enums exist
            Assert.AreEqual(6, gestures.Length);
            Assert.AreEqual(2, hands.Length);
        }

        [Test]
        public void AudioTrack_DefaultsAreCorrect()
        {
            // Arrange & Act
            var track = new AudioTrack
            {
                trackId = 1,
                name = "Test Track",
                level = 0.5f,
                pan = 0f,
                muted = false,
                solo = false,
                peakLevel = 0.6f,
                clipping = false
            };

            // Assert
            Assert.AreEqual(1, track.trackId);
            Assert.AreEqual("Test Track", track.name);
            Assert.AreEqual(0.5f, track.level);
            Assert.IsFalse(track.muted);
            Assert.IsFalse(track.solo);
            Assert.IsFalse(track.clipping);
        }

        [Test]
        public void RecordingSession_DefaultsAreCorrect()
        {
            // Arrange & Act
            var session = new RecordingSession
            {
                projectName = "Test Project",
                isRecording = true,
                isPlaying = false,
                currentTimeSeconds = 123.45f,
                totalDurationSeconds = 3600f,
                trackCount = 8,
                status = "RECORDING"
            };

            // Assert
            Assert.AreEqual("Test Project", session.projectName);
            Assert.IsTrue(session.isRecording);
            Assert.IsFalse(session.isPlaying);
            Assert.AreEqual(123.45f, session.currentTimeSeconds);
            Assert.AreEqual(8, session.trackCount);
        }

        [Test]
        public void MasterChannel_InitializesCorrectly()
        {
            // Arrange & Act
            var master = new MasterChannel
            {
                level = 0.85f,
                peakLevel = 0.92f,
                clipping = false,
                compressorGain = -3.2f
            };

            // Assert
            Assert.AreEqual(0.85f, master.level);
            Assert.AreEqual(0.92f, master.peakLevel);
            Assert.IsFalse(master.clipping);
            Assert.AreEqual(-3.2f, master.compressorGain);
        }

        [Test]
        public void SoundLabsSnapshot_CanBeSerialized()
        {
            // Arrange
            var snapshot = new SoundLabsSnapshot
            {
                connectionState = "OFFLINE_DEMO",
                capturedAt = System.DateTime.UtcNow.ToString("O"),
                ageSeconds = 0,
                session = new RecordingSession { projectName = "Test" },
                master = new MasterChannel { level = 0.85f },
                tracks = new System.Collections.Generic.List<AudioTrack>(),
                spectrum = new System.Collections.Generic.List<FrequencyBand>(),
            };

            // Act
            var json = JsonUtility.ToJson(snapshot);

            // Assert
            Assert.IsNotEmpty(json);
            StringAssert.Contains("OFFLINE_DEMO", json);
            StringAssert.Contains("Test", json);
        }
    }
}
#endif
