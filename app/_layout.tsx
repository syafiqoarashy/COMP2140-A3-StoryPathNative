import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { UserProvider } from './context/user';
import { ProjectProvider } from './context/project';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import "../global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <UserProvider>
      <ProjectProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(drawer)" />
        </Stack>
      </ProjectProvider>
    </UserProvider>
  );
}