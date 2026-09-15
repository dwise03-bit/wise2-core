'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { BootScreen } from './components/BootScreen';
import { ImpCharacter, type ImpState } from './components/ImpCharacter';
import { DefenseMap } from './components/DefenseMap';
import { IncidentFeed } from './components/IncidentFeed';
import { SystemStatusCard } from './components/SystemStatus';
import { apiClient, type Incident, type SystemStatus, type HardwareStatus, type MeshNode, type Alert } from './utils/api-client';
import { usePolling } from './hooks/usePolling';
import { WISE_DEFENSE_API_CONFIG } from './config/api';

export default function WiseDefenseImpDashboard() {
  const [bootComplete, setBootComplete] = useState(false);
  const [impState, setImpState] = useState<ImpState>('OFFLINE');
  const [impMessage, setImpMessage] = useState('Initializing...');
  const [alertLevel, setAlertLevel] = useState<'INFO' | 'WATCH' | 'WARNING' | 'CRITICAL'>('INFO');
  const [lastSync, setLastSync] = useState<number>(Date.now());

  // Poll data from API
  const { data: incidents = [] } = usePolling<Incident[]>(
    () => apiClient.getRecentIncidents(),
    WISE_DEFENSE_API_CONFIG.polling.incidents,
  );

  const { data: systemData } = usePolling<SystemStatus>(
    () => apiClient.getSystem(),
    WISE_DEFENSE_API_CONFIG.polling.system,
  );

  const { data: hardwareData } = usePolling<HardwareStatus>(
    () => apiClient.getHardwareStatus(),
    WISE_DEFENSE_API_CONFIG.polling.system,
  );

  const { data: meshNodes = [] } = usePolling<MeshNode[]>(
    () => apiClient.getMeshNodes(),
    WISE_DEFENSE_API_CONFIG.polling.mesh,
  );

  const { data: alerts = [] } = usePolling<Alert[]>(
    () => apiClient.getAlerts(),
    WISE_DEFENSE_API_CONFIG.polling.incidents,
  );

  // Determine IMP state based on data
  const isConnected = useMemo(() => {
    return hardwareData?.wise2 === 'CONNECTED' || hardwareData?.wise2 === 'CONNECTING';
  }, [hardwareData?.wise2]);

  const hasAlert = useMemo(() => {
    const criticalIncidents = incidents.some((i) => i.severity === 'CRITICAL');
    const criticalAlert = alerts.some((a) => a.level === 'CRITICAL');
    return criticalIncidents || criticalAlert;
  }, [incidents, alerts]);

  useEffect(() => {
    if (!bootComplete) return;

    if (!isConnected) {
      setImpState('OFFLINE');
      setImpMessage('Cloud connection lost. Operating in local mode.');
      setAlertLevel('WATCH');
    } else if (hasAlert) {
      setImpState('ALERT');
      setImpMessage(`${incidents.filter((i) => i.severity === 'CRITICAL').length} critical incident(s) detected`);
      setAlertLevel('CRITICAL');
    } else if (incidents.length > 0) {
      setImpState('SCANNING');
      setImpMessage(`${incidents.length} incident(s) detected nearby`);
      setAlertLevel(incidents.some((i) => i.severity === 'WARNING') ? 'WARNING' : 'WATCH');
    } else {
      setImpState('CONNECTED');
      setImpMessage('All systems normal. Local intelligence systems ready.');
      setAlertLevel('INFO');
    }

    setLastSync(Date.now());
  }, [bootComplete, isConnected, hasAlert, incidents]);

  // Handle keyboard commands
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!bootComplete) return;

      switch (e.key.toLowerCase()) {
        case 's':
          // Sitrep
          handleSitrep();
          break;
        case 'h':
          // Help
          setImpMessage('Commands: S=SITREP, H=Help, R=Reload');
          break;
        case 'r':
          // Reload
          window.location.reload();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [bootComplete]);

  const handleSitrep = useCallback(async () => {
    setImpState('THINKING');
    setImpMessage('Generating situation report...');

    const result = await apiClient.getSitrep();
    if (result.status === 'success' && result.data) {
      setImpMessage('SITREP generated. Check system status for details.');
      setTimeout(() => {
        setImpState('CONNECTED');
        setImpMessage('All systems normal. Local intelligence systems ready.');
      }, 3000);
    } else {
      setImpMessage('Unable to generate SITREP. System offline?');
      setImpState('OFFLINE');
    }
  }, []);

  if (!bootComplete) {
    return <BootScreen onComplete={() => setBootComplete(true)} />;
  }

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      {/* Main Grid Layout */}
      <div className="h-screen w-screen grid grid-cols-12 gap-2 p-4" style={{ gridTemplateRows: 'auto 1fr auto' }}>
        {/* Header - Full width */}
        <div className="col-span-12 flex items-center justify-between border-b border-gray-700 pb-4">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-xs font-mono text-green-400 tracking-widest">WISE² DEFENSE</div>
              <div className="text-2xl font-black text-white">IMP</div>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono">
            <div className={isConnected ? 'text-green-400' : 'text-red-400'}>
              ● {isConnected ? 'EDGE ONLINE' : 'EDGE OFFLINE'}
            </div>
            <div className={hardwareData?.wise2 === 'CONNECTED' ? 'text-green-400' : 'text-yellow-500'}>
              ● WISE² {hardwareData?.wise2 || 'CHECKING'}
            </div>
            <div className="text-gray-500">
              {hardwareData?.sdr === 'ACTIVE' ? '● SDR ONLINE' : '⚫ SDR OFFLINE'}
            </div>
            <div className="text-gray-500">
              {hardwareData?.mesh === 'ACTIVE' ? '● MESH ONLINE' : '⚫ MESH OFFLINE'}
            </div>
          </div>

          <div className="text-xs text-gray-500 font-mono">
            {new Date().toLocaleTimeString()}
          </div>
        </div>

        {/* Main Content - Three columns */}
        {/* Left Column - IMP Character */}
        <div className="col-span-3 flex flex-col items-center justify-center py-8">
          <ImpCharacter state={impState} message={impMessage} alertLevel={alertLevel} />

          {/* Quick Actions */}
          <div className="mt-8 space-y-2 w-full px-4">
            <div className="text-xs font-mono text-green-400 mb-4">QUICK ACTIONS</div>
            <button
              onClick={() => {
                setImpState('SCANNING');
                setImpMessage('Scanning area...');
              }}
              className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 py-2 px-3 text-xs font-mono text-green-400 rounded transition"
            >
              ✓ SCAN AREA
            </button>
            <button
              onClick={handleSitrep}
              className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 py-2 px-3 text-xs font-mono text-green-400 rounded transition"
            >
              📊 LOCAL SITREP
            </button>
            <button
              className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 py-2 px-3 text-xs font-mono text-green-400 rounded transition"
            >
              🔄 RECENT INCIDENTS
            </button>
            <button
              className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-600 py-2 px-3 text-xs font-mono text-green-400 rounded transition"
            >
              📡 RADIO STATUS
            </button>
          </div>
        </div>

        {/* Center Column - Map */}
        <div className="col-span-6 flex flex-col">
          <DefenseMap
            incidents={incidents}
            meshNodes={meshNodes}
            userLocation={{ lat: 0, lng: 0 }}
          />
        </div>

        {/* Right Column - Cards */}
        <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
          <IncidentFeed incidents={incidents} maxHeight="max-h-64" />
          <SystemStatusCard
            system={systemData}
            hardware={hardwareData}
            lastSync={lastSync}
          />
        </div>

        {/* Footer - Full width */}
        <div className="col-span-12 border-t border-gray-700 pt-2 flex items-center justify-between text-xs font-mono">
          <div className="text-gray-500">
            INCIDENTS: {incidents.length} | MESH: {meshNodes.length} nodes | ALERTS: {alerts.length}
          </div>
          <div className="text-gray-600">
            S=SITREP | H=HELP | R=RELOAD
          </div>
        </div>
      </div>

      {/* Alert Banner for CRITICAL alerts */}
      {hasAlert && (
        <div className="fixed bottom-6 left-6 right-6 bg-red-900/80 border-2 border-red-500 rounded-lg p-4 animate-pulse">
          <div className="text-red-400 font-bold mb-1">⚠️ CRITICAL ALERT</div>
          <div className="text-sm text-red-200">
            {incidents.filter((i) => i.severity === 'CRITICAL')[0]?.title || 'Critical incident detected'}
          </div>
        </div>
      )}
    </div>
  );
}
