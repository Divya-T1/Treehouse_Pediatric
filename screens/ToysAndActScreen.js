import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Alert
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

export default function ToysAndActScreen() {
  const categoryName = "Toys";

  // static image requires
  const logo = require('../Logo.png');
  const img1 = require('../assets/TOYS/Group 16.png');
  const img2 = require('../assets/TOYS/Group-1.png');
  const img3 = require('../assets/TOYS/Group-2.png');
  const img4 = require('../assets/TOYS/Group.png');
  const img5 = require('../assets/TOYS/Vector-1.png');
  const img6 = require('../assets/TOYS/Vector-2.png');
  const img7 = require('../assets/TOYS/Vector-3.png');
  const img8 = require('../assets/TOYS/Vector-4.png');
  const img9 = require('../assets/TOYS/Vector-5.png');
  const img10 = require('../assets/TOYS/Vector.png');

  // original IDs (used for selection)
  const actIds = [
    '../assets/TOYS/Group 16.png',
    '../assets/TOYS/Group-1.png',
    '../assets/TOYS/Group-2.png',
    '../assets/TOYS/Group.png',
    '../assets/TOYS/Vector-1.png',
    '../assets/TOYS/Vector-2.png',
    '../assets/TOYS/Vector-3.png',
    '../assets/TOYS/Vector-4.png',
    '../assets/TOYS/Vector-5.png',
    '../assets/TOYS/Vector.png'
  ];

  const images = [img1,img2,img3,img4,img5,img6,img7,img8,img9,img10];
  const names = [
    "Animals","Toy Cars","Work Table","Toy Food","Reading",
    "Watch Video","Puzzles","iPad Time","Instrument","Toy Train"
  ];

  const [selectedActivities, setSelectedActivities] = useState([]);
  const [customActivities, setCustomActivities] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newActName, setNewActName] = useState('');
  const [newActIcon, setNewActIcon] = useState('');

  // LOAD SAVED DATA
  useEffect(() => {
    (async () => {
      const saved = await GetActivities();
      const savedIds = saved.map(item => item.filePath);
      setSelectedActivities(savedIds || []);

      const categories = await GetCustomCategories();
      const found = categories?.find(c => c.categoryName === categoryName);
      setCustomActivities(found ? found.activities : []);
    })();
  }, []);

  // TOGGLE SELECTION
  async function toggleSelection(id) {
    const prev = await GetActivities();
    const prevIds = prev.map(item => item.filePath);

    const next = prevIds.includes(id)
      ? prev.filter(item => item.filePath !== id)
      : [...prev, { filePath: id, notes: '' }];

    await SaveActivities(next);
    setSelectedActivities(next.map(item => item.filePath));
  }

  // PICK IMAGE
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
      Alert.alert("Error selecting image.");
    }
  };

  // ADD CUSTOM ACTIVITY
  const addActivity = async () => {
    if (!newActName || !newActIcon) {
      Alert.alert("Please enter a name and choose an image.");
      return;
    }

    const activity = { name: newActName, icon: newActIcon, notes: '' };

    try {
      let categories = await GetCustomCategories();

      // Create category if missing
      if (!categories.find(c => c.categoryName === categoryName)) {
        await AddCategory(categoryName, newActIcon);
        categories = await GetCustomCategories();
      }

      // Add activity
      const updated = await AddActivityToCategory(categoryName, activity);
      const cat = updated.find(c => c.categoryName === categoryName);
      setCustomActivities(cat?.activities || []);

      // Reset fields
      setModalVisible(false);
      setNewActName('');
      setNewActIcon('');

    } catch (err) {
      Alert.alert("Error saving activity.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={logo} />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Activity</Text>
      </TouchableOpacity>

      <ScrollView>
        <View style={styles.grid}>

          {/* Built-in items */}
          {images.map((img, index) => (
            <TouchableOpacity key={index} activeOpacity={0.6} onPress={() => toggleSelection(actIds[index])}>
              <View style={[styles.circle, selectedActivities.includes(actIds[index]) && styles.selectedCircle]}>
                <Image source={img} style={styles.circleImage} />
              </View>
              <Text style={styles.activityText}>{names[index]}</Text>
            </TouchableOpacity>
          ))}

          {/* Custom items */}
          {customActivities.map((act, index) => (
            <TouchableOpacity key={index} activeOpacity={0.6} onPress={() => toggleSelection(act.icon)}>
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

      {/* Modal */}
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
            <Button title={newActIcon ? "Change Image" : "Pick Image"} onPress={pickImage} />

            {newActIcon && (
              <Image
                source={{ uri: newActIcon }}
                style={{ width: 80, height: 80, alignSelf: 'center', marginVertical: 10 }}
              />
            )}

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
  addButtonText: { fontSize: 16, fontWeight: '600', color: '#333' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    width: 300,
  },

  circle: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginVertical: 20,
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
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalInput: {
    borderWidth: 1, borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 40,
    marginVertical: 10,
  },
});
