import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { ODKIntegrationForm } from '@/components/ODKIntegration/ODKIntegrationForm';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ODKLoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';

  // TODO: Replace with actual project ID logic if needed.
  // This is the Tathmini Project ID, not the ODK Central Project ID entered in the form.
import { ODKCredentials } from '@/services/ODKService'; // Import ODKCredentials type

// ... (other imports)

export default function ODKLoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() || 'light';

  // TODO: Replace with actual project ID logic if needed.
  // This is the Tathmini Project ID, not the ODK Central Project ID entered in the form.
  const TATHMINI_PROJECT_ID = "1";

  const handleSuccessfulConnection = (connectedCredentials: ODKCredentials) => {
    // Navigate to the data display screen upon successful connection
    router.replace({
      pathname: '/odk-data',
      params: {
        odkProjectId: connectedCredentials.project_id, // ODK Project ID from the form
        odkBaseUrl: connectedCredentials.base_url, // ODK Base URL from the form
        tathminiProjectId: TATHMINI_PROJECT_ID // Internal Tathmini Project ID
      }
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme].background }]}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.headerTitle}>
            Connect to ODK Central
          </ThemedText>
          <ThemedText style={styles.headerSubtitle}>
            Enter your ODK Central credentials and the ODK Project ID to sync data with Tathmini.
          </ThemedText>
          <ODKIntegrationForm
            projectId={TATHMINI_PROJECT_ID}
            onConnected={handleSuccessfulConnection}
          />
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20, // Add some vertical padding
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  headerTitle: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 24, // Larger title for a dedicated screen
  },
  headerSubtitle: {
    textAlign: 'center',
    marginBottom: 30, // More space before the form
    fontSize: 16,
    opacity: 0.8,
  },
});
