import React, { useState } from 'react';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../navigation/AppNavigator';
import { useSavingsGoals } from '../../context/SavingsGoalContext';
import DatePickerField from '../../components/DatePickerField';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'CreateSavingsGoal'
>;

export default function CreateSavingsGoalScreen({
  navigation,
}: Props) {
  const { createGoal } = useSavingsGoals();

  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] =
    useState('');
  const [savedAmount, setSavedAmount] =
    useState('');
  const [targetDate, setTargetDate] =
    useState('');
  const [submitting, setSubmitting] =
    useState(false);

  const handleSubmit = async () => {
    if (
      !name.trim() ||
      !targetAmount.trim()
    ) {
      Alert.alert(
        'Validación',
        'Completa nombre y cantidad objetivo.'
      );
      return;
    }

    const parsedTarget =
      Number(targetAmount);

    const parsedSaved =
      savedAmount.trim() === ''
        ? 0
        : Number(savedAmount);

    if (
      Number.isNaN(parsedTarget) ||
      parsedTarget <= 0
    ) {
      Alert.alert(
        'Validación',
        'La cantidad objetivo debe ser mayor a cero.'
      );
      return;
    }

    if (
      Number.isNaN(parsedSaved) ||
      parsedSaved < 0
    ) {
      Alert.alert(
        'Validación',
        'La cantidad ahorrada no puede ser negativa.'
      );
      return;
    }

    try {
      setSubmitting(true);

      await createGoal({
        name: name.trim(),
        targetAmount: parsedTarget,
        savedAmount: parsedSaved,
        targetDate:
          targetDate.trim() || undefined,
      });

      navigation.goBack();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No fue posible crear la meta.';

      Alert.alert(
        'Meta de ahorro',
        message
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>
        Nueva meta
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Cantidad objetivo"
        keyboardType="numeric"
        value={targetAmount}
        onChangeText={setTargetAmount}
      />

      <TextInput
        style={styles.input}
        placeholder="Cantidad ahorrada actualmente"
        keyboardType="numeric"
        value={savedAmount}
        onChangeText={setSavedAmount}
      />

      <DatePickerField
        label="Fecha objetivo"
        value={targetDate}
        onChange={setTargetDate}
        optional
      />

      <Pressable
        style={styles.button}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting
            ? 'Guardando...'
            : 'Crear meta'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
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