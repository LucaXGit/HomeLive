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
import { PlanningItemType } from '../../../domain/entities';
import { usePlanning } from '../../context/PlanningContext';
import { formatDateKey } from '../../../utils/dateUtils';
import DatePickerField from '../../components/DatePickerField';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'CreatePlanningItem'
>;

const types: {
  value: PlanningItemType;
  label: string;
}[] = [
  {
    value: 'meal',
    label: 'Comida',
  },
  {
    value: 'recipe',
    label: 'Receta',
  },
  {
    value: 'activity',
    label: 'Actividad',
  },
  {
    value: 'task',
    label: 'Tarea',
  },
  {
    value: 'reminder',
    label: 'Recordatorio',
  },
];

export default function CreatePlanningItemScreen({
  navigation,
  route,
}: Props) {
  const { createItem } = usePlanning();

  const [title, setTitle] = useState('');
  const [description, setDescription] =
    useState('');
  const [date, setDate] = useState(
    route.params?.initialDate ??
      formatDateKey(new Date())
  );

  const [type, setType] =
    useState<PlanningItemType>('task');

  const [submitting, setSubmitting] =
    useState(false);

  const handleSubmit = async () => {
    if (
      !title.trim() ||
      !date.trim()
    ) {
      Alert.alert(
        'Validación',
        'Completa título y fecha.'
      );

      return;
    }

    try {
      setSubmitting(true);

      await createItem({
        title: title.trim(),
        description:
          description.trim() ||
          undefined,
        date: date.trim(),
        type,
        completed: false,
      });

      navigation.goBack();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No fue posible crear la planificación.';

      Alert.alert(
        'Planificación',
        message
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={
        styles.container
      }
    >
      <Text style={styles.title}>
        Nueva planificación
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Título"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={[
          styles.input,
          styles.description,
        ]}
        placeholder="Descripción opcional"
        multiline
        value={description}
        onChangeText={setDescription}
      />

      <DatePickerField
        label="Fecha"
        value={date}
        onChange={setDate}
      />

      <Text style={styles.label}>
        Tipo
      </Text>

      <View style={styles.typeContainer}>
        {types.map((item) => (
          <Pressable
            key={item.value}
            style={[
              styles.typeButton,
              type === item.value &&
                styles.selected,
            ]}
            onPress={() =>
              setType(item.value)
            }
          >
            <Text>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.saveButton}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text
          style={styles.saveButtonText}
        >
          {submitting
            ? 'Guardando...'
            : 'Guardar'}
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
  description: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  typeContainer: {
    gap: 10,
    marginBottom: 24,
  },
  typeButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  selected: {
    backgroundColor: '#e0e0e0',
  },
  saveButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  saveButtonText: {
    textAlign: 'center',
    fontWeight: '600',
  },
});