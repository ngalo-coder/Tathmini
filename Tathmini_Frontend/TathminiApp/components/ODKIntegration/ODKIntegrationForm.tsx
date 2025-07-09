import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert, ColorSchemeName } from 'react-native';
import { connectToODK, ODKCredentials } from '../../services/ODKService';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';

interface ODKIntegrationFormProps {
  projectId: string;
  onConnected: () => void;
}

export const ODKIntegrationForm: React.FC<ODKIntegrationFormProps> = ({ projectId, onConnected }) => {
  const colorScheme = useColorScheme() || 'light';
  const [credentials, setCredentials] = useState<ODKCredentials>({
    base_url: '',
    username: '',
    password: '',
    project_id: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof ODKCredentials, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user types
    if (error) setError(null);
  };

  const handleConnect = async () => {
    // Validate inputs
    if (!credentials.base_url) {
      setError('ODK Central Base URL is required');
      return;
    }
    
    if (!credentials.username) {
      setError('Username is required');
      return;
    }
    
    if (!credentials.password) {
      setError('Password is required');
      return;
    }
    
    if (!credentials.project_id) {
      setError('ODK Central Project ID is required');
      return;
    }

    // Validate base_url format
    if (!credentials.base_url.startsWith('http://') && !credentials.base_url.startsWith('https://')) {
      setError('Base URL must start with http:// or https://');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await connectToODK(projectId, credentials);
      Alert.alert('Connection Successful', 'Successfully connected to ODK Central');
      onConnected();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to ODK Central';
      setError(errorMessage);
      Alert.alert('Connection Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Connect to ODK Central</ThemedText>
      <ThemedText style={styles.description}>
        Enter your ODK Central credentials to connect to your ODK server.
      </ThemedText>
      
      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>ODK Central Base URL <ThemedText style={styles.required}>*</ThemedText></ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: Colors[colorScheme as 'light' | 'dark'].inputBackground,
              color: Colors[colorScheme as 'light' | 'dark'].text,
              borderColor: error && !credentials.base_url ? Colors.error : Colors[colorScheme as 'light' | 'dark'].border
            }
          ]}
          placeholder="https://your-odk-central-server.com"
          placeholderTextColor={Colors[colorScheme as 'light' | 'dark'].placeholderText}
          value={credentials.base_url}
          onChangeText={(value) => handleInputChange('base_url', value)}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <ThemedText style={styles.helperText}>
          The URL of your ODK Central server (e.g., https://odk.example.com)
        </ThemedText>
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>Username <ThemedText style={styles.required}>*</ThemedText></ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: Colors[colorScheme as 'light' | 'dark'].inputBackground,
              color: Colors[colorScheme as 'light' | 'dark'].text,
              borderColor: error && !credentials.username ? Colors.error : Colors[colorScheme as 'light' | 'dark'].border
            }
          ]}
          placeholder="Username"
          placeholderTextColor={Colors[colorScheme as 'light' | 'dark'].placeholderText}
          value={credentials.username}
          onChangeText={(value) => handleInputChange('username', value)}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <ThemedText style={styles.helperText}>
          Your ODK Central username (email address)
        </ThemedText>
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>Password <ThemedText style={styles.required}>*</ThemedText></ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: Colors[colorScheme as 'light' | 'dark'].inputBackground,
              color: Colors[colorScheme as 'light' | 'dark'].text,
              borderColor: error && !credentials.password ? Colors.error : Colors[colorScheme as 'light' | 'dark'].border
            }
          ]}
          placeholder="Password"
          placeholderTextColor={Colors[colorScheme as 'light' | 'dark'].placeholderText}
          value={credentials.password}
          onChangeText={(value) => handleInputChange('password', value)}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <ThemedText style={styles.helperText}>
          Your ODK Central password
        </ThemedText>
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>ODK Central Project ID <ThemedText style={styles.required}>*</ThemedText></ThemedText>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: Colors[colorScheme as 'light' | 'dark'].inputBackground,
              color: Colors[colorScheme as 'light' | 'dark'].text,
              borderColor: error && !credentials.project_id ? Colors.error : Colors[colorScheme as 'light' | 'dark'].border
            }
          ]}
          placeholder="e.g., 1, 2, or your-project-id"
          placeholderTextColor={Colors[colorScheme as 'light' | 'dark'].placeholderText}
          value={credentials.project_id}
          onChangeText={(value) => handleInputChange('project_id', value)}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="default"
        />
        <ThemedText style={styles.helperText}>
          This is the project ID from your ODK Central server, not the Tathmini project ID.
          You can find this in your ODK Central URL after /projects/.
        </ThemedText>
      </View>

      {error && (
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      )}

      <TouchableOpacity 
        style={[
          styles.connectButton,
          { backgroundColor: Colors[colorScheme as 'light' | 'dark'].primary }
        ]}
        onPress={handleConnect}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.connectButtonText}>Connect</Text>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  required: {
    color: Colors.error,
    fontWeight: 'bold',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  errorText: {
    color: Colors.error,
    marginBottom: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  connectButton: {
    height: 48,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});