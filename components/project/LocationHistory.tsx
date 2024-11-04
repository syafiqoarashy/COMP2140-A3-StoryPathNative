import React from 'react';
import { View, Text } from 'react-native';
import { LocationItem } from './LocationItem';
import { LocationContent } from '@/constants/types';

interface LocationHistoryProps {
  locationContents: LocationContent[];
  toggleLocationExpansion: (locationId: number) => void;
}

/**
 * LocationHistory component displays a list of visited locations.
 *
 * @param {LocationHistoryProps} props - Component props.
 * @param {LocationContent[]} props.locationContents - Array of location data to display.
 * @param {(locationId: number) => void} props.toggleLocationExpansion - Function to toggle location expansion.
 * @returns {JSX.Element} The rendered list of visited locations.
 */
export function LocationHistory({ 
  locationContents, 
  toggleLocationExpansion 
}: LocationHistoryProps) {
  return (
    <View className="p-4">
      <Text className="font-bold text-xl mb-4">
        List of Visited Locations
      </Text>
      
      {locationContents.length > 0 ? (
        locationContents.map((content) => (
          <LocationItem
            key={content.location.id}
            locationName={content.location.location_name}
            participantCount={content.participantCount}
            locationContent={content.location.location_content}
            clue={content.location.clue}
            isExpanded={content.isExpanded}
            isCurrent={locationContents[0]?.location.id === content.location.id}
            toggleExpand={() => toggleLocationExpansion(content.location.id)}
          />
        ))
      ) : (
        <Text className="text-gray-500">
          You haven't visited any locations yet. Start exploring to see your progress here!
        </Text>
      )}
    </View>
  );
}
