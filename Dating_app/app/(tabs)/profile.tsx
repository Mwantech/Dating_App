import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/authContext';

const ProfileScreen = () => {
  const { user, authFetch, API_BASE_URL } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState({
    bio: '',
    birthdate: new Date(1990, 0, 1),
    gender: 'Prefer not to say',
    interestedIn: [],
    location: '',
    occupation: '',
    interests: [],
    photos: [],
    relationshipGoals: 'Not sure yet',
    height: '',
    physicalActivity: 'Sometimes',
    smoking: 'Never',
    drinking: 'Socially',
    religion: '',
    languages: []
  });

  // Manual birthdate inputs
  const [birthdateDay, setBirthdateDay] = useState('1');
  const [birthdateMonth, setBirthdateMonth] = useState('1');
  const [birthdateYear, setBirthdateYear] = useState('1990');

  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [newInterest, setNewInterest] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Gender options
  const genderOptions = ["Male", "Female", "Non-binary", "Other", "Prefer not to say"];
  const interestedInOptions = ["Male", "Female", "Non-binary", "Other"];
  const relationshipGoalsOptions = ["Casual", "Dating", "Serious", "Marriage", "Not sure yet"];
  const activityOptions = ["Never", "Rarely", "Sometimes", "Often", "Very active"];
  const smokingOptions = ["Never", "Occasionally", "Regularly", "Trying to quit"];
  const drinkingOptions = ["Never", "Socially", "Regularly"];
  const monthOptions = [
    {label: "January", value: "1"},
    {label: "February", value: "2"},
    {label: "March", value: "3"},
    {label: "April", value: "4"},
    {label: "May", value: "5"},
    {label: "June", value: "6"},
    {label: "July", value: "7"},
    {label: "August", value: "8"},
    {label: "September", value: "9"},
    {label: "October", value: "10"},
    {label: "November", value: "11"},
    {label: "December", value: "12"}
  ];

  // Calculate profile completion percentage
  const calculateCompletionPercentage = (profileData) => {
    const requiredFields = [
      'bio', 'birthdate', 'gender', 'interestedIn', 'location', 
      'occupation', 'photos', 'relationshipGoals', 'height'
    ];
    
    let filledCount = 0;
    
    // Check each required field
    requiredFields.forEach(field => {
      if (field === 'photos') {
        // Check if photos array has items
        if (profileData.photos && profileData.photos.length > 0) {
          filledCount++;
        }
      } else if (field === 'interestedIn') {
        // Check if interestedIn array has items
        if (profileData.interestedIn && profileData.interestedIn.length > 0) {
          filledCount++;
        }
      } else if (profileData[field] && 
                (typeof profileData[field] !== 'string' || profileData[field].trim() !== '')) {
        filledCount++;
      }
    });
    
    return Math.round((filledCount / requiredFields.length) * 100);
  };

  // Fetch profile on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  // Update birthdate state from manual inputs
  useEffect(() => {
    try {
      // Validate inputs before creating date
      const day = parseInt(birthdateDay);
      const month = parseInt(birthdateMonth) - 1; // JS months are 0-indexed
      const year = parseInt(birthdateYear);
      
      if (isNaN(day) || isNaN(month) || isNaN(year)) return;
      if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900 || year > 2007) return;
      
      const newDate = new Date(year, month, day);
      
      // Check if date is valid before updating
      if (newDate instanceof Date && !isNaN(newDate.getTime())) {
        setProfile(prevProfile => ({
          ...prevProfile,
          birthdate: newDate
        }));
      }
    } catch (error) {
      console.log('Invalid date input', error);
    }
  }, [birthdateDay, birthdateMonth, birthdateYear]);

  // Set manual date inputs when profile birthdate changes
  useEffect(() => {
    if (profile.birthdate instanceof Date && !isNaN(profile.birthdate.getTime())) {
      setBirthdateDay(profile.birthdate.getDate().toString());
      setBirthdateMonth((profile.birthdate.getMonth() + 1).toString());
      setBirthdateYear(profile.birthdate.getFullYear().toString());
    }
  }, [profile.birthdate]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await authFetch('/profiles/me');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.profile) {
          const profileData = data.data.profile;
          
          // Format birthdate if it exists
          if (profileData.birthdate) {
            const birthdate = new Date(profileData.birthdate);
            profileData.birthdate = birthdate;
            
            // Set manual date inputs
            setBirthdateDay(birthdate.getDate().toString());
            setBirthdateMonth((birthdate.getMonth() + 1).toString());
            setBirthdateYear(birthdate.getFullYear().toString());
          }
          
          setProfile(profileData);
          
          // Calculate completion percentage if not provided by API
          const calculatedPercentage = profileData.completionPercentage || 
                                      calculateCompletionPercentage(profileData);
          setCompletionPercentage(calculatedPercentage);
        } else {
          console.log('No profile found, using default values');
          setCompletionPercentage(0);
        }
      } else {
        const errorData = await response.json();
        console.log('Error fetching profile:', errorData);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setUpdating(true);
    try {
      // Convert height to number if it's a string
      const formattedProfile = {
        ...profile,
        height: profile.height ? Number(profile.height) : null
      };

      const response = await authFetch('/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedProfile),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        const updatedPercentage = calculateCompletionPercentage(formattedProfile);
        setCompletionPercentage(updatedPercentage);
        
        Alert.alert('Success', 'Profile updated successfully');
        fetchProfile();
      } else {
        Alert.alert('Error', data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() !== '' && !profile.interests.includes(newInterest.trim())) {
      setProfile({
        ...profile,
        interests: [...profile.interests, newInterest.trim()]
      });
      setNewInterest('');
    }
  };

  const removeInterest = (interest) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter(item => item !== interest)
    });
  };

  const addLanguage = () => {
    if (newLanguage.trim() !== '' && !profile.languages.includes(newLanguage.trim())) {
      setProfile({
        ...profile,
        languages: [...profile.languages, newLanguage.trim()]
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (language) => {
    setProfile({
      ...profile,
      languages: profile.languages.filter(item => item !== language)
    });
  };

  const handleInterestedInToggle = (option) => {
    if (profile.interestedIn.includes(option)) {
      setProfile({
        ...profile,
        interestedIn: profile.interestedIn.filter(item => item !== option)
      });
    } else {
      setProfile({
        ...profile,
        interestedIn: [...profile.interestedIn, option]
      });
    }
  };

  const pickImage = async () => {
    if (profile.photos.length >= 6) {
      Alert.alert('Limit Reached', 'You can only upload up to 6 photos.');
      return;
    }

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploadingImage(true);
        
        setTimeout(() => {
          setProfile({
            ...profile,
            photos: [...profile.photos, result.assets[0].uri]
          });
          setUploadingImage(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
      setUploadingImage(false);
    }
  };

  const removePhoto = (photoUrl) => {
    setProfile({
      ...profile,
      photos: profile.photos.filter(photo => photo !== photoUrl)
    });
  };

  // Generate an array of day options based on selected month and year
  const getDaysInMonth = (month, year) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i.toString());
    }
    return days;
  };

  // Generate an array of year options (18+ years ago to 120 years ago)
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const minYear = currentYear - 18; // Must be 18+
    const maxYear = currentYear - 120;
    const years = [];
    for (let year = minYear; year >= maxYear; year--) {
      years.push(year.toString());
    }
    return years;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#FF69B4" />
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView showsVerticalScrollIndicator={true}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoSymbol}>CM</Text>
          </View>
          <Text style={styles.logoText}>Connect Me</Text>
        </View>
        
        <View style={styles.header}>
          <Text style={styles.title}>Your Profile</Text>
          {user && <Text style={styles.username}>@{user.username}</Text>}
          <View style={styles.completionContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: `${completionPercentage}%` },
                  completionPercentage < 70 ? styles.progressIncomplete : styles.progressComplete
                ]} 
              />
            </View>
            <Text style={styles.completionText}>
              Profile completion: {completionPercentage}%
              {completionPercentage < 70 && " (70% required)"}
            </Text>
          </View>
        </View>

        {/* Photos Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Photos</Text>
          <Text style={styles.sectionSubtitle}>Add up to 6 photos</Text>
          <View style={styles.photosContainer}>
            {profile.photos.map((photo, index) => (
              <View key={index} style={styles.photoWrapper}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <TouchableOpacity 
                  style={styles.removePhotoButton} 
                  onPress={() => removePhoto(photo)}
                >
                  <Ionicons name="close-circle" size={24} color="#FF69B4" />
                </TouchableOpacity>
              </View>
            ))}
            {profile.photos.length < 6 && (
              <TouchableOpacity 
                style={styles.addPhotoButton} 
                onPress={pickImage}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color="#FF69B4" />
                ) : (
                  <Ionicons name="add" size={40} color="#FF69B4" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
        <Text style={styles.label}>Bio</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Tell others about yourself..."
            multiline
            numberOfLines={4}
            value={profile.bio || ''}
            onChangeText={(text) => setProfile({ ...profile, bio: text })}
          />
          
          <Text style={styles.label}>Birthdate</Text>
          <Text style={styles.sectionSubtitle}>You must be at least 18 years old</Text>
          <View style={styles.birthdateContainer}>
            {/* Day Picker */}
            <View style={styles.birthdatePickerContainer}>
              <Text style={styles.birthdateLabel}>Day</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={birthdateDay}
                  style={styles.smallPicker}
                  onValueChange={setBirthdateDay}
                >
                  {Array.from({length: 31}, (_, i) => i + 1).map((day) => (
                    <Picker.Item key={`day-${day}`} label={day.toString()} value={day.toString()} />
                  ))}
                </Picker>
              </View>
            </View>
            
            {/* Month Picker */}
            <View style={styles.birthdatePickerContainer}>
              <Text style={styles.birthdateLabel}>Month</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={birthdateMonth}
                  style={styles.smallPicker}
                  onValueChange={setBirthdateMonth}
                >
                  {monthOptions.map((month) => (
                    <Picker.Item key={`month-${month.value}`} label={month.label} value={month.value} />
                  ))}
                </Picker>
              </View>
            </View>
            
            {/* Year Picker */}
            <View style={styles.birthdatePickerContainer}>
              <Text style={styles.birthdateLabel}>Year</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={birthdateYear}
                  style={styles.smallPicker}
                  onValueChange={setBirthdateYear}
                >
                  {getYearOptions().map((year) => (
                    <Picker.Item key={`year-${year}`} label={year} value={year} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>
          
          <Text style={styles.label}>Gender</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={profile.gender || 'Prefer not to say'}
              style={styles.picker}
              onValueChange={(itemValue) => setProfile({ ...profile, gender: itemValue })}
            >
              {genderOptions.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
          
          <Text style={styles.label}>Interested In (select all that apply)</Text>
          <View style={styles.checkboxContainer}>
            {interestedInOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.checkbox,
                  profile.interestedIn?.includes(option) && styles.checkboxSelected
                ]}
                onPress={() => handleInterestedInToggle(option)}
              >
                <Text style={profile.interestedIn?.includes(option) ? styles.checkboxTextSelected : styles.checkboxText}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.label}>Relationship Goals</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={profile.relationshipGoals || 'Not sure yet'}
              style={styles.picker}
              onValueChange={(itemValue) => setProfile({ ...profile, relationshipGoals: itemValue })}
            >
              {relationshipGoalsOptions.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
          
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Height in cm"
            keyboardType="numeric"
            value={profile.height ? String(profile.height) : ''}
            onChangeText={(text) => setProfile({ ...profile, height: text })}
          />
        </View>

        {/* Location & Occupation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location & Work</Text>
          <Text style={styles.label}>Location</Text>
          <TextInput
            style={styles.input}
            placeholder="City, Country"
            value={profile.location || ''}
            onChangeText={(text) => setProfile({ ...profile, location: text })}
          />
          <Text style={styles.label}>Occupation</Text>
          <TextInput
            style={styles.input}
            placeholder="What do you do?"
            value={profile.occupation || ''}
            onChangeText={(text) => setProfile({ ...profile, occupation: text })}
          />
        </View>

        {/* Lifestyle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lifestyle</Text>
          <Text style={styles.label}>Physical Activity</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={profile.physicalActivity || 'Sometimes'}
              style={styles.picker}
              onValueChange={(itemValue) => setProfile({ ...profile, physicalActivity: itemValue })}
            >
              {activityOptions.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
          <Text style={styles.label}>Smoking</Text>
          <View style={styles.pickerContainer}>
            <Picker 
              selectedValue={profile.smoking || 'Never'}
              style={styles.picker}
              onValueChange={(itemValue) => setProfile({ ...profile, smoking: itemValue })}
            >
              {smokingOptions.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
          <Text style={styles.label}>Drinking</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={profile.drinking || 'Socially'}
              style={styles.picker}
              onValueChange={(itemValue) => setProfile({ ...profile, drinking: itemValue })}
            >
              {drinkingOptions.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
          <Text style={styles.label}>Religion</Text>
          <TextInput
            style={styles.input}
            placeholder="Religious beliefs (optional)"
            value={profile.religion || ''}
            onChangeText={(text) => setProfile({ ...profile, religion: text })}
          />
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interests & Hobbies</Text>
          <Text style={styles.sectionSubtitle}>What do you enjoy doing?</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Add an interest..."
              value={newInterest}
              onChangeText={setNewInterest}
            />
            <TouchableOpacity style={styles.addButton} onPress={addInterest}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {profile.interests?.map((interest, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{interest}</Text>
                <TouchableOpacity onPress={() => removeInterest(interest)}>
                  <Ionicons name="close-circle" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Languages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Languages</Text>
          <Text style={styles.sectionSubtitle}>Languages you speak</Text>
          <View style={styles.tagInputContainer}>
            <TextInput
              style={styles.tagInput}
              placeholder="Add a language..."
              value={newLanguage}
              onChangeText={setNewLanguage}
            />
            <TouchableOpacity style={styles.addButton} onPress={addLanguage}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tagsContainer}>
            {profile.languages?.map((language, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{language}</Text>
                <TouchableOpacity onPress={() => removeLanguage(language)}>
                  <Ionicons name="close-circle" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveProfile}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#888',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF0F5', // Light pink
    borderBottomWidth: 1,
    borderBottomColor: '#FFB6C1', // Light pink
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF1493', // Deep pink
  },
  username: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  completionContainer: {
    marginTop: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
  },
  progressIncomplete: {
    backgroundColor: '#FFB6C1', // Light pink
  },
  progressComplete: {
    backgroundColor: '#FF69B4', // Hot pink
  },
  completionText: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  photoWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    margin: 4,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  checkbox: {
    borderWidth: 1,
    borderColor: '#FF69B4',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: 'white',
  },
  checkboxSelected: {
    backgroundColor: '#FF69B4',
  },
  checkboxText: {
    color: '#FF69B4',
  },
  checkboxTextSelected: {
    color: 'white',
  },
  tagInputContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#FF69B4',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF69B4',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: 'white',
    marginRight: 4,
  },
  saveButton: {
    backgroundColor: '#FF1493', // Deep pink
    borderRadius: 8,
    padding: 16,
    margin: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;