import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../context/user';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
    const router = useRouter();
    const { setUsername, setProfileImage, profileImage } = useUser();
    const [inputUsername, setInputUsername] = useState('');

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
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
    };

    const handleSave = () => {
        if (inputUsername.trim()) {
            setUsername(inputUsername.trim());
            Toast.show({
                type: 'success',
                text1: 'Profile Updated',
                text2: 'Your profile has been successfully updated.',
                visibilityTime: 2000,
                onHide: () => router.push('/(drawer)/projects')
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
                <Text className="text-primary text-xl font-bold text-center mb-8">
                    Your Profile
                </Text>

                <TouchableOpacity
                    onPress={pickImage}
                    className="items-center mb-8"
                >
                    <View className="w-32 h-32 rounded-full bg-gray-100 overflow-hidden items-center justify-center border-2 border-gray-200">
                        {profileImage ? (
                            <Image
                                source={{ uri: profileImage }}
                                className="w-full h-full"
                            />
                        ) : (
                            <View className="items-center justify-center">
                                <Text className="text-gray-400 text-center p-4">
                                    Tap to add photo
                                </Text>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                <View className="mb-8">
                    <TextInput
                        className="w-full bg-gray-50 rounded-lg p-4 text-base border border-gray-200"
                        placeholder="Enter username"
                        value={inputUsername}
                        onChangeText={setInputUsername}
                        placeholderTextColor="#9ca3af"
                    />
                    <Text className="text-gray-500 text-sm mt-2">
                        This username will be used to track your participation in projects
                    </Text>
                </View>

                <TouchableOpacity
                    className="bg-primary rounded-lg p-4 w-full"
                    onPress={handleSave}
                >
                    <Text className="text-white text-center font-bold text-base">
                        SAVE PROFILE
                    </Text>
                </TouchableOpacity>
            </View>
            <Toast />
        </View>
    );
}
