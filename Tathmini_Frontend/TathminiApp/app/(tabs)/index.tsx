import { Image } from 'expo-image';
import { Platform, StyleSheet, TouchableOpacity, Text } from 'react-native'; // Added TouchableOpacity, Text
import { useRouter } from 'expo-router'; // Added useRouter

import { ApiStatus } from '@/components/ApiStatus';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
// ODKIntegration is removed as it's now on a dedicated page
import { Colors } from '@/constants/Colors'; // Added Colors
import { useColorScheme } from '@/hooks/useColorScheme'; // Added useColorScheme

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';

  const handleNavigateToODKLogin = () => {
    router.push('/odk-login');
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Tathmini App</ThemedText>
        <HelloWave />
      </ThemedView>
      
      {/* API Status Component */}
      <ApiStatus />
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">About Tathmini</ThemedText>
        <ThemedText>
          Tathmini is a comprehensive assessment application built with React Native and FastAPI.
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Features</ThemedText>
        <ThemedText>
          • Modern React Native UI with Expo
        </ThemedText>
        <ThemedText>
          • FastAPI backend with SQLAlchemy
        </ThemedText>
        <ThemedText>
          • Real-time API status monitoring
        </ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Getting Started</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to customize this screen.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>

      {/* New ODK Connection Section */}
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">ODK Central Connection</ThemedText>
        <ThemedText>
          To connect this application to your ODK Central server for data synchronization, please proceed to the ODK setup page.
        </ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: Colors[colorScheme].primary }]}
          onPress={handleNavigateToODKLogin}
        >
          <Text style={[styles.buttonText, { color: Colors[colorScheme].buttonText || '#FFFFFF' }]}>
            Connect to ODK Central
          </Text>
        </TouchableOpacity>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
