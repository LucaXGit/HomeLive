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
import { usePantry } from '../context/PantryContext';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Pantry'
>;

export default function PantryScreen({
  navigation,
}: Props) {
  const { products, loading, deleteProduct } = usePantry();

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar producto',
      '¿Seguro que deseas eliminar este producto?',
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
              await deleteProduct(id);
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'No fue posible eliminar el producto.';
              Alert.alert('Producto', message);
            }
          },
        },
      ],
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
        Despensa y refrigerador
      </Text>

      <Pressable
        style={styles.addButton}
        onPress={() => navigation.navigate('CreateProduct')}
      >
        <Text style={styles.addButtonText}>Agregar producto</Text>
      </Pressable>

      {products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Aún no hay productos registrados.
          </Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Text style={styles.productName}>
                {item.name}
              </Text>

              <Text>
                Categoría: {item.category}
              </Text>

              <Text>
                Cantidad: {item.quantity} {item.unit}
              </Text>

              <Text>
                Ubicación:{' '}
                {item.location === 'pantry'
                  ? 'Despensa'
                  : 'Refrigerador'}
              </Text>

              <Text>
                Estado: {item.status}
              </Text>

              <View style={styles.actions}>
                <Pressable
                  style={styles.actionButton}
                  onPress={() =>
                    navigation.navigate('EditProduct', {
                      productId: item.id,
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
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
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
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  list: {
    gap: 12,
  },
  productCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
});