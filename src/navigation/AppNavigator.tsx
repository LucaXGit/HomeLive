import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../presentation/context/AuthContext';

import LoginScreen from '../presentation/screens/auth/LoginScreen';
import RegisterScreen from '../presentation/screens/auth/RegisterScreen';

import HomeScreen from '../presentation/screens/HomeScreen';
import PantryScreen from '../presentation/screens/PantryScreen';
import FinancesScreen from '../presentation/screens/FinancesScreen';
import ShoppingScreen from '../presentation/screens/ShoppingScreen';
import PlanningScreen from '../presentation/screens/PlanningScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Pantry: undefined;
  Finances: undefined;
  Shopping: undefined;
  Planning: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator>
      {user ? (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'HomeLive' }}
          />

          <Stack.Screen
            name="Pantry"
            component={PantryScreen}
            options={{ title: 'Despensa' }}
          />

          <Stack.Screen
            name="Finances"
            component={FinancesScreen}
            options={{ title: 'Finanzas' }}
          />

          <Stack.Screen
            name="Shopping"
            component={ShoppingScreen}
            options={{ title: 'Compras' }}
          />

          <Stack.Screen
            name="Planning"
            component={PlanningScreen}
            options={{ title: 'Planificación' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Iniciar sesión' }}
          />

          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Registro' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}