import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ScrollView,
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import GrossMotorScreen from './screens/GrossMotorScreen';
import ToyAndActScreen from './screens/ToysAndActScreen';
import ToyScreen from './screens/ToyScreen';
import FineMotorScreen from './screens/FineMotorScreen';
import RoomSpacesScreen from './screens/RoomSpacesScreen';
import Regulation from './screens/Regulation';
import SensoryScreen from './screens/SensoryScreen';
import ADLScreen from './screens/ADLscreen.js';
import BottomNavBar from './screens/NavigationOptions.js';
import Schedule from './screens/Schedule.js';
import NotesModal from './screens/NotesModal.js';
import CustomCategoryScreen from './screens/CustomCategoryScreen';

import {
  AddCategory,
  GetCustomCategories,
  GetActivities,
  SaveActivities,
} from './ActivitiesSaver.js';
import useAppState from './useAppState.js';

// All built-in activities
import { ALL_ACTIVITIES } from './activities.js';
import ChoiceBoard from './screens/ChoiceBoard.js';
import { clearData } from './ActivitiesSaver.js';
import { useEffect } from 'react';

const Stack = createNativeStackNavigator();

function Homescreen({ navigation }) {
  const currentAppState = useAppState();

  const [modalVisible, setModalVisible] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState(null);
  const [customCategories, setCustomCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [scheduleActivities, setScheduleActivities] = useState([]);

  const originalCategories = [
    { name: 'Gross Motor', icon: require('./Running.png'), screen: 'Gross Motor' },
    { name: 'Fun Activities', icon: require('./TeddyBear.png'), screen: 'Toys And Activities' },
    { name: 'Fine Motor', icon: require('./Arts.png'), screen: 'Fine Motor' },
    { name: 'Room Spaces', icon: require('./Door.png'), screen: 'Room Spaces' },
    { name: 'Sensory Screen', icon: require('./PlayDoh.png'), screen: 'SensoryScreen' },
    { name: 'ADL', icon: require('./Brushing.png'), screen: 'ADLScreen' },
    { name: 'Regulation', icon: require('./Headphones.png'), screen: 'Regulation' },
    { name: 'Toys/Games', icon: require('./assets/toy.png'), screen: 'ToyScreen' },
  ];

  // helper: is an activity name selected?
  const isSelected = name =>
    scheduleActivities.some(a => a.name === name);

  // helper: get the current icon for a name (schedule wins over defaults)
  const getIconForName = (name, defaultIcon) => {
    const match = scheduleActivities.find(a => a.name === name);
    if (!match) {
      // defaultIcon can be require(...) or already {uri: ...}
      if (typeof defaultIcon === 'string') {
        return { uri: defaultIcon };
      }
      return defaultIcon;
    }
    return typeof match.icon === 'string' ? { uri: match.icon } : match.icon;
  };

  // Load custom categories and schedule
  useEffect(() => {
    (async () => {
      try {
        const cats = await GetCustomCategories();
        setCustomCategories(Array.isArray(cats) ? cats : []);
      } catch (e) {
        console.log('GetCustomCategories error:', e);
        setCustomCategories([]);
      }

      try {
        const saved = await GetActivities();
        setScheduleActivities(Array.isArray(saved) ? saved : []);
      } catch (e) {
        console.log('GetActivities error:', e);
        setScheduleActivities([]);
      }
    })();
  }, []);

  // Search both built-in and custom activities
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const q = searchQuery.toLowerCase();

    const customActs = customCategories.flatMap(cat =>
      (cat.activities || []).map(act => ({
        ...act,
        category: cat.categoryName,
        // act.icon is a URI string
      }))
    );

    const allActs = [...(ALL_ACTIVITIES || []), ...customActs];

    const filtered = allActs.filter(
      a => typeof a.name === 'string' && a.name.toLowerCase().includes(q)
    );
    setSearchResults(filtered);
  }, [searchQuery, customCategories]);

  const pickCategoryImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setNewCatImage(result.assets[0].uri);
      }
    } catch (e) {
      console.log('Image picker error:', e);
    }
  };

  const addCategory = async () => {
    if (!newCatName || !newCatImage) return;

    try {
      const updated = await AddCategory(newCatName, newCatImage);
      setCustomCategories(Array.isArray(updated) ? updated : []);
    } catch (e) {
      console.log('AddCategory error:', e);
    }

    setModalVisible(false);
    setNewCatName('');
    setNewCatImage(null);
  };

  // Add to schedule (no navigation)
  // Toggle in/out of schedule (no navigation)
