// app/(tabs)/dashboard.tsx
import { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  FlatList,
  ImageBackground,
  Dimensions
} from 'react-native';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../context/authContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';

// Get screen dimensions for responsive layout
const { width } = Dimensions.get('window');

// Placeholder data for potential matches
const POTENTIAL_MATCHES = [
  { id: '1', name: 'Emma', age: 28, image: 'https://source.unsplash.com/random/300x400/?portrait,woman,1', distance: '2 miles away', compatibility: '86%' },
  { id: '2', name: 'Sophia', age: 26, image: 'https://source.unsplash.com/random/300x400/?portrait,woman,2', distance: '5 miles away', compatibility: '92%' },
  { id: '3', name: 'Olivia', age: 29, image: 'https://source.unsplash.com/random/300x400/?portrait,woman,3', distance: '1 mile away', compatibility: '78%' },
  { id: '4', name: 'James', age: 31, image: 'https://source.unsplash.com/random/300x400/?portrait,man,1', distance: '3 miles away', compatibility: '83%' },
  { id: '5', name: 'William', age: 27, image: 'https://source.unsplash.com/random/300x400/?portrait,man,2', distance: '7 miles away', compatibility: '75%' },
];

// Placeholder data for events
const EVENTS = [
  { id: '1', title: 'Singles Mixer', date: 'Sat, Mar 15', image: 'https://source.unsplash.com/random/600x400/?party,event,1', attendees: 42 },
  { id: '2', title: 'Speed Dating', date: 'Sun, Mar 16', image: 'https://source.unsplash.com/random/600x400/?dating,event,2', attendees: 36 },
  { id: '3', title: 'Cocktail Night', date: 'Fri, Mar 21', image: 'https://source.unsplash.com/random/600x400/?cocktail,bar,3', attendees: 58 },
];

