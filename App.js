import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import ThemeProvider from './ThemeContext';
import NewsFeedScreen from './screens/NewsFeedScreen';
import ArticleScreen from './screens/ArticleScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 60 },
        tabBarActiveTintColor: '#F891BB',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tab.Screen name="Home" component={NewsFeedScreen} initialParams={{ category: null }} />
      <Tab.Screen name="Categories" component={NewsFeedScreen} initialParams={{ category: 'business' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="Article" component={ArticleScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}