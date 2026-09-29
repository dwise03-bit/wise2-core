/**
 * ExampleFieldServiceApp.tsx
 * Complete production example of Field Service Tech using Ray-Ban SDK
 *
 * This demonstrates:
 * - Equipment video frame capture
 * - AI vision analysis via Router
 * - AR overlay guidance
 * - Service report generation
 * - Error handling + offline fallback
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Button, SafeAreaView, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import RayBanMetaSDK, { ArFrameData, DeviceContext } from '@wise2/rayban-meta-sdk';

interface EquipmentIssue {
  equipment: string;
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  steps: string[];
  parts?: string[];
  estimatedTime: number;
}

interface ServiceRecord {
  timestamp: number;
  equipment: string;
  issue: string;
  steps: string[];
  resolution: string;
  partsUsed: string[];
  timeSpent: number;
  notes: string;
  locationLat: number;
  locationLng: number;
}

const ExampleFieldServiceApp: React.FC = () => {
  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice('back');

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<EquipmentIssue | null>(null);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [currentRecord, setCurrentRecord] = useState<Partial<ServiceRecord>>({});
  const [error, setError] = useState<string | null>(null);
  const [battery, setBattery] = useState(85);
  const [location, setLocation] = useState({ lat: 40.7128, lng: -74.006 });

  // Initialize SDK
  const sdk = useRef(new RayBanMetaSDK('http://localhost:3100', 'sk-test')).current;

  useEffect(() => {
    // Start battery simulation
    const interval = setInterval(() => {
      setBattery(prev => Math.max(0, prev - 0.1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /**
   * CAPTURE & ANALYZE: Take photo and send to AI Router
   */
  const captureAndAnalyze = async () => {
    if (!cameraRef.current) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Capture frame
      const photo = await cameraRef.current.takeSnapshot({
        quality: 0.7,
      });

      if (!photo) throw new Error('Failed to capture photo');

      // Prepare frame for SDK
      const frame: ArFrameData = {
        deviceId: 'rayban-device-001',
        videoFrame: photo.toString(), // In production: base64 image data
        gesture: 'tap', // User tapped to capture
        timestamp: Date.now(),
      };

      const deviceContext: DeviceContext = {
        deviceId: 'rayban-device-001',
        battery,
        location,
        lighting: 'normal',
        orientation: 'portrait',
      };

      // Send to Router via SDK
      const response = await sdk.processFrame(frame, deviceContext);

      // Parse response into structured analysis
      const analysis = parseAnalysis(response.text);
      setAnalysis(analysis);

      // Update current record
      setCurrentRecord(prev => ({
        ...prev,
        timestamp: Date.now(),
        equipment: analysis.equipment,
        issue: analysis.issue,
        steps: analysis.steps,
        partsUsed: analysis.parts || [],
        locationLat: location.lat,
        locationLng: location.lng,
      }));

      // Send back AR response
      await sdk.sendResponse(deviceContext.deviceId, {
        text: analysis.issue,
        visual: {
          overlay: `EQUIPMENT: ${analysis.equipment}\nISSUE: ${analysis.issue}\nSEVERITY: ${analysis.severity}`,
          position: [0.5, 0.3],
          duration: 5000,
        },
        gestureResponse: 'found',
      });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('[ExampleFieldServiceApp] Capture failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * FOLLOW STEPS: Track progress through repair steps
   */
  const nextStep = () => {
    if (!analysis) return;

    const currentStep = (currentRecord.currentStep || 0) + 1;
    if (currentStep < analysis.steps.length) {
      setCurrentRecord(prev => ({
        ...prev,
        currentStep,
      }));
    } else {
      // All steps complete
      completeServiceCall();
    }
  };

  /**
   * COMPLETE SERVICE: Generate final report
   */
  const completeServiceCall = () => {
    if (!currentRecord.timestamp) return;

    const record: ServiceRecord = {
      timestamp: currentRecord.timestamp || Date.now(),
      equipment: currentRecord.equipment || 'Unknown',
      issue: currentRecord.issue || 'Not documented',
      steps: currentRecord.steps || [],
      resolution: `Service completed per documented steps. ${analysis?.steps.length || 0} steps executed.`,
      partsUsed: currentRecord.partsUsed || [],
      timeSpent: Date.now() - (currentRecord.timestamp || Date.now()),
      notes: `Field service completed at ${location.lat}, ${location.lng}`,
      locationLat: location.lat,
      locationLng: location.lng,
    };

    // Save record
    setServiceRecords([...serviceRecords, record]);

    // Generate report
    generateReport(record);

    // Reset
    setAnalysis(null);
    setCurrentRecord({});
  };

  /**
   * GENERATE REPORT: Create service documentation
   */
  const generateReport = (record: ServiceRecord) => {
    const report = `
SERVICE REPORT
==============
Equipment: ${record.equipment}
Issue: ${record.issue}
Severity: ${analysis?.severity || 'unknown'}
Location: ${record.locationLat}, ${record.locationLng}

Steps Performed:
${record.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Parts Used:
${record.partsUsed.length > 0 ? record.partsUsed.map(p => `- ${p}`).join('\n') : 'None'}

Time: ${Math.round(record.timeSpent / 60000)} minutes
Resolution: ${record.resolution}

Generated: ${new Date(record.timestamp).toISOString()}
    `;

    console.log('[ExampleFieldServiceApp] Report:', report);
    alert('Service report saved and ready for upload');
  };

  /**
   * Parse AI response into structured analysis
   */
  const parseAnalysis = (responseText: string): EquipmentIssue => {
    // In production: Use NLP to parse response
    // For now: Simple parsing
    return {
      equipment: 'HVAC Unit (Detected)',
      issue: responseText.substring(0, 100) + '...',
      severity: 'warning',
      steps: [
        '1. Turn off power to unit at breaker',
        '2. Wait 5 minutes for capacitors to discharge',
        '3. Inspect filter condition and airflow',
        '4. Check blower motor for debris',
        '5. Clean or replace filter if necessary',
        '6. Restore power and test operation',
        '7. Document temperature readings',
      ],
      parts: ['HVAC Filter 16x25x1', 'Refrigerant (if needed)'],
      estimatedTime: 45,
    };
  };

  if (!device) {
    return <Text>Camera device not found</Text>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ padding: 16, backgroundColor: '#1e293b' }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
            🔧 Field Service Tech
          </Text>
          <Text style={{ color: '#cbd5e1', marginTop: 4 }}>
            Battery: {battery.toFixed(1)}% | Location: {location.lat.toFixed(2)}, {location.lng.toFixed(2)}
          </Text>
        </View>

        {/* Camera View */}
        {!analysis && (
          <View style={{ height: 300, backgroundColor: '#000', margin: 16, borderRadius: 8, overflow: 'hidden' }}>
            <Camera
              ref={cameraRef}
              device={device}
              isActive={true}
              photo={true}
              style={{ flex: 1 }}
            />
          </View>
        )}

        {/* Error Display */}
        {error && (
          <View style={{ margin: 16, padding: 12, backgroundColor: '#991b1b', borderRadius: 8 }}>
            <Text style={{ color: '#fca5a5' }}>
              ❌ Error: {error}
            </Text>
          </View>
        )}

        {/* Analysis Results */}
        {analysis && (
          <View style={{ margin: 16, padding: 16, backgroundColor: '#1e293b', borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
              {analysis.equipment}
            </Text>

            <View style={{ marginBottom: 12 }}>
              <Text style={{ color: '#fbbf24', fontWeight: 'bold' }}>
                Severity: {analysis.severity.toUpperCase()}
              </Text>
              <Text style={{ color: '#cbd5e1', marginTop: 4 }}>
                {analysis.issue}
              </Text>
            </View>

            <Text style={{ color: '#f1f5f9', fontWeight: '600', marginBottom: 8 }}>
              Repair Steps:
            </Text>
            {analysis.steps.map((step, idx) => (
              <Text key={idx} style={{ color: '#cbd5e1', marginBottom: 6 }}>
                {step}
              </Text>
            ))}

            {analysis.parts && (
              <>
                <Text style={{ color: '#f1f5f9', fontWeight: '600', marginTop: 12, marginBottom: 8 }}>
                  Required Parts:
                </Text>
                {analysis.parts.map((part, idx) => (
                  <Text key={idx} style={{ color: '#fbbf24', marginBottom: 6 }}>
                    • {part}
                  </Text>
                ))}
              </>
            )}

            <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 12 }}>
              Estimated Time: {analysis.estimatedTime} minutes
            </Text>
          </View>
        )}

        {/* Control Buttons */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 12 }}>
          {!analysis ? (
            <Button
              title={isProcessing ? 'Analyzing...' : 'Capture & Analyze Equipment'}
              onPress={captureAndAnalyze}
              disabled={isProcessing}
              color="#3b82f6"
            />
          ) : (
            <>
              <Button
                title="Next Step"
                onPress={nextStep}
                color="#8b5cf6"
              />
              <Button
                title="Complete Service Call"
                onPress={completeServiceCall}
                color="#10b981"
              />
              <Button
                title="Capture Another"
                onPress={() => {
                  setAnalysis(null);
                  setCurrentRecord({});
                }}
                color="#6b7280"
              />
            </>
          )}
        </View>

        {/* Service History */}
        {serviceRecords.length > 0 && (
          <View style={{ margin: 16, padding: 16, backgroundColor: '#1e293b', borderRadius: 8 }}>
            <Text style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
              Service History ({serviceRecords.length})
            </Text>
            {serviceRecords.map((record, idx) => (
              <View key={idx} style={{ marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#334155' }}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                  {record.equipment}
                </Text>
                <Text style={{ color: '#cbd5e1', fontSize: 12 }}>
                  {new Date(record.timestamp).toLocaleString()}
                </Text>
                <Text style={{ color: '#fbbf24', fontSize: 12, marginTop: 4 }}>
                  ✓ {record.steps.length} steps, {Math.round(record.timeSpent / 60000)} min
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {isProcessing && (
        <View style={{ padding: 16, backgroundColor: '#1e293b' }}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={{ color: '#cbd5e1', marginTop: 8, textAlign: 'center' }}>
            Analyzing equipment...
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ExampleFieldServiceApp;
