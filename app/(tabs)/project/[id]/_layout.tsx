import React from 'react';
import { Tabs, useNavigation, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

/**
 * ProjectTabsLayout component renders a tab navigation layout with three main screens:
 * Home, Map, and QR Scanner. Each tab displays an icon and title, and navigation is
 * configured for back navigation and screen-specific options.
 *
 * @returns {JSX.Element} The tab layout with customized screen options and navigation.
 */
export default function ProjectTabsLayout() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#7862FC',
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => navigation.navigate('projects' as never)} 
            style={{ marginLeft: 15 }}
          >
            <Ionicons name="arrow-back" size={24} color="#7862FC" />
          </TouchableOpacity>
        ),
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
        initialParams={{ id }}
      />

      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />,
        }}
        initialParams={{ id }}
      />

      <Tabs.Screen
        name="qr-scanner"
        options={{
          title: 'QR Scanner',
          tabBarIcon: ({ color, size }) => <Ionicons name="qr-code" size={size} color={color} />,
        }}
        initialParams={{ id }}
      />
    </Tabs>
  );
}
