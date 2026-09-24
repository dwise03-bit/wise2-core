import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChartsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Charts</Text>
      <Text style={styles.text}>Real-time price charts</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#050607' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#00D9FF' },
  text: { fontSize: 14, color: '#888' },
});
