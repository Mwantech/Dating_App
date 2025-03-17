import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/authContext'; // Adjust the import path as needed
import { Ionicons } from '@expo/vector-icons'; // Assuming you're using Expo

const DiscoverProfilesScreen: React.FC = () => {
  const { authFetch, API_BASE_URL } = useAuth();

  // Filter states
  const [gender, setGender] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState('');
  const [relationshipGoals, setRelationshipGoals] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination and data states for infinite scroll
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch profiles based on filters and page number
  const fetchProfiles = async (pageToLoad: number = 1) => {
    if (loading) return; // Prevent duplicate requests
    setLoading(true);
    setError('');

    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', pageToLoad.toString());
      params.append('limit', limit.toString());
      if (gender) params.append('gender', gender);
      if (minAge) params.append('minAge', minAge);
      if (maxAge) params.append('maxAge', maxAge);
      if (location) params.append('location', location);
      if (interests) params.append('interests', interests);
      if (relationshipGoals) params.append('relationshipGoals', relationshipGoals);

      const url = `${API_BASE_URL}/profiles/?${params.toString()}`;
      const response = await authFetch(url, { method: 'GET' });
      const data = await response.json();

      if (!data.success) {
        setError(data.message || 'Failed to fetch profiles');
      } else {
        setTotalPages(data.pagination.totalPages);
        // If it's the first page, replace the list; otherwise, append to it
        if (pageToLoad === 1) {
          setProfiles(data.data);
        } else {
          setProfiles(prev => [...prev, ...data.data]);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch and subsequent fetches on page change
  useEffect(() => {
    fetchProfiles(page);
  }, [page]);

  // When the user presses "Search", reset to page 1 and fetch profiles
  const handleSearch = () => {
    setPage(1);
    setShowFilters(false);
    fetchProfiles(1);
  };

  // Triggered when the user scrolls to the end of the list
  const handleLoadMore = () => {
    if (!loading && page < totalPages) {
      setPage(prev => prev + 1);
    }
  };

  // Pull-to-refresh handler
  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchProfiles(1);
  };

  // Render each profile item
  const renderItem = ({ item }: { item: any }) => {
    const { profile, user } = item;
    return (
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: profile.avatarUrl || 'https://via.placeholder.com/150' }} 
              style={styles.profileImage} 
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user.fullname}</Text>
            <Text style={styles.username}>@{user.username}</Text>
            <View style={styles.ageLocationContainer}>
              <View style={styles.badgeContainer}>
                <Ionicons name="calendar-outline" size={14} color="#FF69B4" />
                <Text style={styles.badgeText}>{profile.age}</Text>
              </View>
              <View style={styles.badgeContainer}>
                <Ionicons name="location-outline" size={14} color="#FF69B4" />
                <Text style={styles.badgeText}>{profile.location}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.profileDetails}>
          {profile.relationshipGoals && (
            <View style={styles.goalBadge}>
              <Text style={styles.goalText}>{profile.relationshipGoals}</Text>
            </View>
          )}
          
          {Array.isArray(profile.interests) && profile.interests.length > 0 && (
            <View style={styles.interestsContainer}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <View style={styles.interestTags}>
                {(Array.isArray(profile.interests) ? profile.interests : [profile.interests]).map((interest, index) => (
                  <View key={index} style={styles.interestTag}>
                    <Text style={styles.interestText}>{interest}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
          
          <TouchableOpacity style={styles.connectButton}>
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons name="options-outline" size={24} color="#FF69B4" />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filterContainer}>
            <Text style={styles.filterTitle}>Filter Profiles</Text>
            
            {/* Gender Picker */}
            <Text style={styles.filterLabel}>Gender</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={gender}
                onValueChange={(itemValue) => setGender(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Any" value="" />
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>

            {/* Age Range Inputs */}
            <View style={styles.rowContainer}>
              <View style={styles.halfInput}>
                <Text style={styles.filterLabel}>Min Age</Text>
                <TextInput
                  style={styles.input}
                  placeholder="18"
                  value={minAge}
                  onChangeText={setMinAge}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.filterLabel}>Max Age</Text>
                <TextInput
                  style={styles.input}
                  placeholder="99"
                  value={maxAge}
                  onChangeText={setMaxAge}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Location */}
            <Text style={styles.filterLabel}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="City, Country"
              value={location}
              onChangeText={setLocation}
            />

            {/* Interests */}
            <Text style={styles.filterLabel}>Interests</Text>
            <TextInput
              style={styles.input}
              placeholder="Travel, Music, Art, etc."
              value={interests}
              onChangeText={setInterests}
            />

            {/* Relationship Goals Picker */}
            <Text style={styles.filterLabel}>Relationship Goals</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={relationshipGoals}
                onValueChange={(itemValue) => setRelationshipGoals(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Any" value="" />
                <Picker.Item label="Friendship" value="friendship" />
                <Picker.Item label="Dating" value="dating" />
                <Picker.Item label="Serious" value="serious" />
              </Picker>
            </View>

            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        )}

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={24} color="#FF4757" />
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={profiles}
            keyExtractor={(item, index) =>
              item.profile._id ? item.profile._id : index.toString()
            }
            renderItem={renderItem}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListFooterComponent={
              loading ? <ActivityIndicator size="large" color="#FF69B4" style={styles.loading} /> : null
            }
            ListEmptyComponent={
              !loading ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="search-outline" size={48} color="#FF69B4" />
                  <Text style={styles.emptyText}>No profiles found</Text>
                  <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default DiscoverProfilesScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFF0F5',
  },
  filterContainer: {
    backgroundColor: '#FFF0F5',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#FF69B4',
  },
  filterLabel: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#FFB6C1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#FFB6C1',
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#FFF',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#FF69B4',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  searchButton: {
    backgroundColor: '#FF69B4',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  searchButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  profileCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 16,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FF69B4',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  username: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  ageLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F5',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    color: '#FF69B4',
    marginLeft: 4,
  },
  profileDetails: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  goalBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF69B4',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  goalText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#444',
  },
  interestsContainer: {
    marginBottom: 16,
  },
  interestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#FFF0F5',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    color: '#FF69B4',
    fontSize: 12,
  },
  connectButton: {
    backgroundColor: '#FF69B4',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  connectButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loading: {
    marginVertical: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
  },
  error: {
    color: '#FF4757',
    marginLeft: 8,
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
});