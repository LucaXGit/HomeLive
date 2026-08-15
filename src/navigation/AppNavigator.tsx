import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../presentation/screens/HomeScreen';
import PantryScreen from '../presentation/screens/PantryScreen';
import FinancesScreen from '../presentation/screens/FinancesScreen';
import ShoppingScreen from '../presentation/screens/ShoppingScreen';
import PlanningScreen from '../presentation/screens/PlanningScreen';

export type RootStackParamList = {
  Home: undefined;
  Pantry: undefined;
  Finances: undefined;
  Shopping: undefined;
  Planning: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerBackTitle: 'Atrás',
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'HomeLive',
        }}
      />

      <Stack.Screen
        name="Pantry"
        component={PantryScreen}
        options={{
          title: 'Despensa',
        }}
      />

      <Stack.Screen
        name="Finances"
        component={FinancesScreen}
        options={{
          title: 'Finanzas',
        }}
      />

      <Stack.Screen
        name="Shopping"
        component={ShoppingScreen}
        options={{
          title: 'Compras',
        }}
      />

      <Stack.Screen
        name="Planning"
        component={PlanningScreen}
        options={{
          title: 'Planificación',
        }}
      />
    </Stack.Navigator>
  );
}