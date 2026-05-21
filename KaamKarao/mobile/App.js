import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './screens/HomeScreen';
import BookingScreen from './screens/BookingScreen';
import TraceScreen from './screens/TraceScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#1B5E20',
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
          },
          cardStyle: { backgroundColor: '#F5F5F5' },
          gestureEnabled: true,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: '\u06A9\u0627\u0645 \u06A9\u0631\u0627\u0624 — Kaam Karao' }}
        />
        <Stack.Screen
          name="Booking"
          component={BookingScreen}
          options={{ title: 'Booking Confirmed \u2705' }}
        />
        <Stack.Screen
          name="Trace"
          component={TraceScreen}
          options={{
            title: '\uD83E\uDD16 Agent Trace',
            headerStyle: {
              backgroundColor: '#1a1a2e',
              elevation: 8,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 6,
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
