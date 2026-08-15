import React, { useState } from 'react';

import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useHousehold } from '../../context/HouseholdContext';

export default function CreateHouseholdScreen() {
  const { createHousehold } = useHousehold();

  const [name, setName] = useState('');
  const [submitting, setSubmitting] =
    useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert(
        'Validación',
        'Ingresa un nombre para tu hogar.'
      );
      return;
    }

    try {
      setSubmitting(true);

      await createHousehold(name);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No fue posible crear el hogar.';

      Alert.alert('Hogar', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Crea tu hogar
      </Text>

      <Text style={styles.description}>
        HomeLive organizará la información
        relacionada con este hogar.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ej. Casa Borges"
        value={name}
        onChangeText={setName}
      />

      <Pressable
        style={styles.button}
        onPress={handleCreate}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting
            ? 'Creando...'
            : 'Crear hogar'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  button: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});