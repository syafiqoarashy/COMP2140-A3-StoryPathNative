import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { 
  getProject, 
  getLocations, 
  getParticipantTracking,
  getLocationsByProjectId, 
  getLocationParticipantCounts 
} from '@/services/api';
import * as ExpoLocation from 'expo-location';
import { getDistance } from 'geolib';
import { useUser } from '@/app/context/user';
import { LocationHistory } from '@/components/project/LocationHistory';
import { ProjectOverview } from '@/components/project/ProjectOverview';
import { useProject } from '@/app/context/project';
import { LocationContent, Project, Tracking, Location } from '@/constants/types';

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
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const toggleLocationExpansion = (locationId: number) => {
    setLocationContents(prevContents => 
      prevContents.map(content => ({
        ...content,
        isExpanded: content.location.id === locationId ? !content.isExpanded : content.isExpanded
      }))
    );
  };

  const fetchParticipantCount = async (locationId: number): Promise<number> => {
    try {
      const participantCounts = await getLocationParticipantCounts(locationId);
      return participantCounts[0]?.number_participants ?? 0;
    } catch (error) {
      console.error('Error fetching participant count:', error);
      return 0;
    }
  };

  const updateLocationContents = async (trackingData: Tracking[]) => {
    const uniqueLocationIds = new Set<number>();
    const updatedContents: LocationContent[] = [];
    let totalPoints = 0;

    const sortedTracking = [...trackingData].sort((a, b) => b.id - a.id);

    for (const track of sortedTracking) {
      if (!uniqueLocationIds.has(track.location_id)) {
        uniqueLocationIds.add(track.location_id);

        const location = locations.find(loc => loc.id === track.location_id);
        if (location) {
          const participantCount = await fetchParticipantCount(location.id);
          updatedContents.push({
            location,
            participantCount,
            isExpanded: updatedContents.length === 0
          });

          totalPoints += track.points || 0;
        }
      }
    }

    if (updatedContents.length > 0) {
      setCurrentLocation(updatedContents[0].location);
    }

    setLocationContents(updatedContents);
    updatePoints(totalPoints);
    updateVisitedLocations(uniqueLocationIds);
  };

  const fetchProjectData = async () => {
    try {
      setDataInitialized(false);

      const projectData = await getProject(Number(id));
      const currentProject = Array.isArray(projectData) ? projectData[0] : projectData;
      setProject(currentProject);

      const allLocations = await getLocations();
      const projectLocations = getLocationsByProjectId(allLocations, Number(id));
      setLocations(projectLocations);

      if (username) {
        const trackingData = await getParticipantTracking(Number(id), username);
        updateTracking(trackingData);
      }

      setDataInitialized(true);
    } catch (error) {
      console.error('Error fetching project data:', error);
      throw error;
    }
  };

  const startLocationTracking = async () => {
    let { status } = await ExpoLocation.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      return;
    }

    return ExpoLocation.watchPositionAsync(
      { accuracy: ExpoLocation.Accuracy.High, timeInterval: 5000, distanceInterval: 5 },
      (location) => {
        checkNearbyLocations(location.coords);
      }
    );
  };

  const checkNearbyLocations = async (userLocation: { latitude: number; longitude: number }) => {
    if (!dataInitialized) return;

    for (const loc of locations) {
      if (visitedLocations.has(loc.id)) {
        continue;
      }

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
            const trackingData = await getParticipantTracking(Number(id), username ? username : "");
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
