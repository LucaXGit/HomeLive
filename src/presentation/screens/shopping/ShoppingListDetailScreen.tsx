import React, { useState } from 'react';

import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../../navigation/AppNavigator';
import { useShoppingLists } from '../../context/ShoppingListContext';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'ShoppingListDetail'
>;

export default function ShoppingListDetailScreen({
  route,
}: Props) {
  const {
    lists,
    addItem,
    toggleItemPurchased,
    removeItem,
  } = useShoppingLists();

  const list = lists.find(
    (item) =>
      item.id === route.params.listId
  );

  const [name, setName] = useState('');
  const [quantity, setQuantity] =
    useState('');
  const [unit, setUnit] = useState('');

  if (!list) {
    return (
      <View style={styles.center}>
        <Text>
          Lista no encontrada.
        </Text>
      </View>
    );
  }

  const handleAddItem = async () => {
    if (
      !name.trim() ||
      !quantity.trim()
    ) {
      Alert.alert(
        'Validación',
        'Ingresa nombre y cantidad.'
      );

      return;
    }

    const parsedQuantity =
      Number(quantity);

    if (
      Number.isNaN(parsedQuantity) ||
      parsedQuantity <= 0
    ) {
      Alert.alert(
        'Validación',
        'La cantidad debe ser mayor a cero.'
      );

      return;
    }

    try {
      await addItem(
        list.id,
        name.trim(),
        parsedQuantity,
        unit.trim() || undefined
      );

      setName('');
      setQuantity('');
      setUnit('');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No fue posible agregar el artículo.';

      Alert.alert(
        'Lista de compras',
        message
      );
    }
  };

  const handleRemoveItem = (
    itemId: string
  ) => {
    Alert.alert(
      'Eliminar artículo',
      '¿Seguro que deseas eliminar este artículo?',
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
              await removeItem(
                list.id,
                itemId
              );
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'No fue posible eliminar el artículo.';

              Alert.alert(
                'Lista de compras',
                message
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {list.name}
      </Text>

      <Text style={styles.status}>
        Estado:{' '}
        {list.status === 'active'
          ? 'Activa'
          : 'Completada'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Artículo"
        value={name}
        onChangeText={setName}
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
        placeholder="Unidad opcional"
        value={unit}
        onChangeText={setUnit}
      />

      <Pressable
        style={styles.addButton}
        onPress={handleAddItem}
      >
        <Text style={styles.addButtonText}>
          Agregar artículo
        </Text>
      </Pressable>

      <FlatList
        data={list.items}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>
              La lista no tiene artículos.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.itemName}>
              {item.name}
            </Text>

            <Text>
              Cantidad: {item.quantity}{' '}
              {item.unit ?? ''}
            </Text>

            <Text>
              Estado:{' '}
              {item.status === 'pending'
                ? 'Pendiente'
                : 'Comprado'}
            </Text>

            <View style={styles.actions}>
              <Pressable
                style={styles.actionButton}
                onPress={() =>
                  toggleItemPurchased(
                    list.id,
                    item.id
                  )
                }
              >
                <Text>
                  {item.status === 'pending'
                    ? 'Marcar comprado'
                    : 'Marcar pendiente'}
                </Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() =>
                  handleRemoveItem(
                    item.id
                  )
                }
              >
                <Text>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        )}
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
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
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
  card: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
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