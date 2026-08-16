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
import {
  PaymentMethod,
  TransactionType,
} from '../../../domain/entities';
import { useFinance } from '../../context/FinanceContext';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'EditTransaction'
>;

export default function EditTransactionScreen({
  route,
  navigation,
}: Props) {
  const {
    transactions,
    updateTransaction,
  } = useFinance();

  const transaction =
    transactions.find(
      (item) =>
        item.id ===
        route.params.transactionId
    );

  if (!transaction) {
    return (
      <View style={styles.center}>
        <Text>
          Movimiento no encontrado.
        </Text>
      </View>
    );
  }

  const [type, setType] =
    useState<TransactionType>(
      transaction.type
    );

  const [amount, setAmount] = useState(
    transaction.amount.toString()
  );

  const [category, setCategory] =
    useState(transaction.category);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>(
      transaction.paymentMethod
    );

  const [date, setDate] =
    useState(transaction.date);

  const [description, setDescription] =
    useState(
      transaction.description ?? ''
    );

  const [submitting, setSubmitting] =
    useState(false);

  const handleUpdate = async () => {
    if (
      !amount.trim() ||
      !category.trim() ||
      !date.trim()
    ) {
      Alert.alert(
        'Validación',
        'Completa monto, categoría y fecha.'
      );

      return;
    }

    const parsedAmount =
      Number(amount);

    if (
      Number.isNaN(parsedAmount) ||
      parsedAmount <= 0
    ) {
      Alert.alert(
        'Validación',
        'El monto debe ser mayor a cero.'
      );

      return;
    }

    try {
      setSubmitting(true);

      await updateTransaction(
        transaction.id,
        {
          type,
          amount: parsedAmount,
          category,
          paymentMethod,
          date: date.trim(),
          description,
        }
      );

      navigation.goBack();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No fue posible actualizar el movimiento.';

      Alert.alert(
        'Finanzas',
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
        Editar movimiento
      </Text>

      <Text style={styles.label}>
        Tipo
      </Text>

      <View style={styles.row}>
        <Pressable
          style={[
            styles.optionButton,
            type === 'income' &&
              styles.selected,
          ]}
          onPress={() =>
            setType('income')
          }
        >
          <Text>Ingreso</Text>
        </Pressable>

        <Pressable
          style={[
            styles.optionButton,
            type === 'expense' &&
              styles.selected,
          ]}
          onPress={() =>
            setType('expense')
          }
        >
          <Text>Gasto</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Monto"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TextInput
        style={styles.input}
        placeholder="Categoría"
        value={category}
        onChangeText={setCategory}
      />

      <TextInput
        style={styles.input}
        placeholder="Fecha YYYY-MM-DD"
        value={date}
        onChangeText={setDate}
      />

      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>
        Método de pago
      </Text>

      {[
        ['cash', 'Efectivo'],
        ['debit_card', 'Débito'],
        ['credit_card', 'Crédito'],
        ['bank_transfer', 'Transferencia'],
        ['other', 'Otro'],
      ].map(([value, label]) => (
        <Pressable
          key={value}
          style={[
            styles.paymentButton,
            paymentMethod === value &&
              styles.selected,
          ]}
          onPress={() =>
            setPaymentMethod(
              value as PaymentMethod
            )
          }
        >
          <Text>{label}</Text>
        </Pressable>
      ))}

      <Pressable
        style={styles.saveButton}
        onPress={handleUpdate}
        disabled={submitting}
      >
        <Text
          style={styles.saveButtonText}
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#e0e0e0',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  paymentButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  saveButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginTop: 14,
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});