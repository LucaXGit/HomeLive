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

import { RootStackParamList } from '../../navigation/AppNavigator';
import { useFinance } from '../context/FinanceContext';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Finances'
>;

export default function FinancesScreen({
  navigation,
}: Props) {
  const {
    transactions,
    loading,
    totalIncome,
    totalExpenses,
    balance,
    deleteTransaction,
  } = useFinance();

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar movimiento',
      '¿Seguro que deseas eliminar este movimiento?',
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
              await deleteTransaction(id);
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'No fue posible eliminar el movimiento.';

              Alert.alert(
                'Finanzas',
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
      <Text style={styles.title}>
        Finanzas
      </Text>

      <View style={styles.summary}>
        <Text>
          Ingresos: ${totalIncome.toFixed(2)}
        </Text>

        <Text>
          Gastos: ${totalExpenses.toFixed(2)}
        </Text>

        <Text style={styles.balance}>
          Balance: ${balance.toFixed(2)}
        </Text>
      </View>

      <Pressable
        style={styles.addButton}
        onPress={() =>
          navigation.navigate(
            'CreateTransaction'
          )
        }
      >
        <Text style={styles.addButtonText}>
          Registrar movimiento
        </Text>
      </Pressable>

      {transactions.length === 0 ? (
        <View style={styles.center}>
          <Text>
            No hay movimientos registrados.
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...transactions].reverse()}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.transactionType}>
                {item.type === 'income'
                  ? 'Ingreso'
                  : 'Gasto'}
              </Text>

              <Text>
                ${item.amount.toFixed(2)}
              </Text>

              <Text>
                Categoría: {item.category}
              </Text>

              <Text>
                Fecha: {item.date}
              </Text>

              {item.description && (
                <Text>
                  {item.description}
                </Text>
              )}

              <Pressable
                style={styles.deleteButton}
                onPress={() =>
                  handleDelete(item.id)
                }
              >
                <Text>Eliminar</Text>
              </Pressable>
            </View>
          )}
        />
      )}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summary: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    gap: 6,
  },
  balance: {
    fontWeight: 'bold',
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
  list: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  transactionType: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  deleteButton: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
});