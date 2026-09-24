import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>WISE² Trading</Text>
      <Text style={styles.subtitle}>Dashboard</Text>
      <Text style={styles.text}>Portfolio: $100,000</Text>
      <Text style={styles.text}>P&L: +$1,250 (+1.25%)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#050607',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00D9FF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#00FF7F',
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    marginVertical: 8,
  },
});
