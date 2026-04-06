import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View, Image, SafeAreaView, TouchableOpacity, Modal, TextInput, Button, Alert, Platform } from 'react-native';
import BottomNavBar from './NavigationOptions.js';
import {
  useBottomNavScrollPadding,
  bottomNavScrollStyles,
} from './scrollWithBottomNav.js';
import {
  SaveActivities,
  GetActivities,
  GetCustomCategories,
  AddActivityToCategory,
  AddCategory,
  RemoveActivityFromCategory,
  GetChoiceBoard,
  SaveChoiceBoard,
} from '../ActivitiesSaver.js';
import * as ImagePicker from 'expo-image-picker';

export default function ADLScreen() {
  const scrollBottomPad = useBottomNavScrollPadding();

  // static images
  const logo = require('../Logo.png');
  const img1 = require('../assets/ADL/button.png');
  const img2 = require('../assets/ADL/pants.png');
  const img3 = require('../assets/ADL/running_shoes.png');
  const img4 = require('../assets/ADL/socks_.png');
  const img5 = require('../assets/ADL/t-shirt.png');
  const img6 = require('../assets/ADL/toothbrush.png');
  const img7 = require('../assets/ADL/zipper.png');

  // hardcoded IDs
  const act1 = '../assets/ADL/button.png';
  const act2 = '../assets/ADL/pants.png';
  const act3 = '../assets/ADL/running_shoes.png';
  const act4 = '../assets/ADL/socks_.png';
  const act5 = '../assets/ADL/t-shirt.png';
  const act6 = '../assets/ADL/toothbrush.png';
  const act7 = '../assets/ADL/zipper.png';

  const categoryName = "ADL";

  const [selectedActivities, setSelectedActivities] = useState([]);

  // NEW — custom activities stored for this category
  const [customActivities, setCustomActivities] = useState([]);

  // MODAL STATE
  const [modalVisible, setModalVisible] = useState(false);
  const [newActName, setNewActName] = useState('');
  const [newActIcon, setNewActIcon] = useState('');

  useEffect(() => {
    (async () => {
      // Load selected activities
      const saved = await GetActivities();
      const savedFilePaths = (saved || []).map(item => item.filePath);
      setSelectedActivities(savedFilePaths || []);

      // Load custom activities for this category from saved custom categories
      try {
        const categories = await GetCustomCategories();
        const found = (categories || []).find(c => c.categoryName === categoryName);
        setCustomActivities(found ? found.activities || [] : []);
      } catch (err) {
        console.log('load ADL custom activities error', err);
        setCustomActivities([]);
      }
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

  // ---------------------------
  //   ADD ACTIVITY FUNCTIONS
  // ---------------------------

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
      Alert.alert("Error picking image.");
    }
  };

  const addActivity = async () => {
    if (!newActName || !newActIcon) {
      Alert.alert("Please enter a name and choose an image.");
      return;
    }

    const activity = { name: newActName, icon: newActIcon, notes: '' };

    try {
      // Try adding directly
      let updated = await AddActivityToCategory(categoryName, activity);

      // If the category does not exist yet → create it
      if (!updated.find(c => c.categoryName === categoryName)) {
        await AddCategory(categoryName, newActIcon);
        updated = await AddActivityToCategory(categoryName, activity);
      }

      // Update UI list
      const cat = updated.find(c => c.categoryName === categoryName);
      setCustomActivities(cat?.activities || []);

      // reset modal inputs
      setModalVisible(false);
      setNewActName('');
      setNewActIcon('');

    } catch (err) {
      Alert.alert("Error saving activity.");
      console.log(err);
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

  // --------------------------------------------------------

  return (
    <SafeAreaView style={styles.container}>
      <Image source={logo} />

      {/* ADD BUTTON */}
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

          {/* ORIGINAL BUILT-IN ACTIVITIES */}
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act1)}>
            <View style={[styles.circle1, selectedActivities.includes(act1) && styles.selectedCircle]}>
              <Image source={img1} style={styles.circleImage} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act2)}>
            <View style={[styles.circle2, selectedActivities.includes(act2) && styles.selectedCircle]}>
              <Image source={img2} style={styles.circleImage} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act3)}>
            <View style={[styles.circle3, selectedActivities.includes(act3) && styles.selectedCircle]}>
              <Image source={img3} style={styles.circleImage} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act4)}>
            <View style={[styles.circle4, selectedActivities.includes(act4) && styles.selectedCircle]}>
              <Image source={img4} style={styles.circleImage} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act5)}>
            <View style={[styles.circle5, selectedActivities.includes(act5) && styles.selectedCircle]}>
              <Image source={img5} style={styles.circleImage} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act6)}>
            <View style={[styles.circle6, selectedActivities.includes(act6) && styles.selectedCircle]}>
              <Image source={img6} style={styles.circleImage} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act7)}>
            <View style={[styles.circle6, selectedActivities.includes(act7) && styles.selectedCircle]}>
              <Image source={img7} style={styles.circleImage} />
            </View>
          </TouchableOpacity>

          {/* CUSTOM ADDED ACTIVITIES */}
          {customActivities.map((act, index) => (
            <View key={`custom-${act.icon}-${index}`} style={styles.customActivityWrap}>
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

      {/* ADD ACTIVITY MODAL */}
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

// -------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'top',
    width: '100%',
  },

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
    backgroundColor: 'rgb(218, 188, 188)',
  },
  circle2: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(218, 188, 188)' },
  circle3: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(218, 188, 188)' },
  circle4: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(218, 188, 188)' },
  circle5: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(218, 188, 188)' },
  circle6: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(218, 188, 188)' },

  circleImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    //resizeMode: 'cover',
  },

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
