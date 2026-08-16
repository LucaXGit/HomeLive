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
import { ProductLocation } from '../../domain/entities';
import { usePantry } from '../context/PantryContext';

import {
  isProductExpiringSoon,
} from '../../domain/usecases/productStatus';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Pantry'
>;

type LocationFilter =
  | 'all'
  | ProductLocation;

export default function PantryScreen({
  navigation,
}: Props) {
  const {
    products,
    loading,
    deleteProduct,
  } = usePantry();

  const [search, setSearch] = useState('');
  const [category, setCategory] =
    useState('');
  const [locationFilter, setLocationFilter] =
    useState<LocationFilter>('all');

  const filteredProducts = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    const normalizedCategory =
      category.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesCategory =
        !normalizedCategory ||
        product.category
          .toLowerCase()
          .includes(normalizedCategory);

      const matchesLocation =
        locationFilter === 'all' ||
        product.location === locationFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation
      );
    });
  }, [
    products,
    search,
    category,
    locationFilter,
  ]);

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

              Alert.alert(
                'Producto',
                message
              );
            }
          },
        },
      ]
    );
  };

  const getStatusLabel = (
    status: string
  ) => {
    switch (status) {
      case 'available':
        return 'Disponible';

      case 'low_stock':
        return 'Pocas existencias';

      case 'out_of_stock':
        return 'Agotado';

      case 'expired':
        return 'Caducado';

      default:
        return status;
    }
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
        onPress={() =>
          navigation.navigate(
            'CreateProduct'
          )
        }
      >
        <Text style={styles.addButtonText}>
          Agregar producto
        </Text>
      </Pressable>

      <TextInput
        style={styles.input}
        placeholder="Buscar producto"
        value={search}
        onChangeText={setSearch}
      />

      <TextInput
        style={styles.input}
        placeholder="Filtrar por categoría"
        value={category}
        onChangeText={setCategory}
      />

      <View style={styles.filters}>
        <Pressable
          style={[
            styles.filterButton,
            locationFilter === 'all' &&
              styles.selectedFilter,
          ]}
          onPress={() =>
            setLocationFilter('all')
          }
        >
          <Text>Todos</Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            locationFilter === 'pantry' &&
              styles.selectedFilter,
          ]}
          onPress={() =>
            setLocationFilter('pantry')
          }
        >
          <Text>Despensa</Text>
        </Pressable>

        <Pressable
          style={[
            styles.filterButton,
            locationFilter ===
              'refrigerator' &&
              styles.selectedFilter,
          ]}
          onPress={() =>
            setLocationFilter(
              'refrigerator'
            )
          }
        >
          <Text>Refrigerador</Text>
        </Pressable>
      </View>

      {filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No se encontraron productos.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={
            styles.list
          }
          renderItem={({ item }) => {
            const expiringSoon =
              isProductExpiringSoon(
                item.expirationDate
              );

            return (
              <View
                style={styles.productCard}
              >
                <Text
                  style={styles.productName}
                >
                  {item.name}
                </Text>

                <Text>
                  Categoría:{' '}
                  {item.category}
                </Text>

                <Text>
                  Cantidad:{' '}
                  {item.quantity}{' '}
                  {item.unit}
                </Text>

                <Text>
                  Ubicación:{' '}
                  {item.location ===
                  'pantry'
                    ? 'Despensa'
                    : 'Refrigerador'}
                </Text>

                <Text>
                  Estado:{' '}
                  {getStatusLabel(
                    item.status
                  )}
                </Text>

                {item.expirationDate && (
                  <Text>
                    Caducidad:{' '}
                    {item.expirationDate}
                  </Text>
                )}

                {expiringSoon &&
                  item.status !==
                    'expired' && (
                    <Text
                      style={
                        styles.warning
                      }
                    >
                      Próximo a caducar
                    </Text>
                  )}

                <View
                  style={styles.actions}
                >
                  <Pressable
                    style={
                      styles.actionButton
                    }
                    onPress={() =>
                      navigation.navigate(
                        'EditProduct',
                        {
                          productId:
                            item.id,
                        }
                      )
                    }
                  >
                    <Text>Editar</Text>
                  </Pressable>

                  <Pressable
                    style={
                      styles.actionButton
                    }
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
    marginBottom: 16,
  },
  addButtonText: {
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  selectedFilter: {
    backgroundColor: '#e0e0e0',
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
  warning: {
    fontWeight: 'bold',
    marginTop: 6,
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