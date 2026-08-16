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
  View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../navigation/AppNavigator';
import { usePlanning } from '../context/PlanningContext';

import {
  addDays,
  formatDateKey,
  getShortDayName,
  getWeekDays,
  getWeekLabel,
  startOfWeek,
} from '../../utils/dateUtils';

type Props =
  NativeStackScreenProps<
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

  const initialWeekStart =
    startOfWeek(new Date());

  const [weekStart, setWeekStart] =
    useState(initialWeekStart);

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(
    formatDateKey(new Date())
  );

  const weekDays = useMemo(
    () => getWeekDays(weekStart),
    [weekStart]
  );

  const selectedItems = useMemo(
    () =>
      items
        .filter(
          (item) =>
            item.date === selectedDate
        )
        .sort((a, b) =>
          a.createdAt.localeCompare(
            b.createdAt
          )
        ),
    [items, selectedDate]
  );

  const goToPreviousWeek = () => {
    const newWeekStart =
      addDays(weekStart, -7);

    setWeekStart(newWeekStart);

    setSelectedDate(
      formatDateKey(newWeekStart)
    );
  };

  const goToNextWeek = () => {
    const newWeekStart =
      addDays(weekStart, 7);

    setWeekStart(newWeekStart);

    setSelectedDate(
      formatDateKey(newWeekStart)
    );
  };

  const goToCurrentWeek = () => {
    const today = new Date();

    setWeekStart(
      startOfWeek(today)
    );

    setSelectedDate(
      formatDateKey(today)
    );
  };

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
      data={selectedItems}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <Text style={styles.title}>
            Planificación semanal
          </Text>

          <Text
            style={styles.weekLabel}
          >
            {getWeekLabel(weekStart)}
          </Text>

          <View
            style={
              styles.weekNavigation
            }
          >
            <Pressable
              style={
                styles.navigationButton
              }
              onPress={
                goToPreviousWeek
              }
            >
              <Text>
                Semana anterior
              </Text>
            </Pressable>

            <Pressable
              style={
                styles.navigationButton
              }
              onPress={goToNextWeek}
            >
              <Text>
                Semana siguiente
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={
              styles.todayButton
            }
            onPress={
              goToCurrentWeek
            }
          >
            <Text>
              Ir a esta semana
            </Text>
          </Pressable>

          <View style={styles.days}>
            {weekDays.map(
              (date) => {
                const dateKey =
                  formatDateKey(date);

                const isSelected =
                  dateKey ===
                  selectedDate;

                const itemCount =
                  items.filter(
                    (item) =>
                      item.date ===
                      dateKey
                  ).length;

                return (
                  <Pressable
                    key={dateKey}
                    style={[
                      styles.dayButton,
                      isSelected &&
                        styles.selectedDay,
                    ]}
                    onPress={() =>
                      setSelectedDate(
                        dateKey
                      )
                    }
                  >
                    <Text
                      style={
                        styles.dayName
                      }
                    >
                      {getShortDayName(
                        date
                      )}
                    </Text>

                    <Text
                      style={
                        styles.dayNumber
                      }
                    >
                      {date.getDate()}
                    </Text>

                    <Text
                      style={
                        styles.itemCount
                      }
                    >
                      {itemCount}
                    </Text>
                  </Pressable>
                );
              }
            )}
          </View>

          <Pressable
            style={styles.addButton}
            onPress={() =>
              navigation.navigate(
                'CreatePlanningItem',
                {
                  initialDate:
                    selectedDate,
                }
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

          <Text
            style={
              styles.selectedDateTitle
            }
          >
            Actividades del{' '}
            {selectedDate}
          </Text>
        </>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text>
            No hay elementos para
            este día.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text
            style={styles.itemTitle}
          >
            {item.title}
          </Text>

          <Text>
            Tipo:{' '}
            {getTypeLabel(
              item.type
            )}
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
              <Text>
                Editar
              </Text>
            </Pressable>

            <Pressable
              style={
                styles.actionButton
              }
              onPress={() =>
                handleDelete(item.id)
              }
            >
              <Text>
                Eliminar
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    />
  );
}

const styles =
  StyleSheet.create({
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
      marginBottom: 8,
    },

    weekLabel: {
      fontSize: 16,
      marginBottom: 16,
    },

    weekNavigation: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 10,
    },

    navigationButton: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      alignItems: 'center',
    },

    todayButton: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 10,
      alignItems: 'center',
      marginBottom: 18,
    },

    days: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      gap: 4,
      marginBottom: 20,
    },

    dayButton: {
      flex: 1,
      minHeight: 82,
      borderWidth: 1,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 6,
    },

    selectedDay: {
      backgroundColor:
        '#e0e0e0',
      borderWidth: 2,
    },

    dayName: {
      fontSize: 12,
      fontWeight: '600',
    },

    dayNumber: {
      fontSize: 18,
      fontWeight: 'bold',
      marginVertical: 2,
    },

    itemCount: {
      fontSize: 12,
    },

    addButton: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 14,
      marginBottom: 20,
    },

    addButtonText: {
      textAlign: 'center',
      fontWeight: '600',
    },

    selectedDateTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
    },

    empty: {
      paddingVertical: 35,
      alignItems: 'center',
    },

    card: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
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