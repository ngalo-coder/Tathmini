import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { checkApiHealth } from '../services/ApiService';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

/**
 * Component to display the status of the API connection
 */
export const ApiStatus = () => {
  const [status, setStatus] = useState<'loading' | 'healthy' | 'unavailable'>('loading');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const healthData = await checkApiHealth();
        if (healthData.status === 'healthy') {
          setStatus('healthy');
        } else {
          setStatus('unavailable');
        }
      } catch (error) {
        setStatus('unavailable');
      }
    };

    checkHealth();

    // Retry every 10 seconds if the API is unavailable
    const intervalId = setInterval(() => {
      if (status === 'unavailable') {
        setRetryCount(prev => prev + 1);
        checkHealth();
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [status, retryCount]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">Backend API Status</ThemedText>
      
      <View style={styles.statusContainer}>
        {status === 'loading' ? (
          <>
            <ActivityIndicator size="small" />
            <ThemedText>Checking API connection...</ThemedText>
          </>
        ) : status === 'healthy' ? (
          <>
            <View style={[styles.statusIndicator, styles.statusHealthy]} />
            <ThemedText>Connected to Tathmini API</ThemedText>
          </>
        ) : (
          <>
            <View style={[styles.statusIndicator, styles.statusUnavailable]} />
            <ThemedText>API unavailable. Retrying... ({retryCount})</ThemedText>
          </>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusHealthy: {
    backgroundColor: '#4CAF50', // Green
  },
  statusUnavailable: {
    backgroundColor: '#F44336', // Red
  },
});