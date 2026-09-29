import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>WISE² Trading Dashboard</Text>
      <Text style={styles.subtitle}>Portfolio Value: $100,000</Text>
      <Text style={styles.subtitle}>Today P&L: +$1,250 (+1.25%)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050607' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#00D9FF', marginBottom: 20 },
  subtitle: { fontSize: 16, color: '#fff', marginVertical: 8 },
});
