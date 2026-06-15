import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CardScreen from '../screens/CardScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import MapScreen from '../screens/MapScreen';
import TripReceiptScreen from '../screens/TripReceiptScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Card" component={CardScreen} />
        <Stack.Screen
          name="QRScanner"
          component={QRScannerScreen}
          options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="Map" component={MapScreen} />
        <Stack.Screen
          name="Receipt"
          component={TripReceiptScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
