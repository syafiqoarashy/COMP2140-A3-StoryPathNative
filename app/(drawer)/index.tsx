import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../context/user';
import { Ionicons } from '@expo/vector-icons';

/**
 * WelcomeScreen component serves as the landing page, greeting users and
 * providing navigation options to either create a profile or explore projects.
 *
 * @returns {JSX.Element} The welcome screen with an introductory message and navigation button.
 */
export default function WelcomeScreen() {
    const router = useRouter();
    const { username } = useUser();

    return (
        <View className="flex-1 bg-white">
            <View className="flex-1 p-5 items-center justify-center">
            <Ionicons name="map" size={80} color="#7862FC" className="mb-4" />
            <Text className="text-4xl font-bold text-center text-gray-800 mb-2">
                    Welcome to StoryPath
                </Text>
                <Text className="text-lg text-center text-gray-500 mb-6">
                    Explore Unlimited Location-based Experiences
                </Text>

                <Text className="text-center text-gray-600 leading-6 mb-10">
                    With StoryPath, discover and create amazing location-based adventures.
                    From city tours to treasure hunts, the possibilities are endless!
                </Text>
            </View>

            <View className="p-5 pb-10">
                {!username ? (
                    <TouchableOpacity
                        className="bg-primary p-4 rounded-lg items-center"
                        onPress={() => router.push('/(drawer)/profile')}
                    >
                        <Text className="text-white text-base font-bold">
                            CREATE PROFILE
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        className="bg-primary p-4 rounded-lg items-center"
                        onPress={() => router.push('/(drawer)/projects')}
                    >
                        <Text className="text-white text-base font-bold">
                            EXPLORE PROJECTS
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
