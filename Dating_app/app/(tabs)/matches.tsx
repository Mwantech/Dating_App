import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/authContext'; 
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import MatchesFilter from '../components/Matchesfilters'; 

const MatchesScreen = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('matches'); // 'matches' or 'recommended'
  const [filterVisible, setFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const { authFetch, API_BASE_URL } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (activeFilters) {
      fetchFilteredMatches();
    } else {
      fetchMatches();
    }
  }, [activeTab, activeFilters]);

  const fetchMatches = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = activeTab === 'matches' 
        ? '/matches' 
        : '/matches/recommendations';
      
      const response = await authFetch(endpoint);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch matches');
      }
      
      const data = await response.json();
      
      if (activeTab === 'matches') {
        setMatches(data.matches || []);
      } else {
        setMatches(data.recommendations || []);
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredMatches = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authFetch('/matches/filter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(activeFilters),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch filtered matches');
      }
      
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (err) {
      console.error('Error fetching filtered matches:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
  };

  const handleClearFilters = () => {
    setActiveFilters(null);
  };

  const handleViewProfile = (userId) => {
    navigation.navigate('profile', { userId });
  };

  const renderMatch = ({ item }) => {
    // Ensure we have the necessary data
    const username = item.user?.username || 'User';
    const fullname = item.user?.fullname || username;
    const profileImage = item.profileImage 
      ? { uri: `${API_BASE_URL}/${item.profileImage}` }
      : require('../../assets/images/default_profile.jpeg');
    
    return (
      <TouchableOpacity 
        style={styles.matchCard}
        onPress={() => handleViewProfile(item.user?._id)}
      >
        <Image source={profileImage} style={styles.profileImage} />
        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>{fullname}</Text>
          <Text style={styles.matchUsername}>@{username}</Text>
          
          <View style={styles.compatibilityContainer}>
            <Text style={styles.compatibilityScore}>
              {item.compatibilityScore}% Match
            </Text>
          </View>
          
          <View style={styles.matchDetails}>
            {item.age && (
              <Text style={styles.matchDetail}>{item.age} years</Text>
            )}
            {item.location && (
              <Text style={styles.matchDetail}>{item.location}</Text>
            )}
          </View>
          
          {item.relationshipGoals && (
            <Text style={styles.goalTag}>{item.relationshipGoals}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'matches' && styles.activeTab]}
            onPress={() => {
              setActiveTab('matches');
              if (activeFilters) handleClearFilters();
            }}
          >
            <Text style={[styles.tabText, activeTab === 'matches' && styles.activeTabText]}>
              Top Matches
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'recommended' && styles.activeTab]}
            onPress={() => {
              setActiveTab('recommended');
              if (activeFilters) handleClearFilters();
            }}
          >
            <Text style={[styles.tabText, activeTab === 'recommended' && styles.activeTabText]}>
              Recommended
            </Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterVisible(true)}
        >
          <Ionicons name="options-outline" size={24} color={activeFilters ? "#FF6B6B" : "#333"} />
        </TouchableOpacity>
      </View>
      
      {activeFilters && (
        <View style={styles.activeFiltersBar}>
          <Text style={styles.filtersAppliedText}>Filters applied</Text>
          <TouchableOpacity onPress={handleClearFilters}>
            <Text style={styles.clearFiltersText}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={32} color="#FF6B6B" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={activeFilters ? fetchFilteredMatches : fetchMatches}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#FF6B6B" />
          <Text style={styles.emptyTitle}>
            {activeFilters ? 'No matches found' : 'No matches yet'}
          </Text>
          <Text style={styles.emptyText}>
            {activeFilters 
              ? 'Try adjusting your filters to see more people'
              : 'Complete your profile to increase your chances of finding matches'}
          </Text>
          {activeFilters && (
            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={handleClearFilters}
            >
              <Text style={styles.clearFiltersButtonText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatch}
          keyExtractor={(item) => item._id || item.user?._id || Math.random().toString()}
          contentContainerStyle={styles.matchesList}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={activeFilters ? fetchFilteredMatches : fetchMatches}
        />
      )}
      
      <MatchesFilter
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        onApplyFilters={handleApplyFilters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFF0F5', // Light pink background
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      marginTop: 10,
    },
    tabsContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    tab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: '#FF69B4', // Hot pink border
    },
    tabText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#888888',
    },
    activeTabText: {
      color: '#FF69B4', // Hot pink text for active tab
      fontWeight: '600',
    },
    filterButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    activeFiltersBar: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 8,
      backgroundColor: '#FFE6F0', // Light pink filter bar background
    },
    filtersAppliedText: {
      color: '#FF69B4', // Hot pink text for filter notification
      fontSize: 14,
      fontWeight: '500',
    },
    clearFiltersText: {
      color: '#FF69B4', // Hot pink text for clear button
      fontSize: 14,
      fontWeight: '600',
      textDecorationLine: 'underline',
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    errorText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 20,
    },
    retryButton: {
      backgroundColor: '#FF69B4', // Hot pink button background
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 25,
    },
    retryButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 16,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#333',
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: 20,
    },
    clearFiltersButton: {
      backgroundColor: '#FF69B4', // Hot pink button background
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 25,
    },
    clearFiltersButtonText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 16,
    },
    matchesList: {
      padding: 15,
    },
    matchCard: {
      backgroundColor: 'white',
      borderRadius: 15,
      marginBottom: 15,
      padding: 15,
      flexDirection: 'row',
      shadowColor: '#FF69B4', // Hot pink shadow
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginRight: 15,
      borderWidth: 2,
      borderColor: '#FFCCE5', // Light pink border for profile image
    },
    matchInfo: {
      flex: 1,
    },
    matchName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    matchUsername: {
      fontSize: 14,
      color: '#888',
      marginBottom: 5,
    },
    compatibilityContainer: {
      marginTop: 2,
      marginBottom: 8,
    },
    compatibilityScore: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FF69B4', // Hot pink for compatibility score
    },
    matchDetails: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 8,
    },
    matchDetail: {
      fontSize: 14,
      color: '#666',
      marginRight: 10,
    },
    goalTag: {
      fontSize: 13,
      color: '#FF69B4', // Hot pink text for goal tags
      backgroundColor: '#FFE6F0', // Light pink background for goal tags
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      alignSelf: 'flex-start',
    }
  });

  export default MatchesScreen;