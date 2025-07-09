import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { getODKSyncStatus, updateODKSyncStatus, ODKSyncStatus as ODKSyncStatusType } from '../../services/ODKService';

interface ODKSyncStatusProps {
  projectId: string;
}

export const ODKSyncStatus: React.FC<ODKSyncStatusProps> = ({ projectId }) => {
  const colorScheme = useColorScheme() || 'light';
  const [syncStatus, setSyncStatus] = useState<ODKSyncStatusType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Load sync status
  const loadSyncStatus = async () => {
    try {
      setIsLoading(true);
      const status = await getODKSyncStatus(projectId);
      setSyncStatus(status);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sync status';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle sync status
  const toggleSync = async () => {
    if (!syncStatus) return;
    
    try {
      setIsLoading(true);
      const newStatus = syncStatus.status === 'syncing' ? 'paused' : 'syncing';
      const updatedStatus = await updateODKSyncStatus(projectId, newStatus as 'syncing' | 'paused');
      setSyncStatus(updatedStatus);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update sync status';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load sync status on mount
  useEffect(() => {
    loadSyncStatus();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      loadSyncStatus();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [projectId]);

  if (isLoading && !syncStatus) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={Colors[colorScheme as 'light' | 'dark'].primary} />
      </ThemedView>
    );
  }

  if (error && !syncStatus) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].primary }]}
          onPress={loadSyncStatus}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>ODK Sync Status</ThemedText>
        <TouchableOpacity onPress={loadSyncStatus} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors[colorScheme as 'light' | 'dark'].primary} />
          ) : (
            <ThemedText style={styles.refreshText}>Refresh</ThemedText>
          )}
        </TouchableOpacity>
      </View>

      {syncStatus && (
        <>
          <View style={styles.statusRow}>
            <ThemedText style={styles.label}>Status:</ThemedText>
            <View style={styles.statusIndicatorContainer}>
              <View 
                style={[
                  styles.statusIndicator, 
                  { 
                    backgroundColor: syncStatus.status === 'syncing' 
                      ? '#4CAF50' // Green for syncing
                      : syncStatus.status === 'paused' 
                        ? '#FFC107' // Yellow for paused
                        : '#9E9E9E' // Grey for idle
                  }
                ]} 
              />
              <ThemedText style={styles.statusText}>
                {syncStatus.status === 'syncing' 
                  ? 'Syncing' 
                  : syncStatus.status === 'paused' 
                    ? 'Paused' 
                    : 'Idle'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.statusRow}>
            <ThemedText style={styles.label}>Last Sync:</ThemedText>
            <ThemedText>{formatDate(syncStatus.last_sync_time)}</ThemedText>
          </View>

          <View style={styles.statusRow}>
            <ThemedText style={styles.label}>Next Sync:</ThemedText>
            <ThemedText>{formatDate(syncStatus.next_sync_time)}</ThemedText>
          </View>

          <TouchableOpacity 
            style={[
              styles.button, 
              { 
                backgroundColor: syncStatus.status === 'syncing' 
                  ? '#FFC107' // Yellow for pause button
                  : Colors[colorScheme as 'light' | 'dark'].primary // Primary color for sync button
              }
            ]}
            onPress={toggleSync}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {syncStatus.status === 'syncing' ? 'Pause Sync' : 'Start Sync'}
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshText: {
    fontSize: 14,
    color: '#0a7ea4',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
  },
  button: {
    height: 48,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: Colors.error,
    marginBottom: 16,
  },
});