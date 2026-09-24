import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    console.log('✓ WISE² Trading app live');
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>WISE² Trading</Text>
          <Text style={styles.subtitle}>Mobile Trading Platform</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Portfolio</Text>
            <Text style={styles.cardValue}>$100,000</Text>
            <Text style={styles.cardText}>Account Balance</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Today P&L</Text>
            <Text style={[styles.cardValue, styles.positive]}>+$1,250</Text>
            <Text style={styles.cardText}>+1.25% Return</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Connected</Text>
            <Text style={[styles.cardValue, styles.success]}>✓ Active</Text>
            <Text style={styles.cardText}>API Ready</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Dashboard • Charts • Portfolio • Orders • Settings</Text>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050607',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00D9FF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#00FF7F',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  card: {
    backgroundColor: '#0d1117',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#00D9FF',
  },
  cardTitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 12,
    color: '#666',
  },
  positive: {
    color: '#00FF7F',
  },
  success: {
    color: '#00D9FF',
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    backgroundColor: '#0d1117',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
