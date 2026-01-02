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

export default function Regulation() {

  // CATEGORY NAME for saving custom entries
  const categoryName = "Regulation";

  const logo = require('../Logo.png');

  const images = [
    require('../assets/Regulation/image 1.png'),
    require('../assets/Regulation/image 2.png'),
    require('../assets/Regulation/image 3.png'),
    require('../assets/Regulation/image 4.png'),
    require('../assets/Regulation/image 5.png'),
    require('../assets/Regulation/image 6.png'),
    require('../assets/Regulation/image 20.png'),
  ];

  const ids = [
    '../assets/Regulation/image 1.png',
    '../assets/Regulation/image 2.png',
    '../assets/Regulation/image 3.png',
    '../assets/Regulation/image 4.png',
    '../assets/Regulation/image 5.png',
    '../assets/Regulation/image 6.png',
    '../assets/Regulation/image 20.png',
  ];

  const names = [
    "Breathing",
    "Lights Off",
    "Quiet Space",
    "Hugging",
    "Relaxing",
    "Weighted Blanket",
    "Music"
  ];

  const [selectedActivities, setSelectedActivities] = useState([]);

  // NEW: Custom activities
  const [customActivities, setCustomActivities] = useState([]);

  // NEW: Add Activity modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [newActName, setNewActName] = useState('');
  const [newActIcon, setNewActIcon] = useState('');

  // Request permissions for image picker
  useEffect(() => {
    (async () => {
      try {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permission needed", "Please enable photo permissions to add custom activities.");
        }
      } catch (e) {
        console.log("Permission error", e);
      }
    })();
  }, []);

  // Load saved selections + custom activities
  useEffect(() => {
    (async () => {
      try {
        const saved = await GetActivities();
        const savedFilePaths = saved.map(item => item.filePath);
        setSelectedActivities(savedFilePaths || []);

        const categories = await GetCustomCategories();
        const found = (categories || []).find(c => c.categoryName === categoryName);
        setCustomActivities(found?.activities || []);
      } catch (e) {
        console.log("load error", e);
        setSelectedActivities([]);
        setCustomActivities([]);
      }
    })();
  }, []);

  // Toggle selection
  async function toggleSelection(id) {
    const prev = await GetActivities();
    const exists = prev.some(item => item.filePath === id);

    const next = exists
      ? prev.filter(item => item.filePath !== id)
      : [...prev, { filePath: id, notes: '' }];

    await SaveActivities(next);
    setSelectedActivities(next.map(item => item.filePath));
  }

  // Pick image for custom activity
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        aspect: [1, 1],
      });

      if (!result.canceled && result.assets?.length > 0) {
        setNewActIcon(result.assets[0].uri);
      }
    } catch (e) {
      console.log("pickImage error", e);
      Alert.alert("Error selecting image.");
    }
  };

  // Add custom activity
  const addActivity = async () => {
    if (!newActName || !newActIcon) {
      Alert.alert("Please enter a name and choose an image.");
      return;
    }

    const activity = { name: newActName.trim(), icon: newActIcon, notes: '' };

    try {
      let categories = await GetCustomCategories();
      if (!Array.isArray(categories)) categories = [];

      // Create category if missing
      if (!categories.find(c => c.categoryName === categoryName)) {
        await AddCategory(categoryName, newActIcon);
        categories = await GetCustomCategories();
      }

      // Add activity to category
      const updated = await AddActivityToCategory(categoryName, activity);
      const cat = updated.find(c => c.categoryName === categoryName);

      setCustomActivities(cat?.activities || []);

      // Reset modal
      setNewActName('');
      setNewActIcon('');
      setModalVisible(false);
    } catch (e) {
      console.log("addActivity error", e);
      Alert.alert("Error saving activity.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={logo} />

      {/* ADD BUTTON */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Activity</Text>
      </TouchableOpacity>

      <ScrollView>
        <View style={styles.grid}>

          {/* Built-in activities */}
          {images.map((img, i) => (
            <TouchableOpacity
              key={`built-${i}`}
              activeOpacity={0.6}
              onPress={() => toggleSelection(ids[i])}
            >
              <View style={[
                styles.circle1,
                selectedActivities.includes(ids[i]) && styles.selectedCircle
              ]}>
                <Image source={img} style={styles.circleImage} />
              </View>
              <Text style={styles.activityText}>{names[i]}</Text>
            </TouchableOpacity>
          ))}

          {/* Custom Activities */}
          {customActivities.map((act, i) => (
            <TouchableOpacity
              key={`custom-${i}`}
              activeOpacity={0.6}
              onPress={() => toggleSelection(act.icon)}
            >
              <View style={[
                styles.circle1,
                selectedActivities.includes(act.icon) && styles.selectedCircle
              ]}>
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

            <Text style={{ fontWeight: '600', marginTop: 10 }}>
              Activity Image:
            </Text>
            <Button
              title={newActIcon ? "Change Image" : "Pick Image"}
              onPress={pickImage}
            />

            {newActIcon ? (
              <Image
                source={{ uri: newActIcon }}
                style={{ width: 80, height: 80, alignSelf: 'center', marginVertical: 10 }}
              />
            ) : null}

            <Button title="Add Activity" onPress={addActivity} />
            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', width: '100%' },

  addButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 12,
    borderRadius: 6,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    width: 300,
  },

  circle1: {
    width: 100,
    height: 100,
    padding: 0,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    marginVertical: 5,
    backgroundColor: 'rgb(218, 188, 188)',
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
    paddingHorizontal: 8,
    height: 40,
    marginVertical: 10,
  },
});
