import React from 'react';
import { View, Text } from 'react-native';

interface ProjectOverviewProps {
  title: string;
  instructions: string | null;
  initialClue: string | null;
  points: number;
  maxPoints: number;
  locationsVisitedCount: number;
  totalLocations: number;
}

/**
 * ProjectOverview component provides an overview of the project,
 * showing the title, instructions, initial clue, points, and visited locations count.
 *
 * @param {ProjectOverviewProps} props - Component props.
 * @param {string} props.title - Project title.
 * @param {string | null} props.instructions - Project instructions.
 * @param {string | null} props.initialClue - Initial clue for the project.
 * @param {number} props.points - Current points scored by the user.
 * @param {number} props.maxPoints - Maximum points possible.
 * @param {number} props.locationsVisitedCount - Number of locations visited by the user.
 * @param {number} props.totalLocations - Total locations in the project.
 * @returns {JSX.Element} The rendered project overview component.
 */
export function ProjectOverview({
  title,
  instructions,
  initialClue,
  points,
  maxPoints,
  locationsVisitedCount,
  totalLocations
}: ProjectOverviewProps) {
  return (
    <View className="p-4">
      <Text className="text-4xl font-bold mb-6 text-gray-800 text-center">
        {title}
      </Text>

      <View className="bg-gray-100 p-4 rounded-lg mb-4">
        <Text className="font-bold mb-2">Instructions</Text>
        <Text>{instructions}</Text>
      </View>

      <View className="bg-gray-100 p-4 rounded-lg mb-4">
        <Text className="font-bold mb-2">Initial Clue</Text>
        <Text>{initialClue}</Text>
      </View>

      <View className="flex-row justify-between mb-4">
        <View className="bg-[#B9AEFF] p-4 rounded-lg flex-1 mr-2">
          <Text className="text-center font-bold text-white">Points</Text>
          <Text className="text-center text-white">
            {points} / {maxPoints}
          </Text>
        </View>
        <View className="bg-[#B9AEFF] p-4 rounded-lg flex-1 ml-2">
          <Text className="text-center font-bold text-white">Locations Visited</Text>
          <Text className="text-center text-white">
            {locationsVisitedCount} / {totalLocations}
          </Text>
        </View>
      </View>
    </View>
  );
}
