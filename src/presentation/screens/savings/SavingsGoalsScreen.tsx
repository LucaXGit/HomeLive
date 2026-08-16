import React from 'react';

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

import { RootStackParamList } from '../../../navigation/AppNavigator';
import { useSavingsGoals } from '../../context/SavingsGoalContext';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'SavingsGoals'
>;

export default function SavingsGoalsScreen({
  navigation,
}: Props) {
  const {
    goals,
    loading,
    deleteGoal,
  } = useSavingsGoals();

  const handleDelete = (
    id: string
  ) => {
    Alert.alert(
      'Eliminar meta',
      '¿Seguro que deseas eliminar esta meta?',
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
              await deleteGoal(id);
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'No fue posible eliminar la meta.';

              Alert.alert(
                'Meta de ahorro',
                message
              );
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.addButton}
        onPress={() =>
          navigation.navigate(
            'CreateSavingsGoal'
          )
        }
      >
        <Text style={styles.addButtonText}>
          Nueva meta
        </Text>
      </Pressable>

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>
              No hay metas de ahorro.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const percentage =
            item.targetAmount > 0
              ? Math.min(
                  100,
                  (item.savedAmount /
                    item.targetAmount) *
                    100
                )
              : 0;

          return (
            <View style={styles.card}>
              <Text style={styles.name}>
                {item.name}
              </Text>

              <Text>
                Objetivo: $
                {item.targetAmount.toFixed(2)}
              </Text>

              <Text>
                Ahorrado: $
                {item.savedAmount.toFixed(2)}
              </Text>

              <Text>
                Progreso:{' '}
                {percentage.toFixed(1)}%
              </Text>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${percentage}%`,
                    },
                  ]}
                />
              </View>

              {item.targetDate && (
                <Text>
                  Fecha objetivo:{' '}
                  {item.targetDate}
                </Text>
              )}

              <Text>
                Estado:{' '}
                {item.status === 'active'
                  ? 'Activa'
                  : item.status ===
                    'completed'
                  ? 'Completada'
                  : 'Cancelada'}
              </Text>

              <View style={styles.actions}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate(
                      'EditSavingsGoal',
                      {
                        goalId: item.id,
                      }
                    )
                  }
                >
                  <Text>Editar</Text>
                </Pressable>

                <Pressable
                  style={styles.actionButton}
                  onPress={() =>
                    handleDelete(item.id)
                  }
                >
                  <Text>Eliminar</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressTrack: {
    height: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#d0d0d0',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
});