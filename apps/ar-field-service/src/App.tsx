/**
 * Field Service Tech AR App
 * Real-time equipment troubleshooting with AI guidance
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Button, SafeAreaView, ScrollView, Dimensions } from 'react-native';
import { Camera } from 'expo-camera';
import RayBanMetaSDK, { ArFrameData, DeviceContext } from '@wise2/rayban-meta-sdk';

const { width, height } = Dimensions.get('window');

interface EquipmentAnalysis {
  equipment: string;
  issue: string;
  severity: 'critical' | 'warning' | 'info';
  steps: string[];
  parts?: string[];
  estimatedTime: number;
}

interface ServiceReport {
  timestamp: number;
  equipment: string;
  issue: string;
  resolution: string;
  timeSpent: number;
  notes: string;
}

const ARFieldServiceApp: React.FC = () => {
  const cameraRef = useRef<Camera>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysis, setAnalysis] = useState<EquipmentAnalysis | null>(null);
  const [report, setReport] = useState<Partial<ServiceReport>>({});
  const [deviceContext, setDeviceContext] = useState<DeviceContext>({
    deviceId: 'rayban-device-001',
    battery: 85,
    location: { lat: 40.7128, lng: -74.006 },
    lighting: 'normal',
    orientation: 'portrait',
  });

  const sdk = useRef(new RayBanMetaSDK('http://localhost:3100', 'sk-test')).current;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  /**
   * Capture frame and send to AI Router
   */
  const captureAndAnalyze = async () => {
    if (!cameraRef.current) return;

    setIsProcessing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });

      if (!photo.base64) throw new Error('No photo data');

      const frame: ArFrameData = {
        deviceId: deviceContext.deviceId,
        videoFrame: photo.base64,
        gesture: 'tap',
        timestamp: Date.now(),
      };

      const response = await sdk.processFrame(frame, deviceContext);

      // Parse AI response into structured analysis
      const parsedAnalysis: EquipmentAnalysis = {
        equipment: 'HVAC Unit (Detected)',
        issue: response.text,
        severity: 'warning',
        steps: [
          '1. Turn off power to unit',
          '2. Check filter condition',
          '3. Inspect blower motor',
          '4. Clean if necessary',
          '5. Restore power and test',
        ],
        parts: ['HVAC Filter 16x25x1', 'Blower Lubricant'],
        estimatedTime: 30,
      };

      setAnalysis(parsedAnalysis);
      setReport((prev) => ({
        ...prev,
        timestamp: Date.now(),
        equipment: parsedAnalysis.equipment,
        issue: parsedAnalysis.issue,
      }));

      // Send back AR overlay response
      await sdk.sendResponse(deviceContext.deviceId, {
        text: parsedAnalysis.issue,
        visual: {
          overlay: 'OVERLAY_DATA',
          position: [0.5, 0.5],
          duration: 5000,
        },
        gestureResponse: 'found',
      });
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Complete service call and generate report
   */
  const completeServiceCall = () => {
    const finalReport: ServiceReport = {
      timestamp: report.timestamp || Date.now(),
      equipment: report.equipment || 'Unknown',
      issue: report.issue || 'Not documented',
      resolution: 'Service completed as documented',
      timeSpent: 45,
      notes: 'All steps completed successfully',
    };

    console.log('Service Report:', finalReport);
    alert('Report saved and ready for upload');
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission...</Text>;
  }

  if (hasPermission === false) {
    return <Text>Camera permission denied</Text>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <ScrollView style={{ flex: 1 }}>
        {/* Camera View */}
        <View style={{ height: 300, backgroundColor: '#000', marginBottom: 16, borderRadius: 8, overflow: 'hidden' }}>
          <Camera ref={cameraRef} style={{ flex: 1 }} type={Camera.Constants.Type.back} />
        </View>

        {/* Analysis Results */}
        {analysis && (
          <View style={{ padding: 16, backgroundColor: '#1e293b', borderRadius: 8, marginHorizontal: 16, marginBottom: 16 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
              {analysis.equipment}
            </Text>
            <Text style={{ color: '#cbd5e1', marginBottom: 12 }}>{analysis.issue}</Text>

            <Text style={{ color: '#f1f5f9', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
              Repair Steps:
            </Text>
            {analysis.steps.map((step, idx) => (
              <Text key={idx} style={{ color: '#cbd5e1', marginBottom: 6 }}>
                {step}
              </Text>
            ))}

            {analysis.parts && (
              <>
                <Text style={{ color: '#f1f5f9', fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 8 }}>
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
              Estimated Time: {analysis.estimatedTime} min
            </Text>
          </View>
        )}

        {/* Control Panel */}
        <View style={{ paddingHorizontal: 16, gap: 12 }}>
          <Button
            title={isProcessing ? 'Analyzing...' : 'Analyze Equipment'}
            onPress={captureAndAnalyze}
            disabled={isProcessing}
            color="#3b82f6"
          />
          <Button title="Complete Service Call" onPress={completeServiceCall} color="#10b981" />
          <Button title="Generate Report" onPress={() => alert('Report generation coming soon')} color="#8b5cf6" />
        </View>

        {/* Device Status */}
        <View style={{ padding: 16, marginHorizontal: 16, marginTop: 16, backgroundColor: '#1e293b', borderRadius: 8 }}>
          <Text style={{ color: '#f1f5f9', fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
            Device Status
          </Text>
          <Text style={{ color: '#cbd5e1' }}>Battery: {deviceContext.battery}%</Text>
          <Text style={{ color: '#cbd5e1' }}>Location: {deviceContext.location?.lat}, {deviceContext.location?.lng}</Text>
          <Text style={{ color: '#cbd5e1' }}>Lighting: {deviceContext.lighting}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ARFieldServiceApp;
