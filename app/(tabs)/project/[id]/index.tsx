import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { WebView } from 'react-native-webview';
import { getProject, getLocations, createTracking, Project, Location, getLocationsByProjectId } from '@/services/api';
import * as ExpoLocation from 'expo-location';
import { getDistance } from 'geolib';
import { useUser } from '@/app/context/user';

export default function ProjectScreen() {
  const { id } = useLocalSearchParams();
  const { username } = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [points, setPoints] = useState(0);
  const [locationsVisited, setLocationsVisited] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
    startLocationTracking();
  }, []);

  const fetchProjectData = async () => {
    try {
      const projectData = await getProject(Number(id));
      setProject(projectData);
      const allLocations = await getLocations();
      const projectLocations = getLocationsByProjectId(allLocations, Number(id));
      setLocations(projectLocations);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching project data:', error);
      setLoading(false);
    }
  };

  const startLocationTracking = async () => {
    let { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return;
    }

    ExpoLocation.watchPositionAsync(
      { accuracy: ExpoLocation.Accuracy.High, timeInterval: 5000, distanceInterval: 5 },
      (location) => {
        checkNearbyLocations(location.coords);
      }
    );
  };

  const checkNearbyLocations = (userLocation: { latitude: number; longitude: number }) => {
    locations.forEach(loc => {
      if (loc.location_position) {
        console.log("Loc", loc)
        try {
          const [lat, lng] = loc.location_position
            .replace(/[()]/g, '')
            .split(',')
            .map(coord => parseFloat(coord.trim()));
            
            console.log("Lat,", lat, "Lng,", lng)

          if (!isNaN(lat) && !isNaN(lng)) {
            const distance = getDistance(
              userLocation,
              { latitude: lat, longitude: lng }
            );
            console.log("Distance,", distance)
            console.log("Current Location,", currentLocation)
            console.log("Visited Locations,", locationsVisited)
            if (distance < 400) {
              if (currentLocation?.id !== loc.id) {
                setCurrentLocation(loc);
                updateTracking(loc);
              }
            }
          } else {
            console.error(`Invalid coordinates for location ${loc.id}: ${loc.location_position}`);
          }
        } catch (error) {
          console.error(`Error parsing location position for location ${loc.id}:`, error);
        }
      }
    });
  };

  const updateTracking = async (location: Location) => {
    try {
      await createTracking({
        project_id: Number(id),
        location_id: location.id,
        username: username!,
        points: location.score_points || 0,
        participant_username: username
      });
      setPoints(prev => prev + (location.score_points || 0));
      setLocationsVisited(prev => prev + 1);
    } catch (error) {
      console.error('Error updating tracking:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#7862FC" />
      </View>
    );
  }

  if (!project) {
    return <Text className="text-center mt-4">Project not found</Text>;
  }
  
  const currentProject = Array.isArray(project) ? project[0] : project;

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-4xl font-bold mb-6 text-gray-800 text-center">
            {currentProject.title}
        </Text>
        
        <View className="bg-gray-100 p-4 rounded-lg mb-4">
          <Text className="font-bold mb-2">Instructions</Text>
          <Text>{currentProject.instructions}</Text>
        </View>
        
        <View className="bg-gray-100 p-4 rounded-lg mb-4">
          <Text className="font-bold mb-2">Initial Clue</Text>
          <Text>{currentProject.initial_clue}</Text>
        </View>
        
        <View className="flex-row justify-between mb-4">
          <View className="bg-[#B9AEFF] p-4 rounded-lg flex-1 mr-2">
            <Text className="text-center font-bold text-white">Points</Text>
            <Text className="text-center text-white">{points} / {locations.reduce((sum, loc) => sum + (loc.score_points || 0), 0)}</Text>
          </View>
          <View className="bg-[#B9AEFF] p-4 rounded-lg flex-1 ml-2 ">
            <Text className="text-center font-bold text-white">Locations Visited</Text>
            <Text className="text-center text-white">{locationsVisited} / {locations.length}</Text>
          </View>
        </View>
        
        {currentLocation && (
          <View className="mb-4">
            <Text className="font-bold mb-2">Current Location Content</Text>
            <WebView
              source={{ html: currentLocation.location_content || '' }}
              style={{ height: 200 }}
              className="rounded-lg"
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}
