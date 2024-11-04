import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { 
  getProject, 
  getParticipantTracking,
  getLocationParticipantCounts, 
  getProjectLocations,
  getVisitedLocations
} from '@/services/api';
import * as ExpoLocation from 'expo-location';
import { getDistance } from 'geolib';
import { useUser } from '@/app/context/user';
import { LocationHistory } from '@/components/project/LocationHistory';
import { ProjectOverview } from '@/components/project/ProjectOverview';
import { useProject } from '@/app/context/project';
import { LocationContent, Project, Tracking, Location } from '@/constants/types';

/**
 * ProjectScreen component displays details of a selected project, including
 * an overview, visited locations, and live location tracking for nearby locations.
 *
 * @returns {JSX.Element} The project screen with location-based tracking and project details.
 */
export default function ProjectScreen() {
  const { id } = useLocalSearchParams();
  const { username } = useUser();
  const [project, setProject] = useState<Project | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locationContents, setLocationContents] = useState<LocationContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataInitialized, setDataInitialized] = useState(false);

  const { 
    currentTracking, 
    updateTracking, 
    visitedLocations, 
    updateVisitedLocations,
    points,
    updatePoints,
    setRefreshFunction
  } = useProject();

  useEffect(() => {
    if (username) {
      fetchProjectData();
    }
  }, [username]);

  useEffect(() => {
    setRefreshFunction(fetchProjectData);
  }, []);

  useEffect(() => {
    if (currentTracking.length > 0) {
      updateLocationContents(currentTracking);
    }
  }, [currentTracking]);

  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        await fetchProjectData();
        await startLocationTracking();
      } catch (error) {
        console.error('Error initializing data:', error);
        Alert.alert("Initialization Error", "An error occurred while initializing data.");
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  /**
   * Toggles the expansion of a location in the location history view.
   *
   * @param {number} locationId - The ID of the location to toggle.
   */
  const toggleLocationExpansion = (locationId: number) => {
    setLocationContents(prevContents => 
      prevContents.map(content => ({
        ...content,
        isExpanded: content.location.id === locationId ? !content.isExpanded : content.isExpanded
      }))
    );
  };

  /**
   * Fetches the participant count for a specific location.
   *
   * @async
   * @param {number} locationId - The ID of the location.
   * @returns {Promise<number>} The participant count or 0 if an error occurs.
   */
  const fetchParticipantCount = async (locationId: number): Promise<number> => {
    try {
      const participantCounts = await getLocationParticipantCounts(locationId);
      return participantCounts?.number_participants ?? 0;
    } catch (error) {
      console.error('Error fetching participant count:', error);
      Alert.alert("Error", "Failed to load participant count for the location.");
      return 0;
    }
  };

  /**
   * Updates the location contents with the latest tracking data.
   *
   * @async
   * @param {Tracking[]} trackingData - The user's tracking data for the project.
   */
  const updateLocationContents = async (trackingData: Tracking[]) => {
    try {
      const uniqueLocationIds = [...new Set(trackingData.map(t => t.location_id))];
      let totalPoints = trackingData.reduce((sum, track) => sum + (track.points || 0), 0);

      const visitedLocations = (await getVisitedLocations(Number(id), uniqueLocationIds)).reverse();
      const participantCounts = await Promise.all(
        visitedLocations.map(loc => fetchParticipantCount(loc.id))
      );

      const updatedContents: LocationContent[] = visitedLocations.map((location, index) => ({
        location,
        participantCount: participantCounts[index],
        isExpanded: index === 0
      }));

      if (updatedContents.length > 0) {
        setCurrentLocation(updatedContents[0].location);
      }

      setLocationContents(updatedContents);
      updatePoints(totalPoints);
      updateVisitedLocations(new Set(uniqueLocationIds));
    } catch (error) {
      console.error('Error updating location contents:', error);
      Alert.alert("Error", "Failed to update location contents.");
    }
  };

  /**
   * Fetches project data including project details, locations, and tracking data.
   *
   * @async
   */
  const fetchProjectData = async () => {
    try {
      setDataInitialized(false);

      const projectData = await getProject(Number(id));
      setProject(projectData);

      const projectLocations = await getProjectLocations(Number(id));
      setLocations(projectLocations);

      if (username) {
        const trackingData = await getParticipantTracking(Number(id), username);
        updateTracking(trackingData);
      }

      setDataInitialized(true);
    } catch (error) {
      console.error('Error fetching project data:', error);
      Alert.alert("Error", "Could not load project data. Please try again.");
    }
  };

  /**
   * Starts location tracking and checks for nearby locations.
   *
   * @async
   * @returns {Promise<void>} The location tracking watcher or an error alert.
   */
  const startLocationTracking = async () => {
    let { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      Alert.alert("Location Permission", "Permission to access location is required.");
      return;
    }

    return ExpoLocation.watchPositionAsync(
      { accuracy: ExpoLocation.Accuracy.High, timeInterval: 5000, distanceInterval: 5 },
      (location) => {
        checkNearbyLocations(location.coords);
      }
    );
  };

  /**
   * Checks if the user is near any unvisited locations and updates current location if within range.
   *
   * @async
   * @param {{ latitude: number; longitude: number }} userLocation - The user's current location.
   */
  const checkNearbyLocations = async (userLocation: { latitude: number; longitude: number }) => {
    if (!dataInitialized) return;

    for (const loc of locations) {
      if (visitedLocations.has(loc.id)) continue;

      if (loc.location_position) {
        const [lat, lng] = loc.location_position
          .replace(/[()]/g, '')
          .split(',')
          .map(coord => parseFloat(coord.trim()));

        if (!isNaN(lat) && !isNaN(lng)) {
          const distance = getDistance(userLocation, { latitude: lat, longitude: lng });

          if (distance < 400 && currentLocation?.id !== loc.id) {
            setCurrentLocation(loc);
            await fetchParticipantCount(loc.id);
            const trackingData = await getParticipantTracking(Number(id), username || "");
            updateTracking(trackingData);
          }
        }
      }
    }
  };

  const initialClueText = project?.homescreen_display === "Display all locations"
    ? "Open \"Map\" tab to view all available locations."
    : project?.initial_clue ?? null;

  if (loading || !dataInitialized) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#7862FC" />
      </View>
    );
  }

  if (!project) {
    return <Text className="text-center mt-4">Project not found</Text>;
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <ProjectOverview
        title={project.title}
        instructions={project.instructions}
        initialClue={initialClueText}
        points={points}
        maxPoints={locations.reduce((sum, loc) => sum + (loc.score_points || 0), 0)}
        locationsVisitedCount={visitedLocations.size}
        totalLocations={locations.length}
      />

      <LocationHistory
        locationContents={locationContents}
        toggleLocationExpansion={toggleLocationExpansion}
      />
    </ScrollView>
  );
}
