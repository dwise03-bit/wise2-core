/**
 * ExportDialog.tsx
 *
 * Professional audio export UI component for WISE² Studio.
 * Provides format selection, quality settings, loudness normalization,
 * preview playback, and batch export capabilities.
 *
 * @module components/ExportDialog
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AudioCodec,
  ExportFormat,
  CODEC_CONFIGS,
  QUALITY_PRESETS,
  qualityToBitrate,
  bitrateToQuality,
  estimateFileSize,
  getRecommendedCodec,
} from '@/lib/audioExport/Codecs';
import {
  LoudnessNormalizationOptions,
  LOUDNESS_STANDARDS,
  analyzeLoudness,
} from '@/lib/audioExport/Loudness';
import { ExportEngine, AudioTrack, ExportProgress, ExportResult } from '@/lib/audioExport/ExportEngine';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: AudioTrack[];
  duration: number;
  projectTitle?: string;
  onExportComplete?: (results: ExportResult[]) => void;
  audioContext: AudioContext;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  tracks,
  duration,
  projectTitle = 'export',
  onExportComplete,
  audioContext,
}) => {
  // Format and quality settings
  const [selectedCodec, setSelectedCodec] = useState<AudioCodec>('wav');
  const [quality, setQuality] = useState(85);
  const [bitrate, setBitrate] = useState(192);
  const [usePreset, setUsePreset] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState(0);

  // Loudness settings
  const [normalizeEnabled, setNormalizeEnabled] = useState(true);
  const [normalizationStandard, setNormalizationStandard] = useState<keyof typeof LOUDNESS_STANDARDS>('spotify');
  const [customTargetLUFS, setCustomTargetLUFS] = useState(-14);

  // Batch export
  const [batchExportEnabled, setBatchExportEnabled] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState<AudioCodec[]>(['wav']);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const exportEngineRef = useRef<ExportEngine | null>(null);

  // Initialize export engine
  useEffect(() => {
    if (!exportEngineRef.current) {
      exportEngineRef.current = new ExportEngine(audioContext);
    }
  }, [audioContext]);

  // Handle codec change
  const handleCodecChange = (codec: AudioCodec) => {
    setSelectedCodec(codec);
    const presets = QUALITY_PRESETS[codec];
    if (presets && presets.length > 0) {
      setSelectedPreset(0);
      const preset = presets[0];
      setBitrate(preset.bitrate);
      setQuality(preset.quality);
    }
  };

  // Handle quality change
  const handleQualityChange = (newQuality: number) => {
    setQuality(newQuality);
    const newBitrate = qualityToBitrate(selectedCodec, newQuality);
    setBitrate(newBitrate);
  };

  // Handle bitrate change
  const handleBitrateChange = (newBitrate: number) => {
    setBitrate(newBitrate);
    const newQuality = bitrateToQuality(selectedCodec, newBitrate);
    setQuality(newQuality);
  };

  // Toggle format for batch export
  const toggleBatchFormat = (codec: AudioCodec) => {
    if (selectedFormats.includes(codec)) {
      setSelectedFormats(selectedFormats.filter((c) => c !== codec));
    } else {
      setSelectedFormats([...selectedFormats, codec]);
    }
  };

  // Preview export
  const handlePreview = useCallback(async () => {
    if (!exportEngineRef.current || previewPlaying) return;

    setPreviewPlaying(true);

    try {
      const format: ExportFormat = {
        codec: selectedCodec,
        bitrate: CODEC_CONFIGS[selectedCodec].lossless ? undefined : bitrate,
        quality,
        normalize: normalizeEnabled,
        normalizationTarget: customTargetLUFS,
      };

      const result = await exportEngineRef.current.export(
        tracks,
        duration,
        format,
        {
          targetLoudness: normalizeEnabled ? customTargetLUFS : undefined,
        },
        `${projectTitle}_preview${CODEC_CONFIGS[selectedCodec].extension}`
      );

      if (result.blob && audioRef.current) {
        const url = URL.createObjectURL(result.blob);
        audioRef.current.src = url;
        audioRef.current.play();
      }
    } catch (error) {
      console.error('Preview failed:', error);
    } finally {
      setPreviewPlaying(false);
    }
  }, [selectedCodec, bitrate, quality, normalizeEnabled, customTargetLUFS, tracks, duration, projectTitle]);

  // Handle export
  const handleExport = useCallback(async () => {
    if (!exportEngineRef.current || isExporting) return;

    setIsExporting(true);

    try {
      const baseFormat: ExportFormat = {
        codec: selectedCodec,
        bitrate: CODEC_CONFIGS[selectedCodec].lossless ? undefined : bitrate,
        quality,
        normalize: normalizeEnabled,
        normalizationTarget: customTargetLUFS,
      };

      const normalizationOptions: LoudnessNormalizationOptions = normalizeEnabled
        ? { targetLoudness: customTargetLUFS }
        : {};

      let results: ExportResult[];

      if (batchExportEnabled && selectedFormats.length > 0) {
        // Batch export
        const formats = selectedFormats.map((codec) => ({
          codec,
          bitrate: CODEC_CONFIGS[codec].lossless ? undefined : bitrate,
          quality,
        }));

        results = await exportEngineRef.current.batchExport(
          tracks,
          duration,
          formats,
          projectTitle,
          normalizationOptions
        );
      } else {
        // Single format export
        const result = await exportEngineRef.current.export(
          tracks,
          duration,
          baseFormat,
          normalizationOptions,
          `${projectTitle}${CODEC_CONFIGS[selectedCodec].extension}`
        );

        results = [result];

        // Download single result
        if (result.blob && result.success) {
          exportEngineRef.current.downloadBlob(result.blob, result.filename);
        }
      }

      // Download batch results
      if (batchExportEnabled && results.length > 1) {
        for (const result of results) {
          if (result.blob && result.success) {
            exportEngineRef.current.downloadBlob(result.blob, result.filename);
          }
        }
      }

      // Call completion callback
      if (onExportComplete) {
        onExportComplete(results);
      }

      // Close dialog after successful export
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  }, [selectedCodec, bitrate, quality, normalizeEnabled, customTargetLUFS, batchExportEnabled, selectedFormats, tracks, duration, projectTitle, isExporting, onExportComplete, onClose]);

  if (!isOpen) return null;

  const selectedCodecConfig = CODEC_CONFIGS[selectedCodec];
  const presets = QUALITY_PRESETS[selectedCodec];
  const fileSize = estimateFileSize({ codec: selectedCodec, bitrate }, duration);
  const standardConfig = LOUDNESS_STANDARDS[normalizationStandard];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-slate-950 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-800">
        {/* Header */}
        <div className="sticky top-0 bg-slate-950 border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Export Audio</h2>
              <p className="text-sm text-slate-400 mt-1">{projectTitle} • {duration.toFixed(2)}s</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <section>
            <h3 className="text-sm font-semibold text-white mb-3">Audio Format</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(CODEC_CONFIGS).map(([codec, config]) => (
                <button
                  key={codec}
                  onClick={() => handleCodecChange(codec as AudioCodec)}
                  className={`p-3 rounded border transition-all ${
                    selectedCodec === codec
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="font-medium text-sm">{codec.toUpperCase()}</div>
                  <div className="text-xs text-slate-400 mt-1">{config.description}</div>
                </button>
              ))}
            </div>
          </section>

          {/* Quality Settings */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Quality</h3>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={usePreset}
                  onChange={(e) => setUsePreset(e.target.checked)}
                  className="rounded"
                />
                Use Presets
              </label>
            </div>

            {usePreset && presets ? (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedPreset(idx);
                      setBitrate(preset.bitrate);
                      setQuality(preset.quality);
                    }}
                    className={`p-3 rounded border text-left transition-all ${
                      selectedPreset === idx
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="font-medium text-sm">{preset.label}</div>
                    <div className="text-xs text-slate-400 mt-1">{preset.description}</div>
                  </button>
                ))}
              </div>
            ) : null}

            {/* Quality Slider */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Quality: {quality}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={quality}
                onChange={(e) => handleQualityChange(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Bitrate (if lossy) */}
            {!selectedCodecConfig.lossless && (
              <div className="space-y-2 mt-4">
                <label className="text-sm text-slate-300">
                  Bitrate: {bitrate} kbps
                </label>
                <input
                  type="range"
                  min={selectedCodecConfig.bitrateRange?.min || 32}
                  max={selectedCodecConfig.bitrateRange?.max || 320}
                  step={8}
                  value={bitrate}
                  onChange={(e) => handleBitrateChange(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </section>

          {/* Loudness Normalization */}
          <section>
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={normalizeEnabled}
                onChange={(e) => setNormalizeEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-semibold text-white">Loudness Normalization</span>
            </label>

            {normalizeEnabled && (
              <div className="space-y-3 bg-slate-900 p-3 rounded">
                <select
                  value={normalizationStandard}
                  onChange={(e) =>
                    setNormalizationStandard(e.target.value as keyof typeof LOUDNESS_STANDARDS)
                  }
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm"
                >
                  {Object.entries(LOUDNESS_STANDARDS).map(([key, standard]) => (
                    <option key={key} value={key}>
                      {standard.name} ({standard.targetLoudness} LUFS)
                    </option>
                  ))}
                </select>

                <div className="space-y-2">
                  <label className="text-sm text-slate-300">
                    Target Loudness: {customTargetLUFS} LUFS
                  </label>
                  <input
                    type="range"
                    min="-30"
                    max="-8"
                    step="1"
                    value={customTargetLUFS}
                    onChange={(e) => setCustomTargetLUFS(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </section>

          {/* Batch Export */}
          <section>
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={batchExportEnabled}
                onChange={(e) => setBatchExportEnabled(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm font-semibold text-white">Batch Export</span>
            </label>

            {batchExportEnabled && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 bg-slate-900 p-3 rounded">
                {Object.keys(CODEC_CONFIGS).map((codec) => (
                  <button
                    key={codec}
                    onClick={() => toggleBatchFormat(codec as AudioCodec)}
                    className={`p-2 rounded border text-sm transition-all ${
                      selectedFormats.includes(codec as AudioCodec)
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {codec.toUpperCase()}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Export Info */}
          <div className="bg-slate-900 p-4 rounded space-y-2 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Estimated File Size:</span>
              <span className="text-white font-medium">
                {(fileSize / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            {normalizeEnabled && (
              <div className="flex justify-between text-slate-300">
                <span>Target Loudness:</span>
                <span className="text-white font-medium">{customTargetLUFS} LUFS</span>
              </div>
            )}
            {batchExportEnabled && (
              <div className="flex justify-between text-slate-300">
                <span>Export Formats:</span>
                <span className="text-white font-medium">{selectedFormats.length}</span>
              </div>
            )}
          </div>

          {/* Progress */}
          {exportProgress && (
            <div className="bg-slate-900 p-4 rounded">
              <div className="flex justify-between mb-2 text-sm">
                <span className="text-slate-300">{exportProgress.status}</span>
                <span className="text-white font-medium">{exportProgress.progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${exportProgress.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Preview Player */}
          <div className="bg-slate-900 p-3 rounded">
            <audio ref={audioRef} controls className="w-full" />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-950 border-t border-slate-800 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 rounded border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handlePreview}
            disabled={isExporting || previewPlaying}
            className="px-4 py-2 rounded bg-slate-700 text-white hover:bg-slate-600 transition-colors disabled:opacity-50"
          >
            {previewPlaying ? 'Preview Playing...' : 'Preview'}
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || (batchExportEnabled && selectedFormats.length === 0)}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
          >
            {isExporting ? `Exporting... ${exportProgress?.progress || 0}%` : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog;
