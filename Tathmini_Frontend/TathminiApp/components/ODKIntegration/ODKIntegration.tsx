import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedView } from '../ThemedView';
import { ODKIntegrationForm } from './ODKIntegrationForm';
import { ODKSyncStatus } from './ODKSyncStatus';
import { ODKSyncHistory } from './ODKSyncHistory';
import { getODKSyncStatus } from '../../services/ODKService';

interface ODKIntegrationProps {
  projectId: string;
}

export const ODKIntegration: React.FC<ODKIntegrationProps> = ({ projectId }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if project is already connected to ODK
  const checkConnection = async () => {
    try {
      setIsLoading(true);
      await getODKSyncStatus(projectId);
      setIsConnected(true);
    } catch (error) {
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, [projectId]);

  // Handle successful connection
  const handleConnected = () => {
    setIsConnected(true);
  };

  if (isLoading) {
    return <ThemedView style={styles.container} />;
  }

  return (
    <ThemedView style={styles.container}>
      {!isConnected ? (
        <ODKIntegrationForm projectId={projectId} onConnected={handleConnected} />
      ) : (
        <View>
          <ODKSyncStatus projectId={projectId} />
          <ODKSyncHistory projectId={projectId} />
        </View>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 16,
  },
});

// Export all ODK Integration components
export * from './ODKIntegrationForm';
export * from './ODKSyncStatus';
export * from './ODKSyncHistory';