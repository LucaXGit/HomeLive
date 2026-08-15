import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import AppNavigator from './src/navigation/AppNavigator';

import { AuthProvider } from './src/presentation/context/AuthContext';
import { HouseholdProvider } from './src/presentation/context/HouseholdContext';

export default function App() {
  return (
    <AuthProvider>
      <HouseholdProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </HouseholdProvider>
    </AuthProvider>
  );
}