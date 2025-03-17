import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';

// API base URL - updated to use localhost for development
const API_BASE_URL = 'http://192.168.150.185:5500/api'; // Updated to match your local server

// Create the auth context
const AuthContext = createContext({});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component that wraps the app and makes auth available
export function AuthProvider({ children }) {
  // State variables
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authToken, setAuthToken] = useState(null);
  
  // Router for navigation
  const router = useRouter();
  const segments = useSegments();

    // Route protection effect - redirect based on auth status
  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    const isWelcomeScreen = segments.length === 2 && segments[1] === 'welcome';
    
    if (!user && !inAuthGroup && !isWelcomeScreen) {
      // If not logged in and not on auth or welcome screen, redirect to welcome
      router.replace('/(auth)/welcome');
    } else if (user && (inAuthGroup || isWelcomeScreen)) {
      // If logged in and on auth screen, redirect to home
      router.replace('/(tabs)/discover');
    }
  }, [user, segments, isLoading]);

  // Sign in function
  const signIn = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Set token and user data in state only (not in AsyncStorage)
      setAuthToken(data.token);
      setUser(data.user);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

 // Sign up function with improved handling for your specific backend response
const signUp = async (userData) => {
  setIsLoading(true);
  try {
    console.log('Registering user with data:', userData);
    
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log('Registration response:', data);
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Your backend returns a success message but not a token
    // So we need to automatically log in the user after registration
    try {
      // Auto-login after successful registration
      const loginResponse = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        }),
      });

      const loginData = await loginResponse.json();
      
      if (!loginResponse.ok) {
        // Registration succeeded but auto-login failed
        // Return success but don't set user/token
        return { 
          success: true, 
          message: data.message,
          autoLoginFailed: true
        };
      }

      // Set token and user data from login response
      setAuthToken(loginData.token);
      setUser(loginData.user);
      
      return {
        success: true,
        message: data.message,
        user: loginData.user
      };
    } catch (loginError) {
      // Registration succeeded but auto-login failed
      console.error('Auto-login after registration failed:', loginError);
      return { 
        success: true, 
        message: data.message,
        autoLoginFailed: true
      };
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

  // Sign out function
  const signOut = async () => {
    // Clear state
    setAuthToken(null);
    setUser(null);
    router.replace('/(auth)/welcome');
  };

  // Password reset function
  const resetPassword = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  // API request with authentication
  const authFetch = async (endpoint, options = {}) => {
    if (!authToken) {
      throw new Error('No authentication token');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${authToken}`,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle token expiration
      if (response.status === 401) {
        signOut();
        throw new Error('Session expired. Please log in again.');
      }

      return response;
    } catch (error) {
      throw error;
    }
  };

  // Context value
  const value = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    authFetch,
    API_BASE_URL,
  };

  // Provide context to children components
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;