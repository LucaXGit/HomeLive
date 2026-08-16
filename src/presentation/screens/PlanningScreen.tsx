import React, {
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/AppNavigator';
import { usePlanning } from '../context/PlanningContext';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Planning'
>;

export default function PlanningScreen({
  navigation,
}: Props) {
  const {
    items,
    loading,
    toggleCompleted,
    deleteItem,
  } = usePlanning();

  const [dateFilter, setDateFilter] =
    useState('');

  const filteredItems = useMemo(() => {
    const filtered =
      dateFilter.trim()
        ? items.filter(
            (item) =>
              item.date ===
              dateFilter.trim()
          )
        : items;

    return [...filtered].sort(
      (a, b) =>
        a.date.localeCompare(b.date)
    );
  }, [items, dateFilter]);

  const handleDelete = (
    id: string
  ) => {
    Alert.alert(
      'Eliminar planificación',
      '¿Seguro que deseas eliminar este elemento?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteItem(id);
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'No fue posible eliminar el elemento.';

              Alert.alert(
                'Planificación',
                message
              );
            }
          },
        },
      ]
    );
  };

  const getTypeLabel = (
    type: string
  ) => {
    switch (type) {
      case 'meal':
        return 'Comida';

      case 'recipe':
        return 'Receta';

      case 'activity':
        return 'Actividad';

      case 'task':
        return 'Tarea';

      case 'reminder':
        return 'Recordatorio';

      default:
        return type;
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
        />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={
        styles.content
      }
      data={filteredItems}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>
            Planificación semanal
          </Text>

          <Pressable
            style={styles.addButton}
            onPress={() =>
              navigation.navigate(
                'CreatePlanningItem'
              )
            }
          >
            <Text
              style={
                styles.addButtonText
              }
            >
              Nueva planificación
            </Text>
          </Pressable>

          <TextInput
            style={styles.input}
            placeholder="Filtrar por fecha YYYY-MM-DD"
            value={dateFilter}
            onChangeText={
              setDateFilter
            }
          />

          {dateFilter !== '' && (
            <Pressable
              style={
                styles.clearButton
              }
              onPress={() =>
                setDateFilter('')
              }
            >
              <Text>
                Mostrar todos los días
              </Text>
            </Pressable>
          )}
        </>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text>
            No hay elementos de
            planificación.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.date}>
            {item.date}
          </Text>

          <Text style={styles.itemTitle}>
            {item.title}
          </Text>

          <Text>
            Tipo:{' '}
            {getTypeLabel(item.type)}
          </Text>

          {item.description && (
            <Text>
              {item.description}
            </Text>
          )}

          <Text>
            Estado:{' '}
            {item.completed
              ? 'Completado'
              : 'Pendiente'}
          </Text>

          <View style={styles.actions}>
            <Pressable
              style={
                styles.actionButton
              }
              onPress={() =>
                toggleCompleted(
                  item.id
                )
              }
            >
              <Text>
                {item.completed
                  ? 'Marcar pendiente'
                  : 'Completar'}
              </Text>
            </Pressable>

            <Pressable
              style={
                styles.actionButton
              }
              onPress={() =>
                navigation.navigate(
                  'EditPlanningItem',
                  {
                    planningItemId:
                      item.id,
                  }
                )
              }
            >
              <Text>Editar</Text>
            </Pressable>

            <Pressable
              style={
                styles.actionButton
              }
              onPress={() =>
                handleDelete(item.id)
              }
            >
              <Text>Eliminar</Text>
            </Pressable>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  addButtonText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  clearButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  empty: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  date: {
    fontWeight: '600',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  actions: {
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
});