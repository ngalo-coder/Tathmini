import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { getODKSyncLogs, ODKSyncLog } from '../../services/ODKService';

interface ODKSyncHistoryProps {
  projectId: string;
  limit?: number;
}

export const ODKSyncHistory: React.FC<ODKSyncHistoryProps> = ({ projectId, limit = 5 }) => {
  const colorScheme = useColorScheme() || 'light';
  const [syncLogs, setSyncLogs] = useState<ODKSyncLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Load sync logs
  const loadSyncLogs = async () => {
    try {
      setIsLoading(true);
      const logs = await getODKSyncLogs(projectId, limit);
      setSyncLogs(logs);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load sync logs';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load sync logs on mount
  useEffect(() => {
    loadSyncLogs();
  }, [projectId, limit]);

  // Render a sync log item
  const renderSyncLogItem = ({ item }: { item: ODKSyncLog }) => (
    <View style={styles.logItem}>
      <View style={styles.logHeader}>
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusIndicator, 
              { backgroundColor: item.status === 'success' ? '#4CAF50' : '#FF6B6B' }
            ]} 
          />
          <ThemedText style={styles.statusText}>
            {item.status === 'success' ? 'Success' : 'Failed'}
          </ThemedText>
        </View>
        <ThemedText style={styles.dateText}>{formatDate(item.sync_time)}</ThemedText>
      </View>
      
      {item.message && (
        <ThemedText style={styles.messageText}>{item.message}</ThemedText>
      )}
      
      <View style={styles.statsContainer}>
        <ThemedText style={styles.statsText}>
          Forms: {item.forms_synced}
        </ThemedText>
        <ThemedText style={styles.statsText}>
          Submissions: {item.submissions_synced}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Sync History</ThemedText>
        <TouchableOpacity onPress={loadSyncLogs} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors[colorScheme as 'light' | 'dark'].primary} />
          ) : (
            <ThemedText style={styles.refreshText}>Refresh</ThemedText>
          )}
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: Colors[colorScheme as 'light' | 'dark'].primary }]}
            onPress={loadSyncLogs}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : syncLogs.length === 0 && !isLoading ? (
        <ThemedText style={styles.emptyText}>No sync history available</ThemedText>
      ) : (
        <FlatList
          data={syncLogs}
          renderItem={renderSyncLogItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator 
                size="large" 
                color={Colors[colorScheme as 'light' | 'dark'].primary} 
                style={styles.loader}
              />
            ) : null
          }
        />
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
  listContent: {
    flexGrow: 1,
  },
  logItem: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E4E7EB',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    opacity: 0.7,
  },
  messageText: {
    fontSize: 14,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statsText: {
    fontSize: 12,
    opacity: 0.8,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    color: Colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
  loader: {
    marginTop: 24,
  },
});