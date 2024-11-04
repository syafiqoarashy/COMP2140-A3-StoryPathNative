import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../context/user';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

/**
 * ProfileScreen component allows users to update their profile by setting a username
 * and choosing a profile image. It provides clear error feedback for permissions
 * and validation, enhancing the user experience.
 *
 * @returns {JSX.Element} The profile screen layout with user update options.
 */
export default function ProfileScreen() {
    const router = useRouter();
    const { setUsername, setProfileImage, profileImage } = useUser();
    const [inputUsername, setInputUsername] = useState('');

    /**
     * Opens the image picker to select a profile image, handling permission errors
     * if access to the media library is not granted.
     */
    const pickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Toast.show({
                    type: 'error',
                    text1: 'Permission Denied',
                    text2: 'Camera roll permissions are required to select an image.',
                });
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
            });

            if (!result.canceled && result.assets[0].uri) {
                setProfileImage(result.assets[0].uri);
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Image Selection Error',
                text2: 'An error occurred while selecting an image. Please try again.',
            });
        }
    };

    /**
     * Handles saving the profile information, validating that a username is entered
     * and displaying success or error messages accordingly.
     */
    const handleSave = () => {
        if (inputUsername.trim()) {
            setUsername(inputUsername.trim());
            Toast.show({
                type: 'success',
                text1: 'Profile Updated',
                text2: 'Your profile has been successfully updated.',
                visibilityTime: 2000,
                onHide: () => router.push('/(drawer)/projects'),
            });
        } else {
            Toast.show({
                type: 'error',
                text1: 'Username Required',
                text2: 'Please enter a username before saving.',
            });
        }
    };

    return (
        <View className="flex-1 bg-white">
            <View className="p-5">
                <Text className="text-primary text-2xl font-bold text-center mb-10 text-gray-800">
                Your Profile
            </Text>

            <TouchableOpacity onPress={pickImage} className="items-center mb-8">
                <View className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden items-center justify-center border-4 border-[#7862FC] shadow-sm">
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} className="w-full h-full" />
                    ) : (
                        <View className="items-center justify-center">
                            <Ionicons name="camera" size={30} color="#9ca3af" />
                            <Text className="text-gray-400 text-center text-sm mt-2">Tap to add photo</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            <View className="mb-8">
                <TextInput
                    className="w-full bg-white rounded-lg p-4 text-base border border-gray-300 shadow-sm"
                    placeholder="Enter username"
                    value={inputUsername}
                    onChangeText={setInputUsername}
                    placeholderTextColor="#9ca3af"
                />
                <Text className="text-gray-500 text-sm mt-2 text-center">
                    This username will be used to track your participation in projects.
                </Text>
            </View>

                <TouchableOpacity className="bg-primary rounded-lg p-4 w-full" onPress={handleSave}>
                    <Text className="text-white text-center font-bold text-base">
                        SAVE PROFILE
                    </Text>
                </TouchableOpacity>
            </View>
            <Toast />
        </View>
    );
}
