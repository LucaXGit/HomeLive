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

type Props = NativeStackScreenProps<
  RootStackParamList,
  'EditProduct'
>;

export default function EditProductScreen({
  route,
  navigation,
}: Props) {
  const { products, updateProduct } = usePantry();

  const product = products.find(
    (item) => item.id === route.params.productId
  );

  if (!product) {
    return (
      <View style={styles.center}>
        <Text>Producto no encontrado.</Text>
      </View>
    );
  }

  const [name, setName] = useState(product.name);
  const [category, setCategory] = useState(product.category);
  const [quantity, setQuantity] = useState(
    product.quantity.toString()
  );
  const [unit, setUnit] = useState(product.unit);
  const [expirationDate, setExpirationDate] = useState(
    product.expirationDate ?? ''
  );
  const [location, setLocation] =
    useState<ProductLocation>(product.location);

  const [submitting, setSubmitting] = useState(false);

  const handleUpdate = async () => {
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

      await updateProduct(product.id, {
        name: name.trim(),
        category: category.trim(),
        quantity: parsedQuantity,
        unit: unit.trim(),
        expirationDate:
          expirationDate.trim() || undefined,
        location,
      });

      navigation.goBack();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No fue posible actualizar el producto.';

      Alert.alert('Producto', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Editar producto</Text>

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
        placeholder="Unidad"
        value={unit}
        onChangeText={setUnit}
      />

      <TextInput
        style={styles.input}
        placeholder="Caducidad YYYY-MM-DD"
        value={expirationDate}
        onChangeText={setExpirationDate}
      />

      <Text style={styles.label}>Ubicación</Text>

      <View style={styles.locationContainer}>
        <Pressable
          style={[
            styles.locationButton,
            location === 'pantry' &&
              styles.selectedButton,
          ]}
          onPress={() => setLocation('pantry')}
        >
          <Text>Despensa</Text>
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
          <Text>Refrigerador</Text>
        </Pressable>
      </View>

      <Pressable
        style={styles.saveButton}
        onPress={handleUpdate}
        disabled={submitting}
      >
        <Text style={styles.saveButtonText}>
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