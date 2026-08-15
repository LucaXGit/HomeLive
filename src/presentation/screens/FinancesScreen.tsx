import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FinancesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finanzas</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});