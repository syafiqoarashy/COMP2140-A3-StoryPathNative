import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function AboutScreen() {
    return (
        <ScrollView className="flex-1 bg-white p-4">
            <View className="mb-6">
                <Text className="text-2xl font-bold text-center text-[#7862FC] mb-4">About STORYPATH</Text>
                <Text className="text-lg leading-6 text-gray-700">
                    STORYPATH is an interactive platform designed to help you explore journeys
                    through various locations and experiences.
                </Text>
            </View>

            <View className="mb-6">
                <Text className="text-xl font-semibold text-[#7862FC] mb-2">Features</Text>
                <Text className="text-gray-700 leading-6">
                    - Track your location-based activities.
                    {'\n'}- Unlock new locations and earn points.
                    {'\n'}- Discover hints and clues as you progress.
                </Text>
            </View>
        </ScrollView>
    );
}
