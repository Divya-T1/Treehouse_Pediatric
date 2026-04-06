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
  Platform
} from 'react-native';
import BottomNavBar from './NavigationOptions.js';
import {
  useBottomNavScrollPadding,
  bottomNavScrollStyles,
} from './scrollWithBottomNav.js';
import {
  SaveActivities,
  GetActivities,
  GetCustomCategories,
  SaveCustomCategories,
  RemoveActivityFromCategory,
  GetChoiceBoard,
  SaveChoiceBoard,
} from '../ActivitiesSaver.js';
import * as ImagePicker from 'expo-image-picker';

export default function GrossMotorScreen() {
  const scrollBottomPad = useBottomNavScrollPadding();
  const categoryName = "Gross Motor";

  // static requires
  const logo = require('../Logo.png');
  const img1 = require('../assets/Group_11.png');
  const img2 = require('../assets/Group_12.png');
  const img3 = require('../assets/image_6.png');
  const img4 = require('../assets/image_7.png');
  const img5 = require('../assets/image_9.png');
  const img6 = require('../assets/image_10.png');

  // hardcoded filePath IDs
  const act1 = '../assets/Group_11.png';
  const act2 = '../assets/Group_12.png';
  const act3 = '../assets/image_6.png';
  const act4 = '../assets/image_7.png';
  const act5 = '../assets/image_9.png';
  const act6 = '../assets/image_10.png';

  const [selectedActivities, setSelectedActivities] = useState([]);
  const [customActivities, setCustomActivities] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newActName, setNewActName] = useState('');
  const [newActIcon, setNewActIcon] = useState('');

  // -------------------------
  // LOAD SAVED DATA
  // -------------------------
  useEffect(() => {
    (async () => {

      // Load selected activities
      const saved = await GetActivities();
      const savedFiles = saved.map(a => a.filePath);
      setSelectedActivities(savedFiles || []);

      // Load custom activities for this category
      const categories = await GetCustomCategories();
      const found = categories?.find(c => c.categoryName === categoryName);
      setCustomActivities(found ? found.activities : []);
    })();
  }, []);

  // -------------------------
  // SELECTION TOGGLER
  // -------------------------
  async function toggleSelection(id) {
    const prev = await GetActivities();
    const prevIds = prev.map(a => a.filePath);

    const next = prevIds.includes(id)
      ? prev.filter(a => a.filePath !== id)
      : [...prev, { filePath: id, notes: '' }];

    await SaveActivities(next);
    setSelectedActivities(next.map(a => a.filePath));
  }

  // -------------------------
  // PICK IMAGE FOR CUSTOM ACTIVITY
  // -------------------------
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
    } catch (e) {
      Alert.alert("Error selecting image.");
    }
  };

  // -------------------------
  // ADD CUSTOM ACTIVITY
  // -------------------------
//   const addActivity = async () => {
//     if (!newActName || !newActIcon) {
//       Alert.alert("Please enter a name and choose an image.");
//       return;
//     }

//     const activity = { name: newActName, icon: newActIcon, notes: '' };

//     try {
//       let categories = await GetCustomCategories();

//       // If category does not exist → create it first
//       // if (!categories.find(c => c.categoryName === categoryName)) {
//       //   await AddCategory(categoryName, newActIcon);
//       //   categories = await GetCustomCategories();
//       // }

//       // Ensure the built-in categories never auto-create in storage
// let thisCat = categories.find(c => c.categoryName === categoryName);

// if (!thisCat) {
//   // Built-in categories should keep custom activities separate.
//   // Do NOT create a new custom category for them.
//   thisCat = { categoryName, icon: '', activities: [] };
//   categories.push(thisCat);
// }


//       // Add the activity to the category
//       // const updated = await AddActivityToCategory(categoryName, activity);


//       // Update UI
//       // const cat = updated.find(c => c.categoryName === categoryName);
//       // setCustomActivities(cat?.activities || []);

//       // Add the activity to this category
// thisCat.activities.push(activity);
// await SaveCustomCategories(categories);

// // Update UI directly
// setCustomActivities([...thisCat.activities]);


//       // Reset modal
//       setNewActName('');
//       setNewActIcon('');
//       setModalVisible(false);

//     } catch (err) {
//       Alert.alert("Error saving activity.");
//     }
//   };


