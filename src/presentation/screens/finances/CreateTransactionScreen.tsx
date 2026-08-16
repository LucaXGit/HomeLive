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
import DatePickerField from '../../components/DatePickerField';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'CreateTransaction'
>;

export default function CreateTransactionScreen({
  navigation,
}: Props) {
  const { createTransaction } = useFinance();

  const [type, setType] =
    useState<TransactionType>('expense');

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('cash');

  const [date, setDate] = useState('');
  const [description, setDescription] =
    useState('');

  const [submitting, setSubmitting] =
    useState(false);

  const handleSubmit = async () => {
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

    const parsedAmount = Number(amount);

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

      await createTransaction({
        type,
        amount: parsedAmount,
        category: category.trim(),
        paymentMethod,
        date: date.trim(),
        description:
          description.trim() || undefined,
      });

      navigation.goBack();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No fue posible registrar el movimiento.';

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
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>
        Registrar movimiento
      </Text>

      <Text style={styles.label}>Tipo</Text>

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

      <DatePickerField
        label="Fecha del movimiento"
        value={date}
        onChange={setDate}
      />

      <TextInput
        style={styles.input}
        placeholder="Descripción opcional"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>
        Método de pago
      </Text>

      <View style={styles.paymentContainer}>
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
      </View>

      <Pressable
        style={styles.saveButton}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.saveButtonText}>
          {submitting
            ? 'Guardando...'
            : 'Guardar movimiento'}
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
  paymentContainer: {
    gap: 10,
    marginBottom: 24,
  },
  paymentButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  saveButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  saveButtonText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});