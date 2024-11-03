import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useUser } from '../context/user';

export default function WelcomeScreen() {
    const router = useRouter();
    const { username } = useUser();

    return (
        <View className="flex-1 bg-white">
            <View className="flex-1 p-5 items-center justify-center">
                <View className="items-center mb-10">
                    <Text>
                    LOGO 
                    </Text>
                </View>

                <Text className="text-2xl font-bold mb-2.5 text-center">
                    Welcome to StoryPath
                </Text>
                <Text className="text-lg mb-5 text-center text-gray-600">
                    Explore Unlimited Location-based Experiences
                </Text>

                <Text className="text-center mb-10 text-gray-600 leading-6">
                    With StoryPath, you can discover and create amazing location-based adventures.
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