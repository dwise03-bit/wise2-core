import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OrdersScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Orders</Text>
      <Text style={styles.text}>Trade Execution</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050607' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#00D9FF' },
  text: { fontSize: 14, color: '#888' },
});
