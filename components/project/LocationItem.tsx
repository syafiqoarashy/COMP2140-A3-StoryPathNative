import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

interface LocationItemProps {
  locationName: string;
  participantCount: number;
  locationContent: string | null;
  clue: string | null;
  isExpanded: boolean;
  isCurrent: boolean;
  toggleExpand: () => void;
}

/**
 * LocationItem component displays information about a single location,
 * including the name, participant count, content, and clue.
 *
 * @param {LocationItemProps} props - Component props.
 * @param {string} props.locationName - Name of the location.
 * @param {number} props.participantCount - Number of previous visitors to the location.
 * @param {string | null} props.locationContent - HTML content describing the location.
 * @param {string | null} props.clue - Clue for the next location.
 * @param {boolean} props.isExpanded - Flag indicating if the item is expanded.
 * @param {boolean} props.isCurrent - Flag indicating if this location is the current location.
 * @param {() => void} props.toggleExpand - Function to toggle item expansion.
 * @returns {JSX.Element} The rendered location item.
 */
export function LocationItem({
  locationName,
  participantCount,
  locationContent,
  clue,
  isExpanded,
  isCurrent,
  toggleExpand
}: LocationItemProps) {
  return (
    <View 
      className={`mb-4 bg-white rounded-lg shadow-sm border border-gray-200 ${
        isCurrent ? 'border-purple-300' : ''
      }`}
    >
      <TouchableOpacity
        className="flex-row justify-between items-center p-4"
        onPress={toggleExpand}
      >
        <View className="flex-1">
          <Text className="font-bold text-lg">
            {locationName}
            {isCurrent && <Text className="text-purple-600 text-sm"> (Current)</Text>}
          </Text>
          <Text className="text-gray-500 text-sm">
            Previous visitors: {participantCount}
          </Text>
        </View>
        <Text className="text-2xl text-gray-600 font-bold">
          {isExpanded ? '-' : '+'}
        </Text>
      </TouchableOpacity>

      {isExpanded && (
        <View className="p-4 border-t border-gray-200">
          {locationContent ? (
            <View>
              <Text className="font-bold mb-2">Location Content:</Text>
              <WebView
                source={{ html: locationContent }}
                style={{ height: 200 }}
                className="rounded-lg"
              />
            </View>
          ) : (
            <Text className="text-gray-500">
              No content available for this location
            </Text>
          )}

          {clue && (
            <View className="mt-4 bg-gray-50 p-4 rounded-lg">
              <Text className="font-bold mb-2">Next Clue</Text>
              <Text>{clue}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
