import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { 
  getProject,
  getParticipantTracking,
  getProjectLocations,
  getVisitedLocations,
} from '@/services/api';
import { useUser } from '@/app/context/user';
import { useLocalSearchParams } from 'expo-router';
import { LocationCoords, Project, Tracking, Location as LocationType } from '@/constants/types';

/**
 * MapScreen component displays a map with markers for unlocked and available project locations.
 * It handles live location tracking and manages location-based data fetching.
 *
 * @returns {JSX.Element} The map screen displaying user location and project markers.
 */
export default function MapScreen() {
    const { id } = useLocalSearchParams();
    const projectId = id ? Number(id) : NaN;
    const { username } = useUser();
    
    const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
    const [locations, setLocations] = useState<LocationType[]>([]);
    const [unlockedLocations, setUnlockedLocations] = useState<LocationType[]>([]);
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [trackingData, setTrackingData] = useState<Tracking[]>([]);

    useEffect(() => {
        if (isNaN(projectId)) {
            console.error("Invalid projectId:", projectId);
            Alert.alert("Error", "Invalid project ID.");
            setLoading(false);
            return;
        }

        const initializeData = async () => {
            try {
                await Promise.all([setupLocation(), fetchProjectData()]);
            } catch (error) {
                console.error('Error initializing data:', error);
                Alert.alert("Error", "Failed to initialize data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, [projectId]);

    /**
     * Sets up user location tracking with permission checks and updates user location in real-time.
     *
     * @async
     * @returns {Promise<void>} Sets up location tracking or logs errors if permission is denied.
     */
    const setupLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.error('Permission to access location was denied');
                Alert.alert("Location Permission", "Permission to access location is required to use the map.");
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const initialLocation: LocationCoords = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            };
            setUserLocation(initialLocation);

            const subscription = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.High,
                    timeInterval: 5000,
                    distanceInterval: 5,
                },
                (newLocation) => {
                    setUserLocation({
                        latitude: newLocation.coords.latitude,
                        longitude: newLocation.coords.longitude,
                    });
                }
            );

            return () => {
                subscription.remove();
            };
        } catch (error) {
            console.error('Error setting up location:', error);
            Alert.alert("Error", "Failed to access location. Please try again.");
        }
    };

    /**
     * Fetches project details, locations, and participant tracking data.
     * Updates the project, locations, and unlocked locations based on tracking data.
     *
     * @async
     */
    const fetchProjectData = async () => {
        try {
            const projectData = await getProject(projectId);
            setProject(projectData);

            const projectLocations = await getProjectLocations(projectId);
            setLocations(projectLocations);

            if (username) {
                const tracking = await getParticipantTracking(projectId, username);
                setTrackingData(tracking);

                const locationIds = tracking.map(t => t.location_id);
                const visitedLocs = await getVisitedLocations(projectId, locationIds);
                setUnlockedLocations(visitedLocs);
            }
        } catch (error) {
            console.error('Error fetching project data:', error);
            Alert.alert("Error", "Could not load project data. Please try again later.");
        }
    };

    /**
     * Determines whether to display all project locations on the map based on project settings.
     *
     * @returns {boolean} True if all locations should be displayed, false otherwise.
     */
    const shouldDisplayAllLocations = () => {
        return project?.homescreen_display === "Display all locations";
    };

    /**
     * Returns the locations that should be visible on the map based on user progress and project settings.
     *
     * @returns {LocationType[]} Array of locations to be displayed on the map.
     */
    const getVisibleLocations = () => {
        if (shouldDisplayAllLocations()) {
            return locations;
        }
        return unlockedLocations;
    };

    if (loading || !userLocation || !project) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#7862FC" />
            </View>
        );
    }

    return (
        <View className="flex-1">
            <MapView
                style={{ width: '100%', height: '100%' }}
                initialRegion={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {getVisibleLocations().map((location) => {
                    if (!location.location_position) {
                        console.error(`Missing location_position for location ID ${location.id}`);
                        return null;
                    }

                    const [lat, lng] = location.location_position
                        .replace(/[()]/g, '')
                        .split(',')
                        .map(coord => parseFloat(coord.trim()));

                    if (isNaN(lat) || isNaN(lng)) {
                        console.error(`Invalid coordinates for location ID ${location.id}:`, location.location_position);
                        return null;
                    }

                    const isUnlocked = unlockedLocations.some(loc => loc.id === location.id);

                    return (
                        <React.Fragment key={location.id}>
                            <Marker
                                coordinate={{ latitude: lat, longitude: lng }}
                                title={location.location_name}
                                pinColor={isUnlocked ? "green" : "red"}
                            />
                            {(isUnlocked || shouldDisplayAllLocations()) && (
                                <Circle
                                    center={{ latitude: lat, longitude: lng }}
                                    radius={200}
                                    strokeColor="rgba(0, 150, 136, 0.5)"
                                    fillColor="rgba(0, 150, 136, 0.2)"
                                />
                            )}
                        </React.Fragment>
                    );
                })}
            </MapView>
        </View>
    );
}
