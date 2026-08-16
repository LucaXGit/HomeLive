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
import DatePickerField from '../../components/DatePickerField';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'EditPlanningItem'
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

export default function EditPlanningItemScreen({
  route,
  navigation,
}: Props) {
  const {
    items,
    updateItem,
  } = usePlanning();

  const item = items.find(
    (currentItem) =>
      currentItem.id ===
      route.params.planningItemId
  );

  if (!item) {
    return (
      <View style={styles.center}>
        <Text>
          Elemento de planificación no encontrado.
        </Text>
      </View>
    );
  }

  const [title, setTitle] =
    useState(item.title);

  const [description, setDescription] =
    useState(item.description ?? '');

  const [date, setDate] =
    useState(item.date);

  const [type, setType] =
    useState<PlanningItemType>(
      item.type
    );

  const [submitting, setSubmitting] =
    useState(false);

  const handleUpdate = async () => {
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

      await updateItem(
        item.id,
        {
          title: title.trim(),
          description:
            description.trim() ||
            undefined,
          date: date.trim(),
          type,
        }
      );

      navigation.goBack();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No fue posible actualizar la planificación.';

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
        Editar planificación
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
        {types.map((typeOption) => (
          <Pressable
            key={typeOption.value}
            style={[
              styles.typeButton,
              type ===
                typeOption.value &&
                styles.selected,
            ]}
            onPress={() =>
              setType(
                typeOption.value
              )
            }
          >
            <Text>
              {typeOption.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={styles.saveButton}
        onPress={handleUpdate}
        disabled={submitting}
      >
        <Text
          style={
            styles.saveButtonText
          }
        >
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