// CustomCategoryScreen.js
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  StyleSheet,
  StatusBar
} from 'react-native';
import BottomNavBar from './NavigationOptions.js';
import { GetCustomCategories, AddActivityToCategory, SaveActivities, GetActivities } from '../ActivitiesSaver.js';
import * as ImagePicker from 'expo-image-picker';

export default function CustomCategoryScreen({ route }) {
  const { categoryName } = route.params;

  const [activities, setActivities] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newActName, setNewActName] = useState('');
  const [newActIcon, setNewActIcon] = useState('');
  const [selectedActivities, setSelectedActivities] = useState([]);

  // Load category activities
  useEffect(() => {
    (async () => {
      const cats = await GetCustomCategories();
      const cat = cats.find(c => c.categoryName === categoryName);
      setActivities(cat?.activities || []);
    })();
  }, []);

  // Load selected activities (for notes toggle)
  useEffect(() => {
    (async () => {
      const saved = await GetActivities();
      const savedFilePaths = saved.map(item => item.filePath);
      setSelectedActivities(savedFilePaths || []);
    })();
  }, []);

  // Request permission for image picker
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need photo library permissions to pick activity icons!');
      }
    })();
  }, []);

  // Toggle selection like old categories
  async function toggleSelection(iconPath) {
    const prev = await GetActivities();
    const prevFilePaths = prev.map(item => item.filePath);
    const next = prevFilePaths.includes(iconPath)
      ? prev.filter(item => item.filePath !== iconPath)
      : [...prev, { filePath: iconPath, notes: '' }];
    await SaveActivities(next);
    setSelectedActivities(next.map(item => item.filePath));
  }

  // Add new activity to category
  const addActivity = async () => {
    if (!newActName || !newActIcon) return;
    const activity = { name: newActName, icon: newActIcon, notes: '' };
    const updated = await AddActivityToCategory(categoryName, activity);
    const cat = updated.find(c => c.categoryName === categoryName);
    setActivities(cat.activities);
    setModalVisible(false);
    setNewActName('');
    setNewActIcon('');
  };

  // Pick image from device
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.canceled) {
        setNewActIcon(result.assets[0].uri); // save local URI
      }
    } catch (error) {
      console.log('Image picker error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Add Activity Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Activity</Text>
      </TouchableOpacity>
      <View style={styles.divider} />

      {/* Add Activity Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={{ fontWeight: '600' }}>Activity Name:</Text>
            <TextInput style={styles.modalInput} value={newActName} onChangeText={setNewActName} />

            <Text style={{ fontWeight: '600' }}>Activity Icon:</Text>
            <Button
              title={newActIcon ? "Change Image" : "Pick Image"}
              onPress={pickImage}
            />
            {newActIcon && (
              <Image
                source={{ uri: newActIcon }}
                style={{ width: 80, height: 80, marginVertical: 10, alignSelf: 'center' }}
              />
            )}

            <Button title="Add" onPress={addActivity} />
            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Activity Grid */}
      <ScrollView>
        <View style={styles.grid}>
          {activities.map((act, i) => (
            <TouchableOpacity key={i} activeOpacity={0.6} onPress={() => toggleSelection(act.icon)}>
              <View style={[styles.circleCustom, selectedActivities.includes(act.icon) && styles.selectedCircle]}>
                <Image source={{ uri: act.icon }} style={styles.circleImage} />
              </View>
              <Text style={styles.activityText}>{act.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <StatusBar style="auto" />
      <BottomNavBar />
    </SafeAreaView>
  );
}

// Styles remain unchanged
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', width: '100%' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', width: 300 },

  circleCustom: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: 'rgb(211,211,211)',
  },

  circleImage: { width: 80, height: 80, resizeMode: 'contain' },
  selectedCircle: { backgroundColor: 'rgb(195, 229, 236)' },

  activityText: { fontSize: 16, textAlign: 'center', fontWeight: '600', color: '#333' },

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