const toggleScheduleActivity = async activity => {
  const exists = scheduleActivities.some(a => a.name === activity.name);

  let newSchedule;
  if (exists) {
    // remove
    newSchedule = scheduleActivities.filter(a => a.name !== activity.name);
  } else {
    // add
    const newActivity = {
      ...activity,
      icon: activity.icon,           // require(...) or URI string
      category: activity.category || '',
      screen: activity.screen || '',
      notes: activity.notes || '',
    };
    newSchedule = [...scheduleActivities, newActivity];
  }

  setScheduleActivities(newSchedule);
  try {
    await SaveActivities(newSchedule);
  } catch (e) {
    console.log('SaveActivities error:', e);
  }
};


  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('./Logo.png')} />

      {/* Search bar */}
      <TextInput
        placeholder="Search activities..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchInput}
      />

      {/* Search results – tap adds to schedule and highlights */}
      {searchResults.length > 0 && (
        <ScrollView style={{ maxHeight: 250, width: '100%' }}>
          <View style={{ paddingHorizontal: 20 }}>
            {searchResults.map((item, i) => {
              const itemSelected = isSelected(item.name);

              const defaultIcon =
                typeof item.icon === 'string'
                  ? { uri: item.icon }
                  : item.icon;

              const imgSource = getIconForName(item.name, defaultIcon);

              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.searchItem,
                    { backgroundColor: itemSelected ? '#cce5ff' : 'transparent' },
                  ]}
                  onPress={() => toggleScheduleActivity(item)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={imgSource}
                    style={{ width: 40, height: 40, marginRight: 10 }}
                  />
                  <Text style={{ fontSize: 18 }}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Add category */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Category</Text>
      </TouchableOpacity>
      <View style={styles.divider} />

      {/* Category modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={{ fontWeight: '600' }}>Category Name:</Text>
            <TextInput
              style={styles.modalInput}
              value={newCatName}
              onChangeText={setNewCatName}
            />

            <Text style={{ fontWeight: '600', marginTop: 10 }}>
              Category Icon:
            </Text>
            <TouchableOpacity
              style={styles.imageButton}
              onPress={pickCategoryImage}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                PICK IMAGE
              </Text>
            </TouchableOpacity>

            <View style={{ alignItems: 'center', marginVertical: 10 }}>
              <Image
                source={
                  newCatImage
                    ? { uri: newCatImage }
                    : require('./assets/ADL/button.png')
                }
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#eee',
                }}
              />
            </View>

            <Button title="Add" onPress={addCategory} />
            <Button
              title="Cancel"
              color="red"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>

      {/* Category grid */}
      {searchResults.length === 0 && (
        <ScrollView>
          <View style={styles.grid}>
            {originalCategories.map((item, i) => {
              const selected = isSelected(item.name);
              const imgSource = getIconForName(item.name, item.icon);

              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.6}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <View
                    style={[
                      styles.circle,
                      selected && styles.selectedCircle,
                    ]}
                  >
                    <Image
                      source={imgSource}
                      style={{ width: 80, height: 80, borderRadius: 40 }}
                    />
                  </View>
                  <Text style={styles.activityText}>{item.name}</Text>
                </TouchableOpacity>
              );
            })}

            {customCategories.map((item, i) => {
              const selected = isSelected(item.categoryName);
              // For custom categories you may or may not want to override icon from schedule;
              // here we keep their saved category icon.
              const imgSource = { uri: item.icon };

              return (
                <TouchableOpacity
                  key={i}
                  activeOpacity={0.6}
                  onPress={() =>
                    navigation.navigate('CustomCategory', {
                      categoryName: item.categoryName,
                    })
                  }
                >
                  <View
                    style={[
                      styles.circle,
                      selected && styles.selectedCircle,
                    ]}
                  >
                    <Image
                      source={imgSource}
                      style={{ width: 80, height: 80, borderRadius: 40 }}
                    />
                  </View>
                  <Text style={styles.activityText}>
                    {item.categoryName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      <StatusBar style="auto" />
      <BottomNavBar />
    </SafeAreaView>
  );
}


// Stack and App
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Group>
          <Stack.Screen name="Home" component={Homescreen} />
          <Stack.Screen name="Gross Motor" component={GrossMotorScreen} />
          <Stack.Screen
            name="Toys And Activities"
            component={ToyAndActScreen}
          />
          <Stack.Screen name="Fine Motor" component={FineMotorScreen} />
          <Stack.Screen name="Room Spaces" component={RoomSpacesScreen} />
          <Stack.Screen name="Regulation" component={Regulation} />
          <Stack.Screen name="SensoryScreen" component={SensoryScreen} />
          <Stack.Screen name="ADLScreen" component={ADLScreen} />
          <Stack.Screen name="ToyScreen" component={ToyScreen} />
          <Stack.Screen name="Schedule" component={Schedule} />
          <Stack.Screen
            name="CustomCategory"
            component={CustomCategoryScreen}
          />
          <Stack.Screen name = "ChoiceBoard" 
          component={ChoiceBoard}
          />
        </Stack.Group>
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="Notes" component={NotesModal} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    width: '100%',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    margin: 10,
    paddingHorizontal: 8,
    height: 40,
    width: '90%',
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    width: 300,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: 'rgb(211,211,211)',
  },
  selectedCircle: {
    backgroundColor: 'rgb(195, 229, 236)',
  },
  imageButton: {
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  activityText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
    borderRadius: 6,
    alignSelf: 'center',
  },
  addButtonText: { fontSize: 16, fontWeight: '600', color: '#333' },
  divider: {
    height: 1,
    backgroundColor: '#333',
    width: '90%',
    alignSelf: 'center',
    marginVertical: 10,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginVertical: 10,
    paddingHorizontal: 8,
    height: 40,
  },
});
