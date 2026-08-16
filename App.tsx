import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import AppNavigator from './src/navigation/AppNavigator';

import { AuthProvider } from './src/presentation/context/AuthContext';
import { HouseholdProvider } from './src/presentation/context/HouseholdContext';
import { PantryProvider } from './src/presentation/context/PantryContext';
import { ShoppingListProvider } from './src/presentation/context/ShoppingListContext';
import { FinanceProvider } from './src/presentation/context/FinanceContext';
import { SavingsGoalProvider } from './src/presentation/context/SavingsGoalContext';
import { PlanningProvider } from './src/presentation/context/PlanningContext';

export default function App() {
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