import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useHousehold } from '../presentation/context/HouseholdContext';
import CreateHouseholdScreen from '../presentation/screens/household/CreateHouseholdScreen';
import { useAuth } from '../presentation/context/AuthContext';

import LoginScreen from '../presentation/screens/auth/LoginScreen';
import RegisterScreen from '../presentation/screens/auth/RegisterScreen';

import HomeScreen from '../presentation/screens/HomeScreen';
import PantryScreen from '../presentation/screens/PantryScreen';
import CreateProductScreen from '../presentation/screens/pantry/CreateProductScreen';
import EditProductScreen from '../presentation/screens/pantry/EditProductScreen';
import FinancesScreen from '../presentation/screens/FinancesScreen';
import ShoppingScreen from '../presentation/screens/ShoppingScreen';
import CreateShoppingListScreen from '../presentation/screens/shopping/CreateShoppingListScreen';
import ShoppingListDetailScreen from '../presentation/screens/shopping/ShoppingListDetailScreen';
import PlanningScreen from '../presentation/screens/PlanningScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  CreateHousehold: undefined;
  Home: undefined;
  Pantry: undefined;
  CreateProduct: undefined;
  EditProduct: {
    productId: string;
  };
  Finances: undefined;
  Shopping: undefined;
  CreateShoppingList: undefined;
  ShoppingListDetail: {
    listId: string;
  };
  Planning: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const {
    user,
    loading: authLoading,
  } = useAuth();

  const {
    household,
    loading: householdLoading,
  } = useHousehold();

  if (authLoading || householdLoading) {
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
      {!user ? (
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              title: 'Iniciar sesión',
            }}
          />

          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              title: 'Registro',
            }}
          />
        </>
      ) : !household ? (
        <Stack.Screen
          name="CreateHousehold"
          component={CreateHouseholdScreen}
          options={{
            title: 'Configurar hogar',
            headerBackVisible: false,
          }}
        />
      ) : (
        <>
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
            name="CreateProduct"
            component={CreateProductScreen}
            options={{
              title: 'Registrar producto',
            }}
          />

          <Stack.Screen
            name="EditProduct"
            component={EditProductScreen}
            options={{
              title: 'Editar producto',
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
            name="CreateShoppingList"
            component={CreateShoppingListScreen}
            options={{
              title: 'Nueva lista',
            }}
          />

          <Stack.Screen
            name="ShoppingListDetail"
            component={ShoppingListDetailScreen}
            options={{
              title: 'Detalle de lista',
            }}
          />

          <Stack.Screen
            name="Planning"
            component={PlanningScreen}
            options={{
              title: 'Planificación',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}