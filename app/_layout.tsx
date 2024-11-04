import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { UserProvider } from './context/user';
import { ProjectProvider } from './context/project';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import "../global.css";

SplashScreen.preventAutoHideAsync();

/**
 * RootLayout component sets up the main app structure, including:
 * - User and project context providers to manage global state.
 * - Custom font loading with `expo-font`.
 * - Splash screen handling with `expo-splash-screen`.
 *
 * @component
 * @returns {JSX.Element | null} The layout wrapped with context providers and navigation, or null if fonts are not loaded.
 */
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
    /**
     * UserProvider and ProjectProvider wrap the app with user and project contexts.
     * Stack navigator manages the main app screens, with the drawer as the initial screen.
     */
    <UserProvider>
      <ProjectProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(drawer)" />
        </Stack>
      </ProjectProvider>
    </UserProvider>
  );
}
