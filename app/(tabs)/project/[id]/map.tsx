import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

interface LocationCoords {
    latitude: number;
    longitude: number;
}

export default function MapScreen() {
    // Add proper typing to useState
    const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const setupLocation = async () => {
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    console.error('Permission to access location was denied');
                    return;
                }

                const location = await Location.getCurrentPositionAsync({});
                const initialLocation: LocationCoords = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                };
                setUserLocation(initialLocation);
                setLoading(false);

                const subscription = await Location.watchPositionAsync(
                    {
                        accuracy: Location.Accuracy.High,
                        timeInterval: 5000,
                        distanceInterval: 5,
                    },
                    (newLocation) => {
                        const currentLocation: LocationCoords = {
                            latitude: newLocation.coords.latitude,
                            longitude: newLocation.coords.longitude,
                        };
                        setUserLocation(currentLocation);
                    }
                );

                return () => {
                    if (subscription) {
                        subscription.remove();
                    }
                };
            } catch (error) {
                console.error('Error setting up location:', error);
                setLoading(false);
            }
        };

        setupLocation();
    }, []);

    if (loading || !userLocation) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#7862FC" />
            </View>
        );
    }

    return (
        <View className="flex-1">
            <MapView
                className="w-full h-full"
                initialRegion={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                <Marker
                    coordinate={{
                        latitude: userLocation.latitude,
                        longitude: userLocation.longitude,
                    }}
                    title="You are here"
                    pinColor="#7862FC"
                />
            </MapView>
        </View>
    );
}