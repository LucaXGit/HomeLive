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
import { useShoppingLists } from '../context/ShoppingListContext';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'Shopping'
>;

export default function ShoppingScreen({
  navigation,
}: Props) {
  const {
    lists,
    loading,
    deleteList,
  } = useShoppingLists();

  const handleDelete = (
    listId: string
  ) => {
    Alert.alert(
      'Eliminar lista',
      '¿Seguro que deseas eliminar esta lista?',
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
              await deleteList(listId);
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'No fue posible eliminar la lista.';

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
        Listas de compras
      </Text>

      <Pressable
        style={styles.addButton}
        onPress={() =>
          navigation.navigate(
            'CreateShoppingList'
          )
        }
      >
        <Text style={styles.addButtonText}>
          Nueva lista
        </Text>
      </Pressable>

      {lists.length === 0 ? (
        <View style={styles.center}>
          <Text>
            Aún no hay listas registradas.
          </Text>
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.listName}>
                {item.name}
              </Text>

              <Text>
                Fecha: {item.date}
              </Text>

              <Text>
                Artículos: {item.items.length}
              </Text>

              <Text>
                Estado:{' '}
                {item.status === 'active'
                  ? 'Activa'
                  : 'Completada'}
              </Text>

              <Pressable
                style={styles.openButton}
                onPress={() =>
                  navigation.navigate(
                    'ShoppingListDetail',
                    {
                      listId: item.id,
                    }
                  )
                }
              >
                <Text>Ver lista</Text>
              </Pressable>

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
    fontSize: 16,
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
  listName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  openButton: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  deleteButton: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
});