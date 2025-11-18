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
  StatusBar,
  Alert,
} from 'react-native';
import BottomNavBar from './NavigationOptions.js';
import {
  GetCategories,
  GetCustomCategories,
  AddCategory,
  AddActivityToCategory,
  GetActivities,
  SaveActivities,
} from '../ActivitiesSaver.js';
import * as ImagePicker from 'expo-image-picker';

export default function CustomCategoryScreen({ route }) {
  const { categoryName } = route.params;

  const [activities, setActivities] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newActName, setNewActName] = useState('');
  const [newActIcon, setNewActIcon] = useState('');
  const [selectedActivities, setSelectedActivities] = useState([]);

  // Load category activities (prefer custom categories, fallback to originals)
  useEffect(() => {
    (async () => {
      try {
        // first check custom categories (where writes happen)
        const custom = await GetCustomCategories();
        let cat = custom.find(c => c.categoryName === categoryName);

        // if not custom, fall back to combined categories (originals + customs)
        if (!cat) {
          const all = await GetCategories();
          cat = all.find(c => c.categoryName === categoryName);
        }

        setActivities(cat?.activities ? [...cat.activities] : []);
      } catch (err) {
        console.log('load activities error', err);
        setActivities([]);
      }
    })();
  }, [categoryName]);

  // Load selected activities (for notes toggle)
  useEffect(() => {
    (async () => {
      try {
        const saved = await GetActivities();
        setSelectedActivities(saved.map(item => item.filePath) || []);
      } catch (err) {
        console.log('load selected activities error', err);
        setSelectedActivities([]);
      }
    })();
  }, []);

  // Request permission for image picker
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

  // Toggle selection (save to schedule)
  async function toggleSelection(iconPath) {
    try {
      const prev = await GetActivities();
      const exists = prev.find(item => item.filePath === iconPath);
      const next = exists ? prev.filter(item => item.filePath !== iconPath) : [...prev, { filePath: iconPath, notes: '' }];
      await SaveActivities(next);
      setSelectedActivities(next.map(item => item.filePath));
    } catch (err) {
      console.log('toggleSelection error', err);
    }
  }

  // Pick image (works with modern Expo return format)
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      // new expo returns result.assets[0].uri
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setNewActIcon(result.assets[0].uri);
      } else if (!result.canceled && result.uri) {
        // older format compatibility
        setNewActIcon(result.uri);
      }
    } catch (err) {
      console.log('Image picker error', err);
      Alert.alert('Error', 'Could not pick image.');
    }
  };

  // Add new activity
  const addActivity = async () => {
    if (!newActName || !newActIcon) {
      Alert.alert('Please provide both a name and an icon for the activity.');
      return;
    }

    const activity = { name: newActName.trim(), icon: newActIcon, notes: '' };

    try {
      // Try to add to custom categories (AddActivityToCategory operates on custom categories)
      // AddActivityToCategory returns updated custom categories (per your existing implementation)
      let updatedCustoms = await AddActivityToCategory(categoryName, activity);

      // If AddActivityToCategory didn't find the category (i.e. categoryName is an original),
      // then updatedCustoms will not include the category; create a new custom category and then add.
      let cat = updatedCustoms && updatedCustoms.find(c => c.categoryName === categoryName);

      if (!cat) {
        // create a custom category with this name (use the newActIcon as its icon)
        await AddCategory(categoryName, newActIcon);
        // now add activity to that newly created custom category
        updatedCustoms = await AddActivityToCategory(categoryName, activity);
        cat = updatedCustoms.find(c => c.categoryName === categoryName);
      }

      // Update local state with a cloned array so React re-renders
      setActivities(cat?.activities ? [...cat.activities] : []);

      // Reset & close modal
      setModalVisible(false);
      setNewActName('');
      setNewActIcon('');
    } catch (err) {
      console.log('addActivity error', err);
      Alert.alert('Error', 'Could not add activity. See console for details.');
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

            <Text style={{ fontWeight: '600', marginTop: 8 }}>Activity Icon:</Text>
            <Button title={newActIcon ? "Change Image" : "Pick Image"} onPress={pickImage} />
            {newActIcon ? (
              <Image source={{ uri: newActIcon }} style={{ width: 80, height: 80, marginVertical: 10, alignSelf: 'center' }} />
            ) : null}

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
                {/* activity.icon may be a local uri or remote uri */}
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

// Styles (kept as before)
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
