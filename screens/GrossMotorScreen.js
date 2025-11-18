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
  GetCategories,
  AddActivityToCategory,
  AddCategory
} from '../ActivitiesSaver.js';
import * as ImagePicker from 'expo-image-picker';

export default function GrossMotorScreen() {
  const categoryName = "Gross Motor";

  // static image requires
  const logo = require('../Logo.png');
  const img1 = require('../assets/Group_11.png');
  const img2 = require('../assets/Group_12.png');
  const img3 = require('../assets/image_6.png');
  const img4 = require('../assets/image_7.png');
  const img5 = require('../assets/image_9.png');
  const img6 = require('../assets/image_10.png');

  // keep original IDs
  const act1 = '../assets/Group_11.png';
  const act2 = '../assets/Group_12.png';
  const act3 = '../assets/image_6.png';
  const act4 = '../assets/image_7.png';
  const act5 = '../assets/image_9.png';
  const act6 = '../assets/image_10.png';

  const [selectedActivities, setSelectedActivities] = useState([]);
  const [customActivities, setCustomActivities] = useState([]);

  // modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [newActName, setNewActName] = useState('');
  const [newActIcon, setNewActIcon] = useState('');

  // load saved selected activities + custom activities
  useEffect(() => {
    (async () => {
      // Load selected activities
      const saved = await GetActivities();
      const savedFilePaths = saved.map(item => item.filePath);
      setSelectedActivities(savedFilePaths || []);

      // Load custom activities for this category
      const categories = await GetCategories();
      const found = categories?.find(c => c.categoryName === categoryName);
      setCustomActivities(found ? found.activities : []);
    })();
  }, []);

  async function toggleSelection(id) {
    const prev = await GetActivities();
    const prevFilePaths = prev.map(item => item.filePath);

    const next = prevFilePaths.includes(id)
      ? prev.filter(item => item.filePath !== id)
      : [...prev, { filePath: id, notes: '' }];

    await SaveActivities(next);
    setSelectedActivities(next.map(item => item.filePath));
  }

  // image picker
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

  const addActivity = async () => {
    if (!newActName || !newActIcon) {
      Alert.alert("Please enter a name and choose an image.");
      return;
    }

    const activity = { name: newActName, icon: newActIcon, notes: '' };

    try {
      let categories = await GetCategories();

      // Create category if not present
      if (!categories.find(c => c.categoryName === categoryName)) {
        await AddCategory(categoryName, newActIcon);
        categories = await GetCategories();
      }

      // Add activity
      const updated = await AddActivityToCategory(categoryName, activity);

      const cat = updated.find(c => c.categoryName === categoryName);
      setCustomActivities(cat?.activities || []);

      // reset modal
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

      {/* Add Activity Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Activity</Text>
      </TouchableOpacity>

      <ScrollView>
        <View style={styles.grid}>

          {/* Built-in activities */}
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act1)}>
            <View style={[styles.circle1, selectedActivities.includes(act1) && styles.selectedCircle]}>
              <Image source={img1} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Rock Climbing</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act2)}>
            <View style={[styles.circle2, selectedActivities.includes(act2) && styles.selectedCircle]}>
              <Image source={img2} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Sliding</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act3)}>
            <View style={[styles.circle3, selectedActivities.includes(act3) && styles.selectedCircle]}>
              <Image source={img3} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Yoga</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act4)}>
            <View style={[styles.circle4, selectedActivities.includes(act4) && styles.selectedCircle]}>
              <Image source={img4} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Balancing Beam</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act5)}>
            <View style={[styles.circle5, selectedActivities.includes(act5) && styles.selectedCircle]}>
              <Image source={img5} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Trampoline</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act6)}>
            <View style={[styles.circle6, selectedActivities.includes(act6) && styles.selectedCircle]}>
              <Image source={img6} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Obstacle Course</Text>
          </TouchableOpacity>

          {/* Custom Activities */}
          {customActivities.map((act, index) => (
            <TouchableOpacity key={index} activeOpacity={0.6} onPress={() => toggleSelection(act.icon)}>
              <View style={[styles.circle1, selectedActivities.includes(act.icon) && styles.selectedCircle]}>
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

// -------------------------- styles --------------------------

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
    width: 100, height: 100, padding: 20, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginVertical: 20,
    backgroundColor: 'rgb(195, 229, 236)',
  },
  circle2: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(195, 229, 236)' },
  circle3: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(195, 229, 236)' },
  circle4: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(195, 229, 236)' },
  circle5: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(195, 229, 236)' },
  circle6: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(195, 229, 236)' },

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
