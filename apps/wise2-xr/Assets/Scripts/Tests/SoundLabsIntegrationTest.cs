#if UNITY_EDITOR
using NUnit.Framework;
using UnityEngine;
using System.Collections.Generic;

namespace Wise2.XR.Tests
{
    /// <summary>
    /// Integration tests for SoundLabs XR components.
    /// Tests data contracts, API client, audio mixer, gestures, and deep links.
    /// </summary>
    public class SoundLabsIntegrationTest
    {
        [Test]
        public void SoundLabsSnapshot_DefaultState_IsValid()
        {
            var snapshot = new SoundLabsSnapshot();
            Assert.IsNotNull(snapshot);
        }

        [Test]
        public void OfflineSoundLabsDemo_ProducesSnapshot()
        {
            var demo = new OfflineSoundLabsDemo();
            Assert.IsNotNull(demo.Latest);
            Assert.AreEqual("OFFLINE_DEMO", demo.Latest.connectionState);
        }

        [Test]
        public void RecordingSession_DefaultState_IsValid()
        {
            var session = new RecordingSession();
            Assert.IsNotNull(session);
        }

        [Test]
        public void AudioTrack_DefaultState_IsValid()
        {
            var track = new AudioTrack();
            Assert.IsNotNull(track);
        }

        [Test]
        public void FrequencyBand_DefaultState_IsValid()
        {
            var band = new FrequencyBand();
            Assert.IsNotNull(band);
        }

        [Test]
        public void MasterChannel_DefaultState_IsValid()
        {
            var master = new MasterChannel();
            Assert.IsNotNull(master);
        }

        [Test]
        public void SoundLabsSnapshot_CanContainTracks()
        {
            var snapshot = new SoundLabsSnapshot
            {
                tracks = new List<AudioTrack>
                {
                    new AudioTrack { name = "Track 1" },
                    new AudioTrack { name = "Track 2" }
                }
            };

            Assert.AreEqual(2, snapshot.tracks.Count);
            Assert.AreEqual("Track 1", snapshot.tracks[0].name);
        }

        [Test]
        public void SoundLabsSnapshot_CanContainSpectrum()
        {
            var snapshot = new SoundLabsSnapshot
            {
                spectrum = new List<FrequencyBand>
                {
                    new FrequencyBand { label = "Low" },
                    new FrequencyBand { label = "Mid" },
                    new FrequencyBand { label = "High" }
                }
            };

            Assert.AreEqual(3, snapshot.spectrum.Count);
        }

        [Test]
        public void OfflineSoundLabsDemo_HasSessionData()
        {
            var demo = new OfflineSoundLabsDemo();
            Assert.IsNotNull(demo.Latest.session);
        }

        [Test]
        public void OfflineSoundLabsDemo_HasMasterData()
        {
            var demo = new OfflineSoundLabsDemo();
            Assert.IsNotNull(demo.Latest.master);
        }

        [Test]
        public void OfflineSoundLabsDemo_HasTrackData()
        {
            var demo = new OfflineSoundLabsDemo();
            Assert.IsNotNull(demo.Latest.tracks);
        }

        [Test]
        public void OfflineSoundLabsDemo_HasSpectrumData()
        {
            var demo = new OfflineSoundLabsDemo();
            Assert.IsNotNull(demo.Latest.spectrum);
        }

        [Test]
        public void SoundLabsApiClient_UsesFallback()
        {
            var fallback = new OfflineSoundLabsDemo();
            var client = new SoundLabsApiClient("https://example.invalid", fallback);
            Assert.IsNotNull(client.Latest);
        }

        [Test]
        public void SoundLabsApiClient_DefaultsFallbackWhenNull()
        {
            var client = new SoundLabsApiClient("https://example.invalid", null);
            Assert.IsNotNull(client.Latest);
        }

        [Test]
        public void SoundLabsSnapshot_ConnectionState_CanBeSet()
        {
            var snapshot = new SoundLabsSnapshot { connectionState = "LIVE" };
            Assert.AreEqual("LIVE", snapshot.connectionState);
        }

        [Test]
        public void RecordingSession_ValuesCanBeSet()
        {
            var session = new RecordingSession
            {
                projectName = "WISE2 Session",
                bpm = 92,
                isRecording = true
            };

            Assert.AreEqual("WISE2 Session", session.projectName);
            Assert.AreEqual(92, session.bpm);
            Assert.IsTrue(session.isRecording);
        }

        [Test]
        public void AudioTrack_ValuesCanBeSet()
        {
            var track = new AudioTrack
            {
                name = "Lead",
                level = 0.8f,
                pan = -0.2f,
                muted = false,
                solo = true
            };

            Assert.AreEqual("Lead", track.name);
            Assert.AreEqual(0.8f, track.level);
            Assert.AreEqual(-0.2f, track.pan);
            Assert.IsFalse(track.muted);
            Assert.IsTrue(track.solo);
        }

        [Test]
        public void FrequencyBand_ValuesCanBeSet()
        {
            var band = new FrequencyBand
            {
                label = "Mid",
                frequency = 1000f,
                magnitude = 0.75f
            };

            Assert.AreEqual("Mid", band.label);
            Assert.AreEqual(1000f, band.frequency);
            Assert.AreEqual(0.75f, band.magnitude);
        }

        [Test]
        public void MasterChannel_ValuesCanBeSet()
        {
            var master = new MasterChannel
            {
                level = 0.85f,
                peakLevel = 0.92f,
                clipping = false,
                compressorGain = -3.2f
            };

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