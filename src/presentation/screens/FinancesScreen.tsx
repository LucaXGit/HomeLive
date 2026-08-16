import React, { useMemo, useState } from 'react';

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
import { useFinance } from '../context/FinanceContext';
import DatePickerField from '../components/DatePickerField';

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

  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredTransactions = useMemo(() => {
    const normalizedCategory =
      categoryFilter.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesCategory =
        !normalizedCategory ||
        transaction.category
          .toLowerCase()
          .includes(normalizedCategory);

      const matchesStartDate =
        !startDate.trim() ||
        transaction.date >= startDate.trim();

      const matchesEndDate =
        !endDate.trim() ||
        transaction.date <= endDate.trim();

      return (
        matchesCategory &&
        matchesStartDate &&
        matchesEndDate
      );
    });
  }, [
    transactions,
    categoryFilter,
    startDate,
    endDate,
  ]);

  const filteredIncome = useMemo(
    () =>
      filteredTransactions
        .filter(
          (transaction) =>
            transaction.type === 'income'
        )
        .reduce(
          (total, transaction) =>
            total + transaction.amount,
          0
        ),
    [filteredTransactions]
  );

  const filteredExpenses = useMemo(
    () =>
      filteredTransactions
        .filter(
          (transaction) =>
            transaction.type === 'expense'
        )
        .reduce(
          (total, transaction) =>
            total + transaction.amount,
          0
        ),
    [filteredTransactions]
  );

  const filteredBalance =
    filteredIncome - filteredExpenses;

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
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={[...filteredTransactions].reverse()}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={() => (
        <>
          <Text style={styles.title}>Finanzas</Text>

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
              navigation.navigate('CreateTransaction')
            }
          >
            <Text style={styles.addButtonText}>
              Registrar movimiento
            </Text>
          </Pressable>

          <Pressable
            style={styles.addButton}
            onPress={() =>
              navigation.navigate('SavingsGoals')
            }
          >
            <Text style={styles.addButtonText}>
              Metas de ahorro
            </Text>
          </Pressable>

          <View style={styles.filters}>
            <Text style={styles.filterTitle}>Filtros</Text>

            <TextInput
              style={styles.input}
              placeholder="Categoría"
              value={categoryFilter}
              onChangeText={setCategoryFilter}
            />

            <DatePickerField
              label="Desde"
              value={startDate}
              onChange={setStartDate}
              optional
            />

            <DatePickerField
              label="Hasta"
              value={endDate}
              onChange={setEndDate}
              optional
            />

            <Pressable
              style={styles.clearButton}
              onPress={() => {
                setCategoryFilter('');
                setStartDate('');
                setEndDate('');
              }}
            >
              <Text>Limpiar filtros</Text>
            </Pressable>
          </View>

          <View style={styles.filteredSummary}>
            <Text>
              Ingresos filtrados: ${filteredIncome.toFixed(2)}
            </Text>

            <Text>
              Gastos filtrados: ${filteredExpenses.toFixed(2)}
            </Text>

            <Text style={styles.balance}>
              Balance filtrado: ${filteredBalance.toFixed(2)}
            </Text>
          </View>

          <Text style={styles.historyTitle}>Historial</Text>
        </>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text>No se encontraron movimientos.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.transactionType}>
            {item.type === 'income' ? 'Ingreso' : 'Gasto'}
          </Text>

          <Text>${item.amount.toFixed(2)}</Text>

          <Text>Categoría: {item.category}</Text>

          <Text>Fecha: {item.date}</Text>

          {item.description && <Text>{item.description}</Text>}

          <View style={styles.actions}>
            <Pressable
              style={styles.actionButton}
              onPress={() =>
                navigation.navigate('EditTransaction', {
                  transactionId: item.id,
                })
              }
            >
              <Text>Editar</Text>
            </Pressable>

            <Pressable
              style={styles.actionButton}
              onPress={() => handleDelete(item.id)}
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
  filters: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
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
  },
  filteredSummary: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    gap: 6,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  list: {
    gap: 12,
  },
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  transactionType: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
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