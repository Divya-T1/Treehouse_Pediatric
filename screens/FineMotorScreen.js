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
  Alert,
} from 'react-native';
import BottomNavBar from './NavigationOptions.js';
import * as ImagePicker from 'expo-image-picker';
import {
  SaveActivities,
  GetActivities,
  GetCustomCategories,
  AddCategory,
  AddActivityToCategory,
} from '../ActivitiesSaver.js';

export default function FineMotorScreen() {
  // static requires (for RN bundler)
  const logo = require('../Logo.png');
  const img1 = require('../assets/FineMotorPictures/coloring.png');
  const img2 = require('../assets/FineMotorPictures/cutting.png');
  const img3 = require('../assets/FineMotorPictures/dot_markers.png');
  const img4 = require('../assets/FineMotorPictures/drawing.png');
  const img5 = require('../assets/FineMotorPictures/craft.png');
  const img6 = require('../assets/FineMotorPictures/painting.png');
  const img7 = require('../assets/FineMotorPictures/tweezers.png');
  const img8 = require('../assets/FineMotorPictures/writing.png');

  // string IDs used for saving selection (keep same as you had)
  const act1 = '../assets/FineMotorPictures/coloring.png';
  const act2 = '../assets/FineMotorPictures/cutting.png';
  const act3 = '../assets/FineMotorPictures/dot_markers.png';
  const act4 = '../assets/FineMotorPictures/drawing.png';
  const act5 = '../assets/FineMotorPictures/craft.png';
  const act6 = '../assets/FineMotorPictures/painting.png';
  const act7 = '../assets/FineMotorPictures/tweezers.png';
  const act8 = '../assets/FineMotorPictures/writing.png';

  // exact storage key / category name you chose
  const categoryName = 'FineMotor';

  // selected activities in Schedule
  const [selectedActivities, setSelectedActivities] = useState([]);

  // custom activities for this category (stored via AsyncStorage custom categories)
  const [customActivities, setCustomActivities] = useState([]);

  // modal & inputs for adding activity
  const [modalVisible, setModalVisible] = useState(false);
  const [newActName, setNewActName] = useState('');
  const [newActIcon, setNewActIcon] = useState('');

  // load saved schedule selections and custom activities on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await GetActivities();
        setSelectedActivities((saved || []).map(s => s.filePath));

        const customs = await GetCustomCategories();
        const found = (customs || []).find(c => c.categoryName === categoryName);
        setCustomActivities(found ? found.activities : []);
      } catch (err) {
        console.log('load error', err);
      }
    })();
  }, []);

  // toggle activity selection to/from schedule
  async function toggleSelection(id) {
    try {
      const prev = await GetActivities();
      const prevFilePaths = (prev || []).map(item => item.filePath);
      const next = prevFilePaths.includes(id)
        ? prev.filter(item => item.filePath !== id)
        : [...(prev || []), { filePath: id, notes: '' }];
      await SaveActivities(next);
      setSelectedActivities(next.map(item => item.filePath));
    } catch (err) {
      console.log('toggleSelection error', err);
    }
  }

  // ----------------------------
  // Image picker + add activity
  // ----------------------------
  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission required', 'Photo library permission is required to pick an image.');
        return;
      }

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
      Alert.alert('Error', 'Could not pick image.');
    }
  };

  const addActivity = async () => {
    if (!newActName || !newActIcon) {
      Alert.alert('Please provide a name and pick an image.');
      return;
    }

    const activity = { name: newActName.trim(), icon: newActIcon, notes: '' };

    try {
      // Try to add activity to an existing custom category
      let updatedCustoms = await AddActivityToCategory(categoryName, activity);

      // If AddActivityToCategory didn't find an existing category (implementation returns full customs),
      // ensure category exists by creating it first then re-adding.
      const categoryExists =
        updatedCustoms && updatedCustoms.find && updatedCustoms.find(c => c.categoryName === categoryName);

      if (!categoryExists) {
        // create custom category with this icon as its icon
        await AddCategory(categoryName, newActIcon);
        updatedCustoms = await AddActivityToCategory(categoryName, activity);
      }

      const cat = (updatedCustoms || []).find(c => c.categoryName === categoryName);
      setCustomActivities(cat?.activities || []);

      // reset modal fields
      setModalVisible(false);
      setNewActName('');
      setNewActIcon('');
    } catch (err) {
      console.log('addActivity error', err);
      Alert.alert('Error', 'Could not save activity.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={logo} />

      {/* Add Activity button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Activity</Text>
      </TouchableOpacity>

      <ScrollView>
        <View style={styles.grid}>

          {/* HARD-CODED ACTIVITIES */}
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act1)}>
            <View style={[styles.circle1, selectedActivities.includes(act1) && styles.selectedCircle]}>
              <Image source={img1} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Coloring</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act2)}>
            <View style={[styles.circle2, selectedActivities.includes(act2) && styles.selectedCircle]}>
              <Image source={img2} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Cutting</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act3)}>
            <View style={[styles.circle3, selectedActivities.includes(act3) && styles.selectedCircle]}>
              <Image source={img3} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Dot Markers</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act4)}>
            <View style={[styles.circle4, selectedActivities.includes(act4) && styles.selectedCircle]}>
              <Image source={img4} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Drawing</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act5)}>
            <View style={[styles.circle5, selectedActivities.includes(act5) && styles.selectedCircle]}>
              <Image source={img5} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Craft</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act6)}>
            <View style={[styles.circle6, selectedActivities.includes(act6) && styles.selectedCircle]}>
              <Image source={img6} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Painting</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act7)}>
            <View style={[styles.circle6, selectedActivities.includes(act7) && styles.selectedCircle]}>
              <Image source={img7} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Tweezers</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act8)}>
            <View style={[styles.circle6, selectedActivities.includes(act8) && styles.selectedCircle]}>
              <Image source={img8} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Writing</Text>
          </TouchableOpacity>

          {/* CUSTOM ACTIVITIES FOR FineMotor */}
          {customActivities.map((act, i) => (
            <TouchableOpacity key={`custom-${i}`} activeOpacity={0.6} onPress={() => toggleSelection(act.icon)}>
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

      {/* ADD ACTIVITY MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={{ fontWeight: '600' }}>Activity Name:</Text>
            <TextInput
              style={styles.modalInput}
              value={newActName}
              onChangeText={setNewActName}
              placeholder="e.g. Bead Stringing"
            />

            <Text style={{ fontWeight: '600', marginTop: 10 }}>Activity Image:</Text>
            <Button title={newActIcon ? 'Change Image' : 'Pick Image'} onPress={pickImage} />

            {newActIcon ? (
              <Image source={{ uri: newActIcon }} style={{ width: 80, height: 80, marginVertical: 10, alignSelf: 'center' }} />
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
  addButtonText: { fontSize: 16, fontWeight: '600', color: '#333' },

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
    backgroundColor: 'rgb(218, 188, 188)',
  },
  circle2: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(218, 188, 188)' },
  circle3: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(218, 188, 188)' },
  circle4: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(218, 188, 188)' },
  circle5: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(218, 188, 188)' },
  circle6: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(218, 188, 188)' },

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
