import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import AppNavigator from './src/navigation/AppNavigator';

import { AuthProvider } from './src/presentation/context/AuthContext';
import { HouseholdProvider } from './src/presentation/context/HouseholdContext';
import { PantryProvider } from './src/presentation/context/PantryContext';

export default function App() {
  return (
    <AuthProvider>
      <HouseholdProvider>
        <PantryProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </PantryProvider>
      </HouseholdProvider>
    </AuthProvider>
  );
}