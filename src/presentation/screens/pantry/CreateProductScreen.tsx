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
import { ProductLocation } from '../../../domain/entities';
import { isValidExpirationDate } from '../../../domain/usecases/productStatus';
import { usePantry } from '../../context/PantryContext';
import DatePickerField from '../../components/DatePickerField';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'CreateProduct'
>;

export default function CreateProductScreen({
  navigation,
}: Props) {
  const { createProduct } = usePantry();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [purchaseDate, setPurchaseDate] =
    useState('');
  const [expirationDate, setExpirationDate] =
    useState('');

  const [location, setLocation] =
    useState<ProductLocation>('pantry');

  const [submitting, setSubmitting] =
    useState(false);

  const handleSubmit = async () => {
    if (
      !name.trim() ||
      !category.trim() ||
      !quantity.trim() ||
      !unit.trim()
    ) {
      Alert.alert(
        'Validación',
        'Completa los campos obligatorios.'
      );

      return;
    }

    const parsedQuantity = Number(quantity);

    if (
      Number.isNaN(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      Alert.alert(
        'Validación',
        'La cantidad debe ser un número válido.'
      );

      return;
    }

    if (
      expirationDate.trim() &&
      !isValidExpirationDate(expirationDate.trim())
    ) {
      Alert.alert(
        'Validación',
        'La fecha de caducidad debe tener el formato YYYY-MM-DD.'
      );
      return;
    }

    try {
      setSubmitting(true);

      await createProduct({
        name,
        category,
        quantity: parsedQuantity,
        unit,
        purchaseDate:
          purchaseDate.trim() || undefined,
        expirationDate:
          expirationDate.trim() || undefined,
        location,
      });

      navigation.goBack();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No fue posible registrar el producto.';

      Alert.alert(
        'Producto',
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
        Registrar producto
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Categoría"
        value={category}
        onChangeText={setCategory}
      />

      <TextInput
        style={styles.input}
        placeholder="Cantidad"
        keyboardType="numeric"
        value={quantity}
        onChangeText={setQuantity}
      />

      <TextInput
        style={styles.input}
        placeholder="Unidad (kg, piezas, litros...)"
        value={unit}
        onChangeText={setUnit}
      />

      <DatePickerField
        label="Fecha de compra"
        value={purchaseDate}
        onChange={setPurchaseDate}
        optional
      />

      <DatePickerField
        label="Fecha de caducidad"
        value={expirationDate}
        onChange={setExpirationDate}
        optional
      />

      <Text style={styles.label}>
        Ubicación
      </Text>

      <View style={styles.locationContainer}>
        <Pressable
          style={[
            styles.locationButton,
            location === 'pantry' &&
              styles.selectedButton,
          ]}
          onPress={() =>
            setLocation('pantry')
          }
        >
          <Text>
            Despensa
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.locationButton,
            location === 'refrigerator' &&
              styles.selectedButton,
          ]}
          onPress={() =>
            setLocation('refrigerator')
          }
        >
          <Text>
            Refrigerador
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.saveButton}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.saveButtonText}>
          {submitting
            ? 'Guardando...'
            : 'Guardar producto'}
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  locationContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  locationButton: {
    flex: 1,
    padding: 14,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#e0e0e0',
  },
  saveButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  saveButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});