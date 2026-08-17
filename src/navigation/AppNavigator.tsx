import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
import CreateTransactionScreen from '../presentation/screens/finances/CreateTransactionScreen';
import EditTransactionScreen from '../presentation/screens/finances/EditTransactionScreen';
import SavingsGoalsScreen from '../presentation/screens/savings/SavingsGoalsScreen';
import CreateSavingsGoalScreen from '../presentation/screens/savings/CreateSavingsGoalScreen';
import EditSavingsGoalScreen from '../presentation/screens/savings/EditSavingsGoalScreen';
import ShoppingScreen from '../presentation/screens/ShoppingScreen';
import CreateShoppingListScreen from '../presentation/screens/shopping/CreateShoppingListScreen';
import ShoppingListDetailScreen from '../presentation/screens/shopping/ShoppingListDetailScreen';
import PlanningScreen from '../presentation/screens/PlanningScreen';
import CreatePlanningItemScreen from '../presentation/screens/planning/CreatePlanningItemScreen';
import EditPlanningItemScreen from '../presentation/screens/planning/EditPlanningItemScreen';

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
  CreateTransaction: undefined;
  EditTransaction: {
    transactionId: string;
  };
  SavingsGoals: undefined;
  CreateSavingsGoal: undefined;
  EditSavingsGoal: {
    goalId: string;
  };
  Shopping: undefined;
  CreateShoppingList: undefined;
  ShoppingListDetail: {
    listId: string;
  };
  Planning: undefined;
  CreatePlanningItem: {
    initialDate?: string;
  };
  EditPlanningItem: {
    planningItemId: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const {
    user,
    loading: authLoading,
    biometricLocked,
    unlockWithBiometrics,
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

  if (user && biometricLocked) {
    return (
      <View style={styles.lockedContainer}>
        <Text style={styles.lockedTitle}>HomeLive bloqueado</Text>
        <Text style={styles.lockedText}>
          Confirma tu identidad para continuar.
        </Text>
        <Pressable
          style={styles.unlockButton}
          onPress={unlockWithBiometrics}
        >
          <Text>Desbloquear con huella</Text>
        </Pressable>
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
            name="CreateTransaction"
            component={CreateTransactionScreen}
            options={{
              title: 'Nuevo movimiento',
            }}
          />

          <Stack.Screen
            name="EditTransaction"
            component={EditTransactionScreen}
            options={{
              title: 'Editar movimiento',
            }}
          />

          <Stack.Screen
            name="SavingsGoals"
            component={SavingsGoalsScreen}
            options={{
              title: 'Metas de ahorro',
            }}
          />

          <Stack.Screen
            name="CreateSavingsGoal"
            component={CreateSavingsGoalScreen}
            options={{
              title: 'Nueva meta',
            }}
          />

          <Stack.Screen
            name="EditSavingsGoal"
            component={EditSavingsGoalScreen}
            options={{
              title: 'Editar meta',
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

          <Stack.Screen
            name="CreatePlanningItem"
            component={CreatePlanningItemScreen}
            options={{
              title: 'Nueva planificación',
            }}
          />

          <Stack.Screen
            name="EditPlanningItem"
            component={EditPlanningItemScreen}
            options={{
              title: 'Editar planificación',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  lockedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  lockedText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  unlockButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
  },
});