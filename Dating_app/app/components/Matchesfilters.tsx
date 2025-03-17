import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

const MatchesFilter = ({ visible, onClose, onApplyFilters }) => {
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(50);
  const [relationshipGoal, setRelationshipGoal] = useState('');
  const [physicalActivity, setPhysicalActivity] = useState('');
  const [location, setLocation] = useState('');
  const [interests, setInterests] = useState([]);
  const [interestInput, setInterestInput] = useState('');
  
  const relationshipGoals = [
    'Casual dating',
    'Long-term relationship',
    'Marriage',
    'Friendship',
    'Not sure yet'
  ];
  
  const activityLevels = [
    'Never',
    'Rarely',
    'Sometimes',
    'Often',
    'Very active'
  ];
  
  const handleAddInterest = () => {
    if (interestInput.trim() && !interests.includes(interestInput.trim())) {
      setInterests([...interests, interestInput.trim()]);
      setInterestInput('');
    }
  };
  
  const handleRemoveInterest = (interest) => {
    setInterests(interests.filter(item => item !== interest));
  };
  
  const handleApplyFilters = () => {
    onApplyFilters({
      minAge,
      maxAge,
      relationshipGoals: relationshipGoal,
      physicalActivity,
      location: location.trim() || undefined,
      interests: interests.length > 0 ? interests : undefined
    });
    onClose();
  };
  
  const handleReset = () => {
    setMinAge(18);
    setMaxAge(50);
    setRelationshipGoal('');
    setPhysicalActivity('');
    setLocation('');
    setInterests([]);
    setInterestInput('');
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close-outline" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filter Matches</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          {/* Age Range */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Age Range</Text>
            <View style={styles.ageContainer}>
              <Text style={styles.ageText}>{minAge}</Text>
              <Text style={styles.ageText}>to</Text>
              <Text style={styles.ageText}>{maxAge}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={18}
              maximumValue={80}
              step={1}
              value={minAge}
              onValueChange={setMinAge}
              minimumTrackTintColor="#FF6B6B"
              maximumTrackTintColor="#DDDDDD"
              thumbTintColor="#FF6B6B"
            />
            <Slider
              style={styles.slider}
              minimumValue={18}
              maximumValue={80}
              step={1}
              value={maxAge}
              onValueChange={setMaxAge}
              minimumTrackTintColor="#FF6B6B"
              maximumTrackTintColor="#DDDDDD"
              thumbTintColor="#FF6B6B"
            />
          </View>
          
          {/* Relationship Goals */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Relationship Goals</Text>
            <View style={styles.optionsContainer}>
              {relationshipGoals.map((goal) => (
                <TouchableOpacity
                  key={goal}
                  style={[
                    styles.optionButton,
                    relationshipGoal === goal && styles.optionButtonSelected
                  ]}
                  onPress={() => setRelationshipGoal(relationshipGoal === goal ? '' : goal)}
                >
                  <Text 
                    style={[
                      styles.optionText,
                      relationshipGoal === goal && styles.optionTextSelected
                    ]}
                  >
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Physical Activity */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Physical Activity</Text>
            <View style={styles.optionsContainer}>
              {activityLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.optionButton,
                    physicalActivity === level && styles.optionButtonSelected
                  ]}
                  onPress={() => setPhysicalActivity(physicalActivity === level ? '' : level)}
                >
                  <Text 
                    style={[
                      styles.optionText,
                      physicalActivity === level && styles.optionTextSelected
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          {/* Location */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter city or region"
              value={location}
              onChangeText={setLocation}
            />
          </View>
          
          {/* Interests */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>Interests</Text>
            <View style={styles.interestsInputContainer}>
              <TextInput
                style={styles.interestInput}
                placeholder="Add interest"
                value={interestInput}
                onChangeText={setInterestInput}
                returnKeyType="done"
                onSubmitEditing={handleAddInterest}
              />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddInterest}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.interestTags}>
              {interests.map((interest) => (
                <View key={interest} style={styles.interestTag}>
                  <Text style={styles.interestTagText}>{interest}</Text>
                  <TouchableOpacity onPress={() => handleRemoveInterest(interest)}>
                    <Ionicons name="close-circle" size={18} color="#666" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={handleApplyFilters}
          >
            <Text style={styles.applyButtonText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'white',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: '#EEEEEE',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    resetText: {
      color: '#FF69B4', // Changed to hot pink
      fontSize: 16,
    },
    content: {
      flex: 1,
      padding: 15,
    },
    filterSection: {
      marginBottom: 25,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#333',
      marginBottom: 15,
    },
    ageContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    ageText: {
      fontSize: 16,
      color: '#333',
    },
    slider: {
      width: '100%',
      height: 40,
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    optionButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: '#F0F0F0',
      marginRight: 10,
      marginBottom: 10,
    },
    optionButtonSelected: {
      backgroundColor: '#FF69B4', // Changed to hot pink
    },
    optionText: {
      color: '#666',
    },
    optionTextSelected: {
      color: 'white',
    },
    textInput: {
      borderWidth: 1,
      borderColor: '#DDDDDD',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
    },
    interestsInputContainer: {
      flexDirection: 'row',
      marginBottom: 15,
    },
    interestInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#DDDDDD',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
      marginRight: 10,
    },
    addButton: {
      backgroundColor: '#FF69B4', // Changed to hot pink
      borderRadius: 8,
      width: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    interestTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    interestTag: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF0F5', // Changed to lavender blush (light pink)
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 10,
      marginBottom: 10,
    },
    interestTagText: {
      color: '#333',
      marginRight: 5,
    },
    footer: {
      padding: 15,
      borderTopWidth: 1,
      borderTopColor: '#EEEEEE',
    },
    applyButton: {
      backgroundColor: '#FF69B4', // Changed to hot pink
      borderRadius: 25,
      paddingVertical: 12,
      alignItems: 'center',
    },
    applyButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default MatchesFilter;