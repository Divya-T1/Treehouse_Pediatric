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
import { Analytics } from '@vercel/analytics/react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
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
import CategoryScreen from './screens/CategoryScreen.js';

import {
  AddCategory,
  GetCustomCategories,
  GetActivities,
  SaveActivities,
  clearData,
  clearActivities
} from './ActivitiesSaver.js';
import useAppState from './useAppState.js';

// All built-in activities
import { DEFAULT_ACTIVITIES } from './activities.js';
import ChoiceBoard from './screens/ChoiceBoard.js';

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
  const [clearStorageModalVisible, setClearStorageModalVisible] = useState(false);

  const originalCategories = [
    { name: 'Gross Motor', icon: require('./Running.png'), screen: 'Gross Motor' },
    { name: 'Fun Activities', icon: require('./TeddyBear.png'), screen: 'Toys And Activities' },
    { name: 'Fine Motor', icon: require('./Arts.png'), screen: 'Fine Motor' },
    { name: 'Room Spaces', icon: require('./Door.png'), screen: 'Room Spaces' },
    { name: 'Sensory Screen', icon: require('./PlayDoh.png'), screen: 'SensoryScreen' },
    { name: 'ADL', icon: require('./Brushing.png'), screen: 'ADLscreen' },
    { name: 'Regulation', icon: require('./Headphones.png'), screen: 'Regulation' },
    { name: 'Toys/Games', icon: require('./assets/toy.png'), screen: 'ToyScreen' },
  ];

  useEffect(() => {
    window.addEventListener('pagehide', () => {
      clearActivities();
    });
  },[]);

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
        for(var i = 0; i < DEFAULT_ACTIVITIES.length; i++){
          //Adds any of the default categories if they aren't already in CustomCategories in async storage
          await AddCategory(DEFAULT_ACTIVITIES[i].categoryName, DEFAULT_ACTIVITIES[i].icon, DEFAULT_ACTIVITIES[i].activities);
        }
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

    const allActs = [...(DEFAULT_ACTIVITIES || []), ...customActs];

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
        quality: 0.7,  // Reduce quality slightly to keep size manageable
        base64: true,  // Request base64 data
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        // On web, use base64 data URI; on mobile, use file URI
        if (asset.base64) {
          const mimeType = asset.mimeType || 'image/jpeg';
          setNewCatImage(`data:${mimeType};base64,${asset.base64}`);
        } else {
          setNewCatImage(asset.uri);
        }
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

  // Helper: determine category screen from activity id/path
  const getCategoryScreen = (activity) => {
    // If it's a custom category activity, navigate to CustomCategory
    if (activity.category) {
      return { screen: 'CustomCategory', params: { categoryName: activity.category } };
    }

    // Default: return null if category can't be determined
    return null;
  };

  // Handle search result tap: navigate to category screen
  const handleSearchResultPress = (activity) => {
    const categoryInfo = getCategoryScreen(activity);
    if (categoryInfo) {
      try {
        if (categoryInfo.params) {
          navigation.navigate(categoryInfo.screen, categoryInfo.params);
        } else {
          navigation.navigate(categoryInfo.screen);
        }
      } catch (error) {
        console.log('Navigation error:', error, 'Activity:', activity, 'CategoryInfo:', categoryInfo);
      }
    } else {
      console.log('No category found for activity:', activity);
    }
  };

  // Clear all storage and reload data
  const handleClearStorage = async () => {
    try {
      await clearData();
      for(var i = 0; i < DEFAULT_ACTIVITIES.length; i++){
        //Adds any of the default categories if they aren't already in CustomCategories in async storage
        await AddCategory(DEFAULT_ACTIVITIES[i].categoryName, DEFAULT_ACTIVITIES[i].icon, DEFAULT_ACTIVITIES[i].activities);
      }
      // Reload all data
      const cats = await GetCustomCategories();
      setCustomCategories(Array.isArray(cats) ? cats : []);
      const saved = await GetActivities();
      setScheduleActivities(Array.isArray(saved) ? saved : []);
      setClearStorageModalVisible(false);
      console.log('Storage cleared and data reloaded');
    } catch (e) {
      console.log('Clear storage error:', e);
      setClearStorageModalVisible(false);
    }
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
      <View style={styles.headerContainer}>
        <Image source={require('./Logo.png')} />
        <TouchableOpacity
          style={styles.clearStorageButton}
          onPress={() => setClearStorageModalVisible(true)}
        >
          <Text style={styles.clearStorageButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>

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

              const defaultIcon = typeof item.icon === 'string' ? { uri: item.icon } : item.icon;

              const imgSource = getIconForName(item.name, defaultIcon);

              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.searchItem,
                    { backgroundColor: itemSelected ? '#cce5ff' : 'transparent' },
                  ]}
                  onPress={() => handleSearchResultPress(item)}
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

      {/* Clear storage confirmation modal */}
      <Modal visible={clearStorageModalVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={{ fontWeight: '600', fontSize: 18, marginBottom: 10 }}>
              Clear All Storage?
            </Text>
            <Text style={{ marginBottom: 20, textAlign: 'center' }}>
              This will delete all saved activities, custom categories, and schedule data. This action cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Button
                title="Cancel"
                color="#666"
                onPress={() => setClearStorageModalVisible(false)}
              />
              <Button
                title="Continue"
                color="#ff6b6b"
                onPress={handleClearStorage}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Category grid */}
      {searchResults.length === 0 && (
        <ScrollView>
          <View style={styles.grid}>

            {/*
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
            */}

            {customCategories.map((item, i) => {
              const selected = isSelected(item.categoryName);
              // For custom categories you may or may not want to override icon from schedule;
              // here we keep their saved category icon.
              const imgSource = typeof(item.icon) === "string" ? { uri: item.icon } : item.icon;

              //If icon doesn't exist, return nothing
              if (!item.icon) return null;


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
                      style={{ width: 70, height: 70, resizeMode: 'contain' }}
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

  const transitionSpecification = {
    open: {
      animation: 'timing',  
      config: { duration: 100 }, // Duration for opening in ms
    },
    close: {
      animation: 'timing',
      config: { duration: 100 }, // Duration for closing in ms
    },
  };
  const fade = { animation: 'fade',  transitionSpec: transitionSpecification };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Group>
            <Stack.Screen name="Home" component={Homescreen}  options={{animation: 'fade'}}/>
            <Stack.Screen name="Schedule" component={Schedule} options={{animation: 'fade'}}/>
            <Stack.Screen
              name="CustomCategory"
              component={CategoryScreen}
              options={{animation: 'slide_from_right'}}
            />
            <Stack.Screen name = "ChoiceBoard" component={ChoiceBoard} options={{animation: 'fade'}}/>
          </Stack.Group>
          <Stack.Group screenOptions={{ presentation: 'modal'}}>
            <Stack.Screen name="Notes" component={NotesModal} />
          </Stack.Group>
        </Stack.Navigator>
      </NavigationContainer>
      <Analytics />
    </SafeAreaProvider>
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
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  clearStorageButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  clearStorageButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    paddingBottom:100,
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
