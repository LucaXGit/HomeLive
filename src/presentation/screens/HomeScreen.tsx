import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>HomeLive</Text>
      <Text style={styles.subtitle}>Gestión inteligente del hogar</Text>

      <View style={styles.menu}>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate('Pantry')}
        >
          <Text style={styles.buttonText}>Despensa</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate('Finances')}
        >
          <Text style={styles.buttonText}>Finanzas</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate('Shopping')}
        >
          <Text style={styles.buttonText}>Compras</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate('Planning')}
        >
          <Text style={styles.buttonText}>Planificación</Text>
        </Pressable>

        <Pressable
          style={styles.logoutButton}
          onPress={logout}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },
  menu: {
    gap: 16,
  },
  button: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },
  logoutButton: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  logoutText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
    color: '#dc3545',
  },
});