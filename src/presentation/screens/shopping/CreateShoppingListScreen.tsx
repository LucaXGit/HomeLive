import React, { useState } from 'react';

import {
  Alert,
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
  'CreateShoppingList'
>;

export default function CreateShoppingListScreen({
  navigation,
}: Props) {
  const { createList } =
    useShoppingLists();

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [submitting, setSubmitting] =
    useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !date.trim()) {
      Alert.alert(
        'Validación',
        'Completa nombre y fecha.'
      );

      return;
    }

    try {
      setSubmitting(true);

      await createList(
        name.trim(),
        date.trim()
      );

      navigation.goBack();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No fue posible crear la lista.';

      Alert.alert(
        'Lista de compras',
        message
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Nueva lista
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre de la lista"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Fecha YYYY-MM-DD"
        value={date}
        onChangeText={setDate}
      />

      <Pressable
        style={styles.button}
        onPress={handleSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting
            ? 'Guardando...'
            : 'Crear lista'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
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
  button: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
});