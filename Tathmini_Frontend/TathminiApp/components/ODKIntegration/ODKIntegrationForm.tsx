import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Alert, Platform } from 'react-native';
import { connectToODK, ODKCredentials } from '../../services/ODKService';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { Colors } from '../../constants/Colors';
import { useColorScheme } from '../../hooks/useColorScheme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ODKIntegrationFormProps {
  projectId: string; // This is the Tathmini project ID
  onConnected: () => void;
}

type FocusedField = keyof ODKCredentials | null;
type FieldErrors = { [key in keyof ODKCredentials]?: string };

export const ODKIntegrationForm: React.FC<ODKIntegrationFormProps> = ({ projectId, onConnected }) => {
  const colorScheme = useColorScheme() || 'light';
  const [credentials, setCredentials] = useState<ODKCredentials>({
    base_url: '',
    username: '',
    password: '',
    project_id: '' // This is the ODK Central Project ID
  });
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<FocusedField>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleInputChange = (field: keyof ODKCredentials, value: string) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateFields = (): boolean => {
    const errors: FieldErrors = {};
    let isValid = true;

    if (!credentials.base_url) {
      errors.base_url = 'ODK Central Base URL is required';
      isValid = false;
    } else if (!credentials.base_url.startsWith('http://') && !credentials.base_url.startsWith('https://')) {
      errors.base_url = 'Base URL must start with http:// or https://';
      isValid = false;
    }

    if (!credentials.username) {
      errors.username = 'Username is required';
      isValid = false;
    }

    if (!credentials.password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    if (!credentials.project_id) {
      errors.project_id = 'ODK Central Project ID is required';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleConnect = async () => {
    if (!validateFields()) {
      return;
    }

    setIsLoading(true);
    setFieldErrors({}); // Clear previous global errors if any

    try {
      // Note: The ODKCredentials interface expects project_id to be the ODK project_id.
      // The projectId prop is the Tathmini project ID, used in the API call.
      await connectToODK(projectId, credentials);
      Alert.alert('Connection Successful', 'Successfully connected to ODK Central.');
      onConnected();
    } catch (err) {
      const errorMessage = err instanceof Error ? (err.message || 'Failed to connect. Please check credentials and network.') : 'An unknown error occurred.';
      // Display a general error message for API failures
      setFieldErrors(prev => ({ ...prev, base_url: errorMessage })); // Show general error under base_url or a dedicated spot
      Alert.alert('Connection Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const commonInputStyles = {
    backgroundColor: Colors[colorScheme].inputBackground,
    color: Colors[colorScheme].text,
    borderColor: Colors[colorScheme].border,
  };

  const getDynamicInputStyle = (field: keyof ODKCredentials) => {
    const baseStyle = [styles.input, commonInputStyles];
    if (focusedField === field) {
      baseStyle.push({ borderColor: Colors[colorScheme].primary });
    }
    if (fieldErrors[field]) {
      baseStyle.push({ borderColor: Colors.error });
    }
    return baseStyle;
  };

  const renderError = (field: keyof ODKCredentials) => {
    if (fieldErrors[field]) {
      return <ThemedText style={styles.inlineErrorText}>{fieldErrors[field]}</ThemedText>;
    }
    return null;
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Connect to ODK Central</ThemedText>
      <ThemedText style={styles.description}>
        Enter your ODK Central server credentials and Project ID.
      </ThemedText>
      
      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>ODK Central Base URL <ThemedText style={styles.required}>*</ThemedText></ThemedText>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="web" size={20} color={Colors[colorScheme].icon} style={styles.icon} />
          <TextInput
            style={getDynamicInputStyle('base_url')}
            placeholder="https://your-odk-server.com"
            placeholderTextColor={Colors[colorScheme].placeholderText}
            value={credentials.base_url}
            onChangeText={(value) => handleInputChange('base_url', value)}
            onFocus={() => setFocusedField('base_url')}
            onBlur={() => setFocusedField(null)}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>
        {renderError('base_url')}
        <ThemedText style={styles.helperText}>
          e.g., https://odk.example.com
        </ThemedText>
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>Username <ThemedText style={styles.required}>*</ThemedText></ThemedText>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="account-outline" size={20} color={Colors[colorScheme].icon} style={styles.icon} />
          <TextInput
            style={getDynamicInputStyle('username')}
            placeholder="Your ODK username"
            placeholderTextColor={Colors[colorScheme].placeholderText}
            value={credentials.username}
            onChangeText={(value) => handleInputChange('username', value)}
            onFocus={() => setFocusedField('username')}
            onBlur={() => setFocusedField(null)}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {renderError('username')}
        <ThemedText style={styles.helperText}>
          Usually your email address.
        </ThemedText>
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>Password <ThemedText style={styles.required}>*</ThemedText></ThemedText>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="lock-outline" size={20} color={Colors[colorScheme].icon} style={styles.icon} />
          <TextInput
            style={getDynamicInputStyle('password')}
            placeholder="Your ODK password"
            placeholderTextColor={Colors[colorScheme].placeholderText}
            value={credentials.password}
            onChangeText={(value) => handleInputChange('password', value)}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {renderError('password')}
        <ThemedText style={styles.helperText}>
          Your ODK Central password.
        </ThemedText>
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>ODK Central Project ID <ThemedText style={styles.required}>*</ThemedText></ThemedText>
        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="identifier" size={20} color={Colors[colorScheme].icon} style={styles.icon} />
          <TextInput
            style={getDynamicInputStyle('project_id')}
            placeholder="e.g., 1 or your-project-id"
            placeholderTextColor={Colors[colorScheme].placeholderText}
            value={credentials.project_id}
            onChangeText={(value) => handleInputChange('project_id', value)}
            onFocus={() => setFocusedField('project_id')}
            onBlur={() => setFocusedField(null)}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {renderError('project_id')}
        <ThemedText style={styles.helperText}>
          The numeric or string ID of your project in ODK Central.
        </ThemedText>
      </View>

      <TouchableOpacity 
        style={[
          styles.connectButton,
          { backgroundColor: isLoading ? Colors[colorScheme].disabled : Colors[colorScheme].primary }
        ]}
        onPress={handleConnect}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors[colorScheme].buttonText} />
        ) : (
          <Text style={[styles.connectButtonText, { color: Colors[colorScheme].buttonText }]}>Connect</Text>
        )}
      </TouchableOpacity>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20, // Increased padding
    borderRadius: 12, // Slightly more pronounced border radius
    marginVertical: 10,
    // Adding subtle shadow for a card-like effect
    ...Platform.select({
      ios: {
        shadowColor: Colors.dark.background, // Using dark background for shadow for visibility in both themes
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: 20, // Slightly larger title
    fontWeight: 'bold',
    marginBottom: 10, // Adjusted spacing
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    marginBottom: 20, // Adjusted spacing
    opacity: 0.8,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20, // Increased spacing between form groups
  },
  label: {
    marginBottom: 8,
    fontSize: 15, // Slightly larger label
    fontWeight: '500',
  },
  required: {
    color: Colors.error, // Make sure Colors.error is defined
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5, // Slightly thicker border for better visibility
    borderRadius: 8, // More rounded inputs
    height: 50, // Standard height
  },
  icon: {
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: '100%', // Take full height of container
    paddingHorizontal: 10, // Padding inside input, next to icon
    fontSize: 16,
    borderLeftWidth: 0, // Remove left border as it's part of inputContainer
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  inlineErrorText: {
    color: Colors.error, // Make sure Colors.error is defined
    marginTop: 5,
    fontSize: 12,
  },
  helperText: {
    fontSize: 12,
    marginTop: 6, // Adjusted spacing
    opacity: 0.7,
  },
  connectButton: {
    height: 50, // Standard height
    borderRadius: 8, // Consistent rounding
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12, // Adjusted spacing
    paddingVertical: 12,
  },
  connectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

// Ensure Colors.error, Colors.light.icon, Colors.dark.icon,
// Colors.light.inputBackground, Colors.dark.inputBackground,
// Colors.light.placeholderText, Colors.dark.placeholderText,
// Colors.light.primary, Colors.dark.primary,
// Colors.light.disabled, Colors.dark.disabled, (you might need to add 'disabled' to your Colors.ts)
// Colors.light.buttonText, Colors.dark.buttonText (you might need to add 'buttonText' to your Colors.ts)
// are defined in your constants/Colors.ts file.
// For example, in Colors.ts:
// error: '#FF3B30',
// light: {
//   ...
//   icon: '#8E8E93',
//   inputBackground: '#F2F2F7',
//   placeholderText: '#C7C7CD',
//   primary: '#007AFF',
//   disabled: '#D1D1D6',
//   buttonText: '#FFFFFF',
//   border: '#C7C7CD',
//   ...
// },
// dark: {
//   ...
//   icon: '#8E8E93',
//   inputBackground: '#2C2C2E',
//   placeholderText: '#8E8E93',
//   primary: '#0A84FF',
//   disabled: '#3A3A3C',
//   buttonText: '#FFFFFF',
//   border: '#545458',
//   ...
// }