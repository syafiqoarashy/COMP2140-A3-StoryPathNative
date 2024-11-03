import React, { useState } from 'react';
import { Text, View, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams } from 'expo-router';
import { createTracking } from '@/services/api';
import { useUser } from '@/app/context/user';
import { BarcodeScanningResult } from 'expo-camera';

interface ScannedData {
    project_id: number;
    location_id: number;
}

export default function QRScannerScreen() {
    const { id: projectId } = useLocalSearchParams();
    const { username } = useUser();
    const [scanned, setScanned] = useState(false);
    const [message, setMessage] = useState('');
    const [permission, requestPermission] = useCameraPermissions();

    // Handle permissions
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
                <Text className="text-center mb-4">
                    We need your permission to use the camera
                </Text>
                <Button onPress={requestPermission} title="Grant Permission" />
            </View>
        );
    }

    const handleBarCodeScanned = async (scanningResult: BarcodeScanningResult) => {
        try {
            setScanned(true);

            // Parse QR code data
            const scannedData: ScannedData = JSON.parse(scanningResult.data);

            // Verify this QR code is for the current project
            if (scannedData.project_id !== Number(projectId)) {
                setMessage('This QR code is not for this project');
                return;
            }

            // Create tracking record
            await createTracking({
                project_id: Number(projectId),
                location_id: scannedData.location_id,
                username: username!,
                points: 10,
                participant_username: username
            });

            setMessage('Location scanned successfully!');

        } catch (error) {
            console.error('Error processing QR code:', error);
            setMessage('Invalid QR code format');
        }
    };

    return (
        <View className="flex-1">
            <CameraView
                className="flex-1"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'], // Changed from barCodeTypes to barcodeTypes
                }}
            />

            {scanned && (
                <View className="absolute bottom-0 left-0 right-0 bg-white p-4">
                    <Text className="text-center text-lg mb-4">{message}</Text>
                    <Button
                        title="Tap to Scan Again"
                        onPress={() => {
                            setScanned(false);
                            setMessage('');
                        }}
                    />
                </View>
            )}
        </View>
    );
}