import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';

import { RootStackParamList } from '../../navigation/AppNavigator';

import {
  parseVoiceCommand,
} from '../../services/voiceCommandService';

import { useAuth } from '../context/AuthContext';

import {
  useShoppingLists,
} from '../context/ShoppingListContext';

type Props =
  NativeStackScreenProps<
    RootStackParamList,
    'Home'
  >;

export default function HomeScreen({
  navigation,
}: Props) {
  const { logout } = useAuth();

  const {
    lists,
    addItem,
  } = useShoppingLists();

  const [
    isListening,
    setIsListening,
  ] = useState(false);

  const executeVoiceCommand = async (
    text: string
  ): Promise<void> => {
    const command =
      parseVoiceCommand(text);

    if (
      command.type ===
      'add_shopping_item'
    ) {
      const activeList =
        lists.find(
          (list) =>
            list.status === 'active'
        );

      if (!activeList) {
        Alert.alert(
          'Lista de compras',
          'No tienes una lista de compras activa.'
        );

        return;
      }

      try {
        await addItem(
          activeList.id,
          command.productName,
          command.quantity
        );

        Alert.alert(
          'Producto agregado',
          `${command.productName} se agregó a ${activeList.name}.`
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo agregar el producto.';

        Alert.alert(
          'Error',
          message
        );
      }

      return;
    }

    Alert.alert(
      'Comando no reconocido',
      `No entendí: "${text}"`
    );
  };

  useSpeechRecognitionEvent(
    'start',
    () => {
      setIsListening(true);
    }
  );

  useSpeechRecognitionEvent(
    'end',
    () => {
      setIsListening(false);
    }
  );

  useSpeechRecognitionEvent(
    'result',
    (event) => {
      const transcript =
        event.results[0]
          ?.transcript
          ?.trim() ?? '';

      if (
        event.isFinal &&
        transcript
      ) {
        void executeVoiceCommand(
          transcript
        );
      }
    }
  );

  useSpeechRecognitionEvent(
    'error',
    (event) => {
      console.error(
        'Speech recognition error:',
        event.error,
        event.message
      );

      setIsListening(false);
    }
  );

  const startVoiceCommand =
    async (): Promise<void> => {
      try {
        const permission =
          await ExpoSpeechRecognitionModule
            .requestPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            'Permiso requerido',
            'HomeLive necesita acceso al micrófono para utilizar comandos de voz.'
          );

          return;
        }

        ExpoSpeechRecognitionModule.start({
          lang: 'es-MX',
          interimResults: true,
          continuous: false,
        });
      } catch (error) {
        console.error(
          'Error starting speech recognition:',
          error
        );

        Alert.alert(
          'Error',
          'No se pudo iniciar el reconocimiento de voz.'
        );
      }
    };

  const stopVoiceCommand = (): void => {
    ExpoSpeechRecognitionModule.stop();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        HomeLive
      </Text>

      <Text style={styles.subtitle}>
        Gestión inteligente del hogar
      </Text>

      <View style={styles.menu}>
        <Pressable
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              'Pantry'
            )
          }
        >
          <Text style={styles.buttonText}>
            Despensa
          </Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              'Finances'
            )
          }
        >
          <Text style={styles.buttonText}>
            Finanzas
          </Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              'Shopping'
            )
          }
        >
          <Text style={styles.buttonText}>
            Compras
          </Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={() =>
            navigation.navigate(
              'Planning'
            )
          }
        >
          <Text style={styles.buttonText}>
            Planificación
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.voiceButton,
            isListening &&
              styles.voiceButtonListening,
          ]}
          onPress={
            isListening
              ? stopVoiceCommand
              : startVoiceCommand
          }
        >
          <Text style={styles.voiceButtonText}>
            {isListening
              ? 'Escuchando...'
              : 'Comando de voz'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.logoutButton}
          onPress={logout}
        >
          <Text style={styles.logoutText}>
            Cerrar sesión
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 32,
  },

  menu: {
    gap: 16,
  },

  button: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },

  buttonText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },

  voiceButton: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
  },

  voiceButtonListening: {
    opacity: 0.6,
  },

  voiceButtonText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
  },

  logoutButton: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },

  logoutText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
    color: '#dc3545',
  },
});