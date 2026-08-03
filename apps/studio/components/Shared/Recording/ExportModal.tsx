'use client';

import { useState } from 'react';
import type { Recording } from '../../../types/streaming';
import { formatFileSize } from '../../../utils/fileSizeCalculator';
import {
  getMimeType,
  getFileExtension,
  getFormatDescription,
  getFormatRecommendation,
  type ExportFormat,
} from '../../../utils/recordingExport';

export interface ExportModalProps {
  recording: Recording;
  isOpen: boolean;
  isExporting?: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, bitrate?: number) => void;
}

export function ExportModal({
  recording,
  isOpen,
  isExporting = false,
  onClose,
  onExport,
}: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('wav');
  const [bitrate, setBitrate] = useState(192);

  if (!isOpen) return null;

  const formatOptions: ExportFormat[] = ['wav', 'mp3', 'aac'];

  const handleExport = () => {
    onExport(selectedFormat, selectedFormat === 'wav' ? undefined : bitrate);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md shadow-lg">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-100">Export Recording</h3>
          <p className="text-xs text-gray-500 mt-1">Choose format and quality</p>
        </div>

        {/* Recording Info */}
        <div className="bg-gray-800 border border-gray-700 rounded p-3 mb-6">
          <div className="text-sm font-semibold text-gray-200 truncate">{recording.title}</div>
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <div>Duration: {Math.floor(recording.duration / 60)}m {recording.duration % 60}s</div>
            <div>Tracks: {recording.trackCount}</div>
          </div>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-300 mb-3">Audio Format</label>
          <div className="space-y-2">
            {formatOptions.map((format) => (
              <label
                key={format}
                className="flex items-start gap-3 p-3 border border-gray-700 rounded cursor-pointer hover:bg-gray-800 transition-colors"
                style={{
                  backgroundColor: selectedFormat === format ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                  borderColor: selectedFormat === format ? 'rgb(59, 130, 246)' : 'rgb(55, 65, 81)',
                }}
              >
                <input
                  type="radio"
                  name="format"
                  value={format}
                  checked={selectedFormat === format}
                  onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                  className="mt-1"
                />
                <div>
                  <div className="font-semibold text-gray-200 uppercase">{format}</div>
                  <div className="text-xs text-gray-400 mt-1">{getFormatDescription(format)}</div>
                  <div className="text-xs text-blue-400 mt-1">{getFormatRecommendation(format)}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Bitrate Selection (for lossy formats) */}
        {selectedFormat !== 'wav' && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Bitrate: {bitrate} kbps
            </label>
            <input
              type="range"
              min="64"
              max="320"
              step="32"
              value={bitrate}
              onChange={(e) => setBitrate(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>64 kbps (low quality)</span>
              <span>320 kbps (high quality)</span>
            </div>
          </div>
        )}

        {/* File Size Preview */}
        <div className="bg-gray-800 border border-gray-700 rounded p-3 mb-6">
          <div className="text-xs text-gray-500 mb-1">Estimated File Size</div>
          <div className="text-lg font-bold text-gray-200">
            {formatFileSize(
              selectedFormat === 'wav'
                ? (recording.fileSize)
                : (bitrate * 1000 * recording.duration) / 8
            )}
          </div>
        </div>

        {/* MIME Type Info */}
        <div className="text-xs text-gray-500 mb-6">
          File type: {getMimeType(selectedFormat)} • Extension: {getFileExtension(selectedFormat)}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isExporting ? (
              <>
                <span className="animate-spin">⟳</span>
                Exporting...
              </>
            ) : (
              <>
                <span>⬇</span>
                Export
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