const addActivity = async () => {
  if (!newActName || !newActIcon) {
    Alert.alert("Please enter a name and choose an image.");
    return;
  }

  const activity = { name: newActName, icon: newActIcon, notes: '' };

  try {
    // Load stored categories
    let categories = await GetCustomCategories();
    if (!Array.isArray(categories)) categories = [];

    // Try to find this built-in category WITHOUT creating a new global category
    let thisCat = categories.find(c => c.categoryName === categoryName);

    if (!thisCat) {
      // DO NOT PUSH A NEW CATEGORY
      // Just create a temporary one for local use
      thisCat = { categoryName, icon: '', activities: [] };
    }

    // Add the activity locally
    thisCat.activities.push(activity);

    // Save ONLY the sub-activities of this built-in screen
    // WITHOUT adding this category to the user category list
    const updated = categories.map(c =>
      c.categoryName === categoryName ? thisCat : c
    );

    // If category was never stored before, store only its content
    if (!categories.find(c => c.categoryName === categoryName)) {
      updated.push({
        categoryName,
        icon: '',        // no icon = hidden from user category list
        activities: thisCat.activities
      });
    }

    await SaveCustomCategories(updated);

    // Update UI
    setCustomActivities([...thisCat.activities]);

    // Reset modal
    setNewActName('');
    setNewActIcon('');
    setModalVisible(false);

  } catch (err) {
    Alert.alert("Error saving activity.");
  }
};

  const activityUriMatches = (item, uri) => {
    if (!item || !uri) return false;
    if (item.filePath === uri || item.id === uri) return true;
    const icon = typeof item.icon === 'string' ? item.icon : item.icon?.uri;
    return icon === uri;
  };

  const performDeleteCustom = async (act) => {
    const uri = typeof act.icon === 'string' ? act.icon : act.icon?.uri;
    if (!uri) return;
    try {
      const updatedCats = await RemoveActivityFromCategory(categoryName, uri);
      const cat = updatedCats.find(c => c.categoryName === categoryName);
      setCustomActivities(cat?.activities || []);

      const saved = await GetActivities();
      const nextSaved = saved.filter(s => !activityUriMatches(s, uri));
      await SaveActivities(nextSaved);
      setSelectedActivities(nextSaved.map(item => item.filePath));

      const choice = await GetChoiceBoard();
      const nextChoice = (choice || []).filter(c => !activityUriMatches(c, uri));
      await SaveChoiceBoard(nextChoice);
    } catch (err) {
      Alert.alert('Error', 'Could not delete this activity.');
    }
  };

  const deleteCustomActivity = (act) => {
    const run = () => performDeleteCustom(act);
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Delete this activity? It will be removed from your schedule and choice board if saved there.')) {
        run();
      }
      return;
    }
    Alert.alert(
      'Delete activity',
      'Remove this custom activity? It will also be removed from your schedule and choice board if saved there.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: run },
      ]
    );
  };




  // -------------------------
  // UI
  // -------------------------
  return (
    <SafeAreaView style={styles.container}>
      <Image source={logo} />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Activity</Text>
      </TouchableOpacity>

      <View style={bottomNavScrollStyles.wrap}>
        <ScrollView
          style={bottomNavScrollStyles.scroll}
          contentContainerStyle={[
            bottomNavScrollStyles.content,
            { paddingBottom: scrollBottomPad },
          ]}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
        >
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

          {/* Custom activities */}
          {customActivities.map((act, i) => (
            <View key={`custom-${act.icon}-${i}`} style={styles.customActivityWrap}>
              <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act.icon)}>
                <View style={[styles.circle1, selectedActivities.includes(act.icon) && styles.selectedCircle]}>
                  <Image source={{ uri: act.icon }} style={styles.circleImage} />
                </View>
                <Text style={styles.activityText}>{act.name}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteCustomActivity(act)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}

        </View>
        </ScrollView>
      </View>

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
    maxWidth: '100%',
    paddingHorizontal: 8,
  },

  circle1: {
    width: 100, height: 100, padding: 20, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginVertical: 20,
    backgroundColor: 'rgb(195,229,236)',
  },
  circle2: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(195,229,236)' },
  circle3: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(195,229,236)' },
  circle4: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(195,229,236)' },
  circle5: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(195,229,236)' },
  circle6: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(195,229,236)' },

  circleImage: { width: 80, height: 80, resizeMode: 'contain' },

  selectedCircle: { backgroundColor: 'rgb(211,211,211)' },

  activityText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
  },

  customActivityWrap: { alignItems: 'center', marginBottom: 4 },
  deleteBtn: { marginTop: 4, paddingVertical: 4, paddingHorizontal: 10 },
  deleteBtnText: { color: '#c00', fontSize: 14, fontWeight: '600' },

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