export default function Dashboard() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [userName, setUserName] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if the user exists and get their name
    if (user) {
      // Get user display name or email
      setUserName(user.displayName || user.email?.split('@')[0] || 'User');
      
      // Check if user has a profile
      fetchUserProfile();
    } else {
      // Instead of immediate navigation, set a flag
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Safe navigation after component is mounted
    if (!isLoading && !user) {
      router.replace('/(auth)/login');
    }
  }, [isLoading, user, router]);

  const fetchUserProfile = async () => {
    // Simulate API call to get user profile
    // In a real app, you would fetch this from Firebase or your backend
    setTimeout(() => {
      // Simulate a new user without a profile
      const hasProfile = Math.random() > 0.5; // 50% chance of having a profile for demo purposes
      
      if (!hasProfile) {
        setShowProfileSetup(true);
      } else {
        setUserProfile({
          name: userName,
          age: 28,
          location: 'New York, NY',
          bio: 'Living life to the fullest and looking for someone to share adventures with!',
          profileComplete: 85,
          preferences: {
            ageRange: [25, 35],
            distance: 25,
            lookingFor: 'Relationship'
          }
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleProfileSetup = () => {
    router.push('/(tabs)/profile');
  };

  // Render a match card
  const renderMatchCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.matchCard} 
      onPress={() => router.push({
        pathname: '/(tabs)/user-profile',
        params: { userId: item.id }
      })}
    >
      <ImageBackground 
        source={{ uri: item.image }} 
        style={styles.matchImage}
        imageStyle={styles.matchImageStyle}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.matchGradient}
        >
          <View style={styles.matchInfo}>
            <Text style={styles.matchName}>{item.name}, {item.age}</Text>
            <Text style={styles.matchDistance}>{item.distance}</Text>
            <View style={styles.compatibilityBadge}>
              <Text style={styles.compatibilityText}>{item.compatibility} Match</Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  // Render an event card
  const renderEventCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.eventCard} 
      onPress={() => router.push({
        pathname: '/(events)/event-details',
        params: { eventId: item.id }
      })}
    >
      <ImageBackground 
        source={{ uri: item.image }} 
        style={styles.eventImage}
        imageStyle={styles.eventImageStyle}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.eventGradient}
        >
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDate}>{item.date}</Text>
            <Text style={styles.eventAttendees}>{item.attendees} attending</Text>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  // Profile Setup Modal
  const ProfileSetupPrompt = () => (
    <View style={styles.setupContainer}>
      <View style={styles.setupCard}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => setShowProfileSetup(false)}
        >
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        
        <Text style={styles.setupTitle}>Complete Your Profile</Text>
        <Text style={styles.setupDescription}>
          Let's create your perfect profile to help you find better matches!
        </Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.setupButton} 
            onPress={handleProfileSetup}
          >
            <Text style={styles.setupButtonText}>Get Started</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => setShowProfileSetup(false)}
          >
            <Text style={styles.cancelButtonText}>Not Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showProfileSetup && <ProfileSetupPrompt />}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with user info and actions */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>Hello, {userName}!</Text>
              <Text style={styles.tagline}>Find your perfect connection today</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/(profile)/profile')}
            >
              <View style={styles.profileImageContainer}>
                <Image 
                  source={{ uri: 'https://source.unsplash.com/random/200x200/?portrait' }}
                  style={styles.profileImage}
                />
                {userProfile && (
                  <View style={styles.profileCompleteBadge}>
                    <Text style={styles.profileCompleteText}>{userProfile.profileComplete}%</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick action buttons */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => router.push('/(tabs)/discover')}
          >
            <View style={[styles.actionIcon, styles.discoverIcon]}>
              <Ionicons name="search" size={22} color="#fff" />
            </View>
            <Text style={styles.actionText}>Discover</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/matches')}
          >
            <View style={[styles.actionIcon, styles.matchesIcon]}>
              <Ionicons name="heart" size={22} color="#fff" />
            </View>
            <Text style={styles.actionText}>Matches</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/messages')}
          >
            <View style={[styles.actionIcon, styles.messagesIcon]}>
              <Ionicons name="chatbubble" size={22} color="#fff" />
            </View>
            <Text style={styles.actionText}>Messages</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/events')}
          >
            <View style={[styles.actionIcon, styles.eventsIcon]}>
              <Ionicons name="calendar" size={22} color="#fff" />
            </View>
            <Text style={styles.actionText}>Events</Text>
          </TouchableOpacity>
        </View>

        {/* Perfect matches section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Perfect Matches</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/discover')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={POTENTIAL_MATCHES}
            renderItem={renderMatchCard}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.matchesList}
          />
        </View>

        {/* Activity stats cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statsCard, styles.statsCardPrimary]}>
            <View style={styles.statsIconContainer}>
              <Ionicons name="eye-outline" size={24} color="#FF3B77" />
            </View>
            <Text style={styles.statsNumber}>158</Text>
            <Text style={styles.statsLabel}>Profile Views</Text>
            <Text style={styles.statsChange}>+24% this week</Text>
          </View>
          
          <View style={[styles.statsCard, styles.statsCardSecondary]}>
            <View style={styles.statsIconContainer}>
              <FontAwesome name="heart-o" size={24} color="#FF3B77" />
            </View>
            <Text style={styles.statsNumber}>32</Text>
            <Text style={styles.statsLabel}>New Likes</Text>
            <Text style={styles.statsChange}>+12% this week</Text>
          </View>
        </View>

        {/* Upcoming events section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/events')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={EVENTS}
            renderItem={renderEventCard}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventsList}
          />
        </View>

        {/* Dating tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Dating Tips</Text>
          <TouchableOpacity style={styles.tipCard} onPress={() => router.push('/(tips)/conversation-starters')}>
            <MaterialCommunityIcons name="chat-processing-outline" size={24} color="#FF3B77" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>10 Conversation Starters</Text>
              <Text style={styles.tipDescription}>Break the ice with these proven openers</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tipCard} onPress={() => router.push('/(tips)/first-date-ideas')}>
            <MaterialCommunityIcons name="coffee-outline" size={24} color="#FF3B77" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>First Date Ideas</Text>
              <Text style={styles.tipDescription}>Creative ways to make a great impression</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Footer space */}
        <View style={styles.footer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FF3B77',
    paddingTop: 60,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  profileButton: {
    marginLeft: 15,
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    position: 'relative',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'white',
  },
  profileCompleteBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  profileCompleteText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -25,
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  discoverIcon: {
    backgroundColor: '#FF3B77',
  },
  matchesIcon: {
    backgroundColor: '#FF5E8C',
  },
  messagesIcon: {
    backgroundColor: '#FF81A3',
  },
  eventsIcon: {
    backgroundColor: '#FFA4BA',
  },
  actionText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  section: {
    marginTop: 25,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#FF3B77',
    fontWeight: '600',
  },
  matchesList: {
    paddingBottom: 10,
  },
  matchCard: {
    width: width * 0.65,
    height: 220,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  matchImage: {
    width: '100%',
    height: '100%',
  },
  matchImageStyle: {
    borderRadius: 15,
  },
  matchGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 15,
  },
  matchInfo: {
    position: 'relative',
  },
  matchName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  matchDistance: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: 8,
  },
  compatibilityBadge: {
    backgroundColor: '#FF3B77',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compatibilityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 25,
    paddingHorizontal: 20,
    gap: 15,
  },
  statsCard: {
    flex: 1,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    alignItems: 'flex-start',
  },
  statsCardPrimary: {
    backgroundColor: '#FFF0F5',
  },
  statsCardSecondary: {
    backgroundColor: '#FFF0F5',
  },
  statsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statsChange: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  eventsList: {
    paddingBottom: 10,
  },
  eventCard: {
    width: width * 0.7,
    height: 160,
    marginRight: 15,
    borderRadius: 15,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventImageStyle: {
    borderRadius: 15,
  },
  eventGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 15,
  },
  eventInfo: {
    position: 'relative',
  },
  eventTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  eventDate: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    marginBottom: 4,
  },
  eventAttendees: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
  },
  tipsContainer: {
    marginTop: 25,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  tipDescription: {
    fontSize: 13,
    color: '#666',
  },
  footer: {
    height: 80,
  },
  setupContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20,
  },
  setupCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  setupTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  setupDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  setupButton: {
    backgroundColor: '#FF3B77',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 10,
  },
  setupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});