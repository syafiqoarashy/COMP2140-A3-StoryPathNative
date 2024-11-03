import React from 'react';
import { Tabs, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

export default function ProjectTabsLayout() {
  const navigation = useNavigation();

  return (
    <Tabs 
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#7862FC',
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.navigate('projects' as never)} style={{ marginLeft: 15 }}>
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
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, size }) => <Ionicons name="map" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="qr-scanner"
        options={{
          title: 'QR Scanner',
          tabBarIcon: ({ color, size }) => <Ionicons name="qr-code" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}