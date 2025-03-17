import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../context/authContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Combined loading state
  const isPageLoading = isLoading || localLoading;

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLocalLoading(true);
      await resetPassword(email);
      setResetSent(true);
    } catch (error) {
      if (error.message.includes('not found')) {
        Alert.alert('Error', 'No account found with this email address');
      } else if (error.message.includes('network')) {
        Alert.alert('Error', 'Network error. Please check your connection and try again.');
      } else {
        Alert.alert('Error', `Password reset failed: ${error.message}`);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          {resetSent 
            ? 'Check your email for reset instructions' 
            : 'Enter your email to receive password reset instructions'}
        </Text>
      </View>
      
      <View style={styles.form}>
        {!resetSent && (
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#666"
            editable={!isPageLoading}
          />
        )}

        {resetSent ? (
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.buttonText}>Return to Login</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, isPageLoading ? styles.buttonDisabled : null]}
            onPress={handleResetPassword}
            disabled={isPageLoading}
          >
            {isPageLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>
        )}

        {!resetSent && (
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={styles.backLink}
            disabled={isPageLoading}
          >
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    marginTop: 100,
    marginBottom: 50,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  form: {
    gap: 15,
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  button: {
    backgroundColor: '#FF3B77',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ffadc5', // Lighter version of the button color
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backLink: {
    marginTop: 30,
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#FF3B77',
    fontWeight: '500',
  },
});