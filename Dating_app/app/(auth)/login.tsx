import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../context/authContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  // Combined loading state (either context loading or local loading)
  const isPageLoading = isLoading || localLoading;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      setLocalLoading(true);
      await signIn(email, password);
      // Navigation will be handled by the auth context after successful login
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error types
      if (error.message && error.message.includes('Invalid email')) {
        Alert.alert('Error', 'Invalid email format');
      } else if (error.message && (error.message.includes('Invalid credentials') || error.message.includes('not found'))) {
        Alert.alert('Error', 'Invalid email or password');
      } else if (error.message && error.message.includes('disabled')) {
        Alert.alert('Error', 'This account has been disabled');
      } else if (error.message && (error.message.includes('too many') || error.message.includes('rate limit'))) {
        Alert.alert('Error', 'Too many failed login attempts. Please try again later');
      } else {
        Alert.alert('Error', `Login failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.logoContainer}>
        {/* Logo as View instead of SVG */}
        <View style={styles.logo}>
          <Text style={styles.logoSymbol}>CM</Text>
        </View>
        <Text style={styles.logoText}>Connect Me</Text>
      </View>
      
      <View style={styles.header}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>
      </View>
      
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#666"
          editable={!isPageLoading}
          testID="email-input"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#666"
          editable={!isPageLoading}
          testID="password-input"
        />

        <TouchableOpacity
          style={[styles.button, isPageLoading ? styles.buttonDisabled : null]}
          onPress={handleLogin}
          disabled={isPageLoading}
          testID="login-button"
        >
          {isPageLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
          )}
        </TouchableOpacity>

        {/* Password Reset Link */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/forgot-password')}
          style={styles.forgotPassword}
          disabled={isPageLoading}
          testID="forgot-password-link"
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={[styles.socialButton, styles.googleButton]}
            onPress={() => Alert.alert('Coming Soon', 'Google authentication coming soon!')}
            disabled={isPageLoading}
            testID="google-login-button"
          >
            {/* Google Icon as text */}
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Link to Sign Up Page using Expo Router */}
        <TouchableOpacity
          onPress={() => router.push('/(auth)/signup')}
          style={styles.signUpLink}
          disabled={isPageLoading}
          testID="signup-link"
        >
          <Text style={styles.signUpText}>
            Don't have an account? <Text style={styles.signUpHighlight}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#FF3B77',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  formContainer: {
    // Using marginBottom instead of gap
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#FF3B77',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#ffadc5', // Lighter version of the button color
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#FF3B77',
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    paddingHorizontal: 10,
    color: '#666',
    fontSize: 14,
  },
  socialContainer: {
    // Using marginBottom instead of gap
  },
  socialButton: {
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 15,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  socialButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  signUpLink: {
    marginTop: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpText: {
    fontSize: 16,
    color: '#666',
  },
  signUpHighlight: {
    color: '#FF3B77',
    fontWeight: '600',
  },
  // Add these to your existing styles
logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FF3B77",
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoSymbol: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  googleIcon: {
    color: '#4285F4',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
});