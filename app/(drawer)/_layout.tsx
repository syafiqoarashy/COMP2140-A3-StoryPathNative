import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { useUser } from '../context/user';
import { View, Text, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

function CustomDrawerContent(props: any) {
    const { username, profileImage } = useUser();

    return (
        <View className="flex-1">
            <View className="p-4 border-b mt-10 border-gray-300">
                <Text className="text-2xl font-bold text-[#7862FC]">STORYPATH</Text>
            </View>
            
            <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
            
            <View className="p-4 border-t border-gray-300">
                <View className="flex-row items-center">
                    <Image
                        source={profileImage ? { uri: profileImage } : undefined}
                        className="w-12 h-12 rounded-full mr-3"
                    />
                    <View>
                        <Text className="font-bold">Current User:</Text>
                        <Text>{username || 'Not Set'}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

export default function DrawerLayout() {
    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#7862FC',
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
                drawerActiveTintColor: '#7862FC',
            }}
        >
            <Drawer.Screen
                name="index"
                options={{
                    title: 'Welcome',
                    drawerLabel: 'Welcome',
                    headerTitle: 'StoryPath',
                }}
            />
            <Drawer.Screen
                name="projects"
                options={{
                    title: 'Projects',
                    drawerLabel: 'Projects',
                }}
            />
            <Drawer.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    drawerLabel: 'Profile',
                }}
            />
        </Drawer>
    );
}
