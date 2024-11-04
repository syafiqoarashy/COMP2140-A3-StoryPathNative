import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { useUser } from '../context/user';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

/**
 * CustomDrawerContent component renders the custom drawer content,
 * displaying the app name, navigation items, and user profile information.
 *
 * @param {object} props - Properties passed down from the Drawer.
 * @param {object[]} props.state - State object containing the navigation state.
 * @param {Function} props.navigation - Navigation prop for drawer item actions.
 * @param {Function} props.descriptors - Descriptor for each route.
 * @returns {JSX.Element} The rendered custom drawer content.
 */
function CustomDrawerContent(props: any) {
    const { username, profileImage, logout } = useUser();

    return (
        <View className="flex-1">
            <View className="p-4 border-b mt-10 border-gray-300">
                <Text className="text-2xl font-bold text-[#7862FC]">STORYPATH</Text>
            </View>
            
            <DrawerContentScrollView {...props}>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>
            
            <View className="p-4 border-t border-gray-300">
                <View className="flex-row items-center mb-4">
                    <Image
                        source={profileImage ? { uri: profileImage } : undefined}
                        className="w-12 h-12 rounded-full mr-3"
                    />
                    <View>
                        <Text className="font-bold">Current User:</Text>
                        <Text>{username || 'Not Set'}</Text>
                    </View>
                </View>
                
                {username && (
                    <TouchableOpacity
                        onPress={logout}
                        className="bg-[#7862FC] py-4 rounded-lg mb-6"
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text className="text-white font-bold">Logout</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

/**
 * DrawerLayout component sets up the main drawer navigation layout,
 * defining screens and custom styles for each drawer item.
 *
 * @returns {JSX.Element} The rendered drawer layout with navigation screens.
 */
export default function DrawerLayout() {
    return (
        <Drawer
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                headerStyle: { backgroundColor: '#7862FC' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
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
            <Drawer.Screen
                name="about"
                options={{
                    title: 'About',
                    drawerLabel: 'About',
                }}
            />
        </Drawer>
    );
}
