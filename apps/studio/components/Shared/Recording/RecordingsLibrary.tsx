'use client';

import { useState, useMemo } from 'react';
import { RecordingCard } from './RecordingCard';
import { useRecordings, type SortBy, type SortOrder } from '../../../hooks/useRecordings';
import type { Recording } from '../../../types/streaming';

export interface RecordingsLibraryProps {
  /**
   * Title to display
   */
  title?: string;

  /**
   * Show header with filters
   */
  showHeader?: boolean;

  /**
   * Callbacks for recording actions
   */
  onPlay?: (recording: Recording) => void;
  onExport?: (recording: Recording) => void;
  onShare?: (recording: Recording) => void;

  /**
   * Show archived recordings
   */
  showArchived?: boolean;
}

export function RecordingsLibrary({
  title = 'RECORDINGS LIBRARY',
  showHeader = true,
  onPlay,
  onExport,
  onShare,
  showArchived = false,
}: RecordingsLibraryProps) {
  const {
    recordings,
    sortBy,
    sortOrder,
    searchQuery,
    setSortBy,
    setSortOrder,
    setSearchQuery,
    deleteRecording,
    archiveRecording,
    unarchiveRecording,
    getFilteredAndSortedRecordings,
    getRecordingStats,
  } = useRecordings();

  const [selectedRecordings, setSelectedRecordings] = useState<Set<string>>(new Set());
  const [filterDuration, setFilterDuration] = useState<'all' | 'short' | 'medium' | 'long'>('all');

  const stats = getRecordingStats();

  const filteredRecordings = useMemo(() => {
    let durationFilter: [number | undefined, number | undefined] = [undefined, undefined];

    switch (filterDuration) {
      case 'short':
        durationFilter = [0, 300]; // 0-5 minutes
        break;
      case 'medium':
        durationFilter = [300, 1800]; // 5-30 minutes
        break;
      case 'long':
        durationFilter = [1800, undefined]; // 30+ minutes
        break;
    }

    return getFilteredAndSortedRecordings({
      searchQuery,
      sortBy,
      sortOrder,
      minDuration: durationFilter[0],
      maxDuration: durationFilter[1],
      archived: showArchived ? true : false,
    });
  }, [searchQuery, sortBy, sortOrder, filterDuration, showArchived, getFilteredAndSortedRecordings]);

  const handleDelete = (id: string) => {
    if (confirm('Delete this recording?')) {
      deleteRecording(id);
      setSelectedRecordings((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedRecordings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedRecordings.size === filteredRecordings.length) {
      setSelectedRecordings(new Set());
    } else {
      setSelectedRecordings(new Set(filteredRecordings.map((r) => r.id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      {showHeader && (
        <div className="border-b border-gray-700 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-100">{title}</h2>
            <div className="text-xs text-gray-500">
              {stats.totalRecordings} recording{stats.totalRecordings !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-gray-900 border border-gray-700 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">Total Recordings</div>
              <div className="text-lg font-bold text-gray-200">{stats.totalRecordings}</div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">Total Duration</div>
              <div className="text-lg font-bold text-gray-200">
                {Math.floor(stats.totalDuration / 3600)}h {Math.floor((stats.totalDuration % 3600) / 60)}m
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">Total Size</div>
              <div className="text-lg font-bold text-gray-200">
                {(stats.totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-700 rounded p-3">
              <div className="text-xs text-gray-500 mb-1">Archived</div>
              <div className="text-lg font-bold text-gray-200">{stats.archivedCount}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="space-y-4">
        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-2">Search</label>
          <input
            type="text"
            placeholder="Search recordings by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Sort By */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
            >
              <option value="date">Date</option>
              <option value="duration">Duration</option>
              <option value="size">File Size</option>
              <option value="name">Name</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          {/* Duration Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2">Duration</label>
            <select
              value={filterDuration}
              onChange={(e) => setFilterDuration(e.target.value as 'all' | 'short' | 'medium' | 'long')}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-gray-200 focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Durations</option>
              <option value="short">0-5 minutes</option>
              <option value="medium">5-30 minutes</option>
              <option value="long">30+ minutes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Recordings Grid */}
      {filteredRecordings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-4xl mb-3">🎙️</div>
          <p className="text-sm">No recordings found</p>
          {searchQuery && <p className="text-xs text-gray-600">Try adjusting your search</p>}
        </div>
      ) : (
        <>
          {/* Selection and Bulk Actions */}
          {selectedRecordings.size > 0 && (
            <div className="bg-blue-900/20 border border-blue-700/30 rounded p-4 flex items-center justify-between">
              <div className="text-sm text-blue-300">
                {selectedRecordings.size} recording{selectedRecordings.size !== 1 ? 's' : ''} selected
              </div>
              <button
                onClick={() => setSelectedRecordings(new Set())}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                Clear selection
              </button>
            </div>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRecordings.map((recording) => (
              <div
                key={recording.id}
                className={`relative transition-opacity ${
                  selectedRecordings.has(recording.id) ? 'ring-2 ring-blue-500 rounded-lg' : ''
                }`}
                onClick={() => {
                  if (selectedRecordings.size > 0) {
                    handleToggleSelect(recording.id);
                  }
                }}
              >
                <RecordingCard
                  recording={recording}
                  onPlay={onPlay}
                  onExport={onExport}
                  onDelete={handleDelete}
                  onShare={onShare}
                />

                {/* Selection Checkbox */}
                {selectedRecordings.size > 0 && (
                  <div
                    className="absolute top-3 left-3 w-5 h-5 bg-gray-900 border-2 border-blue-500 rounded cursor-pointer flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSelect(recording.id);
                    }}
                  >
                    {selectedRecordings.has(recording.id) && (
                      <span className="text-blue-400 font-bold">✓</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Result count */}
          <div className="text-center text-xs text-gray-500 mt-4">
            Showing {filteredRecordings.length} of {stats.totalRecordings} recording{stats.totalRecordings !== 1 ? 's' : ''}
          </div>
        </>
      )}
    </div>
  );
}
