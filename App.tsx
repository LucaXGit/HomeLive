import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';

import AppNavigator from './src/navigation/AppNavigator';
import { initializeLocalDatabase } from './src/services/databaseService';

import { AuthProvider } from './src/presentation/context/AuthContext';
import { HouseholdProvider } from './src/presentation/context/HouseholdContext';
import { PantryProvider } from './src/presentation/context/PantryContext';
import { ShoppingListProvider } from './src/presentation/context/ShoppingListContext';
import { FinanceProvider } from './src/presentation/context/FinanceContext';
import { SavingsGoalProvider } from './src/presentation/context/SavingsGoalContext';
import { PlanningProvider } from './src/presentation/context/PlanningContext';

export default function App() {
  const [databaseReady, setDatabaseReady] =
    useState(false);
  const [databaseError, setDatabaseError] =
    useState<Error | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeLocalDatabase();
        setDatabaseReady(true);
      } catch (error) {
        setDatabaseError(
          error instanceof Error
            ? error
            : new Error(
                'No fue posible inicializar la base de datos.'
              )
        );
      }
    };

    initialize();
  }, []);

  if (databaseError) {
    throw databaseError;
  }

  if (!databaseReady) {
    return (
      <View style={styles.databaseLoading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <HouseholdProvider>
        <PantryProvider>
          <ShoppingListProvider>
            <FinanceProvider>
              <SavingsGoalProvider>
                <PlanningProvider>
                  <NavigationContainer>
                    <AppNavigator />
                  </NavigationContainer>
                </PlanningProvider>
              </SavingsGoalProvider>
            </FinanceProvider>
          </ShoppingListProvider>
        </PantryProvider>
      </HouseholdProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  databaseLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});