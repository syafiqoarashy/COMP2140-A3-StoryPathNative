import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, ScrollView, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams } from 'expo-router';
import { 
    createTracking, 
    getLocation, 
    getParticipantTracking,
} from '@/services/api';
import { useUser } from '@/app/context/user';
import { WebView } from 'react-native-webview';
import { useProject } from '@/app/context/project';
import { Tracking, Location } from '@/constants/types';

interface ScannedData {
    project_id: string;
    location_id: string;
}

export default function QRScannerScreen() {
    const { id: projectId } = useLocalSearchParams();
    const { username } = useUser();
    const [scanned, setScanned] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();
    const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
    const [points, setPoints] = useState(0);
    const [visitedLocations, setVisitedLocations] = useState<Set<number>>(new Set());
    const { updateTracking, updateVisitedLocations, updatePoints, refreshProjectData } = useProject();
    const [hasVisited, setHasVisited] = useState(false);

    useEffect(() => {
        const fetchVisitedLocations = async () => {
            try {
                const trackingData = await getParticipantTracking(Number(projectId), username || "");
                const visitedSet = new Set(trackingData.map((track: Tracking) => track.location_id));
                setVisitedLocations(visitedSet);
            } catch (error) {
                console.error('Error fetching visited locations:', error);
            }
        };

        fetchVisitedLocations();
    }, [projectId, username]);

    if (!permission) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Requesting camera permissions...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text className="text-center mb-2">We need your permission to use the camera</Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    const parseQRData = (data: string): ScannedData => {
        const params = new URLSearchParams(data);
        return {
            project_id: params.get('project_id') || '',
            location_id: params.get('location_id') || ''
        };
    };

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        try {
            setScanned(true);
            const scannedData = parseQRData(data);

            if (Number(scannedData.project_id) !== Number(projectId)) {
                Alert.alert('Invalid QR Code', 'This QR code is not associated with the current project.');
                return;
            }

            const locationId = Number(scannedData.location_id);

            if (visitedLocations.has(locationId)) {
                setHasVisited(true);
                return;
            }

            const locationResponse = await getLocation(locationId);
            const locationData = Array.isArray(locationResponse) ? locationResponse[0] : locationResponse;
            setCurrentLocation(locationData);

            await createTracking({
                project_id: Number(projectId),
                location_id: locationId,
                username: "s4829938",
                points: locationData.score_points || 0,
                participant_username: username || "",
            });

            const newTracking = await getParticipantTracking(Number(projectId), username || "");
            updateTracking(newTracking);
            updateVisitedLocations(new Set([...visitedLocations, locationId]));
            updatePoints(points + (locationData.score_points || 0));
            await refreshProjectData();

            Alert.alert('Success', `Location scanned successfully! You earned ${locationData.score_points} points!`);
            setHasVisited(false);
        } catch (error) {
            console.error('Error processing QR code:', error);
            Alert.alert('Error', 'Invalid QR code format');
        }
    };

    return (
        <View className="flex-1">
            {!currentLocation ? (
                <>
                    {hasVisited ? (
                        <View className="flex-1 justify-center items-center p-4">
                            <Text className="text-xl font-semibold text-red-500">Oops! You've been here before</Text>
                            <Text className="text-gray-700 mt-2 text-center">
                                You cannot scan the same location again. Try finding a new location to scan.
                            </Text>
                            <Button title="Try Another Location" onPress={() => setHasVisited(false)} />
                        </View>
                    ) : (
                        <>
                            <CameraView 
                                style={styles.camera} 
                                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                                barcodeScannerSettings={{
                                    barcodeTypes: ['qr'],
                                }}
                            />
                            <View className="absolute top-[45%] left-0 right-0 items-center">
                                <Text className="text-white text-lg bg-black bg-opacity-60 p-2 rounded">
                                    Align QR code within frame
                                </Text>
                            </View>
                        </>
                    )}
                </>
            ) : (
                <ScrollView className="flex-1 bg-white p-4">
                    <View className="mb-6">
                        <Text className="text-2xl font-bold mb-2">{currentLocation.location_name}</Text>
                        <Text className="text-lg text-purple-700">Points earned: {currentLocation.score_points}</Text>
                        <Text className="text-md text-gray-600">Total points: {points}</Text>
                    </View>

                    {currentLocation.location_content && (
                        <View className="mb-6">
                            <Text className="text-lg font-semibold mb-2">Location Content:</Text>
                            <WebView
                                source={{ html: currentLocation.location_content }}
                                className="h-80"
                            />
                        </View>
                    )}

                    {currentLocation.clue && (
                        <View className="mt-6 p-4 bg-gray-100 rounded-lg">
                            <Text className="text-lg font-semibold mb-2">Next Clue:</Text>
                            <Text className="text-md text-gray-700">{currentLocation.clue}</Text>
                        </View>
                    )}

                    <Button
                        title="Scan Another Location"
                        onPress={() => {
                            setScanned(false);
                            setCurrentLocation(null);
                            setHasVisited(false);
                        }}
                    />
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    camera: {
        flex: 1,
    },
});
