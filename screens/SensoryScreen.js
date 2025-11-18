import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView } from 'react-native';
import {
  StyleSheet, Text, View, Image, SafeAreaView, TouchableOpacity,
  Modal, TextInput, Button, Alert
} from 'react-native';
import BottomNavBar from './NavigationOptions.js';
import {
  SaveActivities,
  GetActivities,
  GetCustomCategories,
  AddActivityToCategory,
  AddCategory
} from '../ActivitiesSaver.js';
import * as ImagePicker from 'expo-image-picker';

export default function SensoryScreen() {
  // CATEGORY NAME (exact)
  const categoryName = "Sensory";

  // static assets (RN requires)
  const logo = require('../Logo.png');
  const images = [
    require('../assets/Sensory/imageS.png'),
    require('../assets/Sensory/peanutball.png'),
    require('../assets/Sensory/PlayDoh.png'),
    require('../assets/Sensory/putty.png'),
    require('../assets/Sensory/sandpit.png'),
    require('../assets/Sensory/swing.png'),
  ];

  // matching ID strings for saving/selection (must match other screens)
  const ids = [
    '../assets/Sensory/imageS.png',
    '../assets/Sensory/peanutball.png',
    '../assets/Sensory/PlayDoh.png',
    '../assets/Sensory/putty.png',
    '../assets/Sensory/sandpit.png',
    '../assets/Sensory/swing.png',
  ];

  const names = [
    "Clay",
    "Peanut Ball",
    "PlayDoh",
    "Putty",
    "Sandpit",
    "Swing",
  ];

  // selection state
  const [selectedActivities, setSelectedActivities] = useState([]);

  // custom activities for this category
  const [customActivities, setCustomActivities] = useState([]);

  // modal + new activity state
  const [modalVisible, setModalVisible] = useState(false);
  const [newActName, setNewActName] = useState('');
  const [newActIcon, setNewActIcon] = useState('');

  // request permissions for image picker
  useEffect(() => {
    (async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Photo library permissions required to pick activity icons!');
        }
      } catch (err) {
        console.log('permission error', err);
      }
    })();
  }, []);

  // load saved selections and custom activities on mount
  useEffect(() => {
    (async () => {
      try {
        // load schedule selections
        const saved = await GetActivities();
        const savedFilePaths = (saved || []).map(item => item.filePath);
        setSelectedActivities(savedFilePaths);

        // load custom categories and this category's activities
        const categories = await GetCustomCategories();
        const found = (categories || []).find(c => c.categoryName === categoryName);
        setCustomActivities(found?.activities || []);
      } catch (err) {
        console.log('load Sensory error', err);
        setSelectedActivities([]);
        setCustomActivities([]);
      }
    })();
  }, []);

  // toggle selection for any activity id (either static id or custom icon uri)
  async function toggleSelection(id) {
    try {
      const prev = await GetActivities();
      const exists = (prev || []).some(item => item.filePath === id);

      const next = exists
        ? prev.filter(item => item.filePath !== id)
        : [...(prev || []), { filePath: id, notes: '' }];

      await SaveActivities(next);
      setSelectedActivities(next.map(item => item.filePath));
    } catch (err) {
      console.log('toggleSelection error', err);
    }
  }

  // open image picker
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setNewActIcon(result.assets[0].uri);
      }
    } catch (err) {
      console.log('pickImage error', err);
      Alert.alert('Error selecting image.');
    }
  };

  // add custom activity to this category (create category if missing)
  const addActivity = async () => {
    if (!newActName || !newActIcon) {
      Alert.alert('Please enter a name and choose an image.');
      return;
    }

    const activity = { name: newActName.trim(), icon: newActIcon, notes: '' };

    try {
      // load existing custom categories
      let categories = await GetCustomCategories();
      if (!Array.isArray(categories)) categories = [];

      // create category if missing
      if (!categories.find(c => c.categoryName === categoryName)) {
        await AddCategory(categoryName, newActIcon);
        categories = await GetCustomCategories();
      }

      // add the activity
      const updated = await AddActivityToCategory(categoryName, activity);

      // update UI to show the just-added activity
      const cat = (updated || []).find(c => c.categoryName === categoryName);
      setCustomActivities(cat?.activities || []);

      // reset modal
      setNewActName('');
      setNewActIcon('');
      setModalVisible(false);
    } catch (err) {
      console.log('addActivity error', err);
      Alert.alert('Error saving activity.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={logo} />

      {/* Add custom activity button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Activity</Text>
      </TouchableOpacity>

      <ScrollView>
        <View style={styles.grid}>

          {/* built-in activities */}
          {images.map((img, i) => (
            <TouchableOpacity
              key={`built-${i}`}
              activeOpacity={0.6}
              onPress={() => toggleSelection(ids[i])}
            >
              <View style={[styles.circle, selectedActivities.includes(ids[i]) && styles.selectedCircle]}>
                <Image source={img} style={styles.circleImage} />
              </View>
              <Text style={styles.activityText}>{names[i]}</Text>
            </TouchableOpacity>
          ))}

          {/* custom activities (persisted) */}
          {customActivities.map((act, i) => (
            <TouchableOpacity
              key={`custom-${i}`}
              activeOpacity={0.6}
              onPress={() => toggleSelection(act.icon)}
            >
              <View style={[styles.circle, selectedActivities.includes(act.icon) && styles.selectedCircle]}>
                <Image source={{ uri: act.icon }} style={styles.circleImage} />
              </View>
              <Text style={styles.activityText}>{act.name}</Text>
            </TouchableOpacity>
          ))}

        </View>
      </ScrollView>

      <StatusBar style="auto" />
      <BottomNavBar />

      {/* ADD CUSTOM ACTIVITY MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={{ fontWeight: '600' }}>Activity Name:</Text>
            <TextInput
              style={styles.modalInput}
              value={newActName}
              onChangeText={setNewActName}
            />

            <Text style={{ fontWeight: '600', marginTop: 10 }}>Activity Image:</Text>
            <Button title={newActIcon ? 'Change Image' : 'Pick Image'} onPress={pickImage} />

            {newActIcon ? (
              <Image source={{ uri: newActIcon }} style={{ width: 80, height: 80, alignSelf: 'center', marginVertical: 10 }} />
            ) : null}

            <Button title="Add Activity" onPress={addActivity} />
            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ------------------- styles -------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', width: '100%' },

  addButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 12,
    borderRadius: 6,
  },
  addButtonText: { fontSize: 16, fontWeight: '600', color: '#333' },

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
    backgroundColor: 'rgb(195, 229, 236)',
    overflow: 'hidden',
  },

  circleImage: { width: 80, height: 80, resizeMode: 'contain' },

  selectedCircle: { backgroundColor: 'rgb(211,211,211)' },

  activityText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
  },

  modalBackground: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff', padding: 20, borderRadius: 8, width: '80%',
  },
  modalInput: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 8, height: 40, marginVertical: 10,
  },
});
