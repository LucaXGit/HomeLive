import React, { useState } from 'react';

import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../navigation/AppNavigator';
import { useSavingsGoals } from '../../context/SavingsGoalContext';
import DatePickerField from '../../components/DatePickerField';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'EditSavingsGoal'
>;

export default function EditSavingsGoalScreen({
  route,
  navigation,
}: Props) {
  const {
    goals,
    updateGoal,
  } = useSavingsGoals();

  const goal = goals.find(
    (item) =>
      item.id === route.params.goalId
  );

  if (!goal) {
    return (
      <View style={styles.center}>
        <Text>
          Meta no encontrada.
        </Text>
      </View>
    );
  }

  const [name, setName] =
    useState(goal.name);

  const [targetAmount, setTargetAmount] =
    useState(
      goal.targetAmount.toString()
    );

  const [savedAmount, setSavedAmount] =
    useState(goal.savedAmount.toString());

  const [targetDate, setTargetDate] =
    useState(goal.targetDate ?? '');

  const [submitting, setSubmitting] =
    useState(false);

  const handleUpdate = async () => {
    const parsedTarget =
      Number(targetAmount);

    const parsedSaved =
      Number(savedAmount);

    if (!name.trim()) {
      Alert.alert(
        'Validación',
        'El nombre es obligatorio.'
      );
      return;
    }

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

      await updateGoal(
        goal.id,
        {
          name,
          targetAmount: parsedTarget,
          savedAmount: parsedSaved,
          targetDate:
            targetDate.trim() || undefined,
        }
      );

      navigation.goBack();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No fue posible actualizar la meta.';

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
        Editar meta
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre de la meta"
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
        onPress={handleUpdate}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting
            ? 'Guardando...'
            : 'Guardar cambios'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '600',
  },
});