import React from 'react';
import { StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function ODKDataScreen() {
  const params = useLocalSearchParams<{ odkProjectId?: string; odkBaseUrl?: string; tathminiProjectId?: string }>();
  const colorScheme = useColorScheme() || 'light';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme].background }]}>
      <Stack.Screen options={{ title: "ODK Data" }} />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.headerTitle}>
            ODK Connection Details
          </ThemedText>

          {params.tathminiProjectId && (
            <ThemedText style={styles.detailText}>
              <ThemedText type="defaultSemiBold">Tathmini Project ID:</ThemedText> {params.tathminiProjectId}
            </ThemedText>
          )}
          {params.odkBaseUrl && (
            <ThemedText style={styles.detailText}>
              <ThemedText type="defaultSemiBold">ODK Base URL:</ThemedText> {params.odkBaseUrl}
            </ThemedText>
          )}
          {params.odkProjectId && (
            <ThemedText style={styles.detailText}>
              <ThemedText type="defaultSemiBold">ODK Project ID:</ThemedText> {params.odkProjectId}
            </ThemedText>
          )}

          <ThemedText style={styles.placeholder}>
            Successfully connected! ODK forms and submissions for this project will be displayed here in a table.
          </ThemedText>

          {/* Future: Add components to fetch and display ODK forms and submissions */}
          {/* e.g., <ODKFormsTable odkBaseUrl={params.odkBaseUrl} odkProjectId={params.odkProjectId} /> */}

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
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center', // Center content horizontally
  },
  headerTitle: {
    textAlign: 'center',
    marginBottom: 20,
    fontSize: 22,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'left', // Align details to the left if container is centered
    width: '90%', // Give some width to make it look nice
  },
  placeholder: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 10,
    opacity: 0.9,
    fontStyle: 'italic',
  },
});
