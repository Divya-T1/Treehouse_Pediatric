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
  Platform,
} from 'react-native';
import BottomNavBar from './NavigationOptions.js';
import {
  useBottomNavScrollPadding,
  bottomNavScrollStyles,
} from './scrollWithBottomNav.js';
import { useNavigation } from '@react-navigation/native';

import {
  GetCustomCategories,
  SaveCustomCategories,
  GetActivities,
  SaveActivities,
  RemoveActivityFromCategory,
  RemoveCustomCategory,
  GetChoiceBoard,
  SaveChoiceBoard,
} from '../ActivitiesSaver.js';

import * as ImagePicker from 'expo-image-picker';

function getActivityIconUri(item) {
  if (!item) return null;
  if (typeof item.icon === 'string') return item.icon;
  if (item.icon?.uri) return item.icon.uri;
  return item.filePath || item.id || null;
}

function urisFromCategoryActivities(acts) {
  return (acts || [])
    .map((a) => getActivityIconUri(a))
    .filter(Boolean);
}

export default function CategoryScreen({ route }) {
  const scrollBottomPad = useBottomNavScrollPadding();
  const navigation = useNavigation();
  const categoryName =
    typeof route.params?.categoryName === 'string'
      ? route.params.categoryName.trim()
      : '';

  const [activities, setActivities] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newActName, setNewActName] = useState('');
  const [newActIcon, setNewActIcon] = useState('');
  const [selectedActivities, setSelectedActivities] = useState([]);

  // Load activities for this category
  useEffect(() => {
    if (!categoryName) {
      Alert.alert('Missing category', 'No category was specified.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      return;
    }
    (async () => {
      try {
        const custom = await GetCustomCategories();
        const cat = custom?.find(
          (c) => (c.categoryName || '').trim() === categoryName
        );
        
        if (!cat) {
        Alert.alert(
          "Category Not Found",
          "This category no longer exists.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack()
            }
          ]
        );
        return;
      }
        
        setActivities(cat?.activities ? [...cat.activities] : []);
      } catch (err) {
        console.log('load activities error', err);
        setActivities([]);
      }
    })();
  }, [categoryName, navigation]);

  // Load selected activities
  useEffect(() => {
    (async () => {
      try {
        const saved = await GetActivities();
        setSelectedActivities(
          (saved || []).map(item => getActivityIconUri(item)).filter(Boolean)
        );
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

  // Toggle activity selection
  async function toggleSelection(act) {
    const id = act.id;
    try {
      const prev = await GetActivities();
      const exists = prev.find(item => item.id === id);
      const next = exists
        ? prev.filter(item => item.id !== id)
        : [...prev, act];

      await SaveActivities(next);
      setSelectedActivities(next.map(item => getActivityIconUri(item)).filter(Boolean));
    } catch (err) {
      console.log('toggleSelection error', err);
    }
  }

  // Pick image
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
      console.log('Image picker error', err);
      Alert.alert('Error', 'Could not pick image.');
    }
  };

  // Add new activity
  const addActivity = async () => {
    if (!newActName || !newActIcon) {
      Alert.alert('Please provide both a name and an icon.');
      return;
    }

    const activity = { id: newActIcon, name: newActName.trim(), icon: newActIcon};

    try {
      // --- Load all custom categories ---
      let allCategories = await GetCustomCategories();
      if (!Array.isArray(allCategories)) allCategories = [];

      // --- Find this category ---
      let thisCat = allCategories.find(
        (c) => (c.categoryName || '').trim() === categoryName
      );

      //creates a new category!!! We don't want these!!! vvvvv

      // if (!thisCat) {
      //   thisCat = { categoryName, icon: newActIcon, activities: [] };
      //   allCategories.push(thisCat);
      // }

      if (!thisCat) {
        Alert.alert(
        "Category Not Found",
        "This category does not exist. Please create it before adding activities."
        );
      return; // prevent crash + prevent accidental creation
      }

      // --- Add activity ---
      thisCat.activities.push(activity);

      // --- ⭐ SAVE THE UPDATED LIST so it persists ---
      await SaveCustomCategories(allCategories);

      // Update UI
      setActivities([...thisCat.activities]);

      // Reset modal
      setModalVisible(false);
      setNewActName('');
      setNewActIcon('');
    } catch (err) {
      console.log('addActivity error', err);
      Alert.alert('Error', 'Could not add activity.');
    }
  };

  const scheduleItemMatchesUri = (item, uri) => {
    if (!item || !uri) return false;
    if (item.filePath === uri || item.id === uri) return true;
    return getActivityIconUri(item) === uri;
  };

  const choiceItemMatchesUri = (item, uri) => {
    if (!item || !uri) return false;
    if (item.filePath === uri || item.id === uri) return true;
    return getActivityIconUri(item) === uri;
  };

  const performDelete = async (act) => {
    const iconUri = typeof act.icon === 'string' ? act.icon : act.icon?.uri;
    if (!iconUri) return;

    try {
      const updatedCats = await RemoveActivityFromCategory(categoryName, iconUri);
      const cat = updatedCats.find(
        (c) => (c.categoryName || '').trim() === categoryName
      );
      setActivities(cat?.activities ? [...cat.activities] : []);

      const saved = await GetActivities();
      const nextSaved = saved.filter(s => !scheduleItemMatchesUri(s, iconUri));
      await SaveActivities(nextSaved);
      setSelectedActivities(nextSaved.map(item => getActivityIconUri(item)).filter(Boolean));

      const choice = await GetChoiceBoard();
      const nextChoice = (choice || []).filter(c => !choiceItemMatchesUri(c, iconUri));
      await SaveChoiceBoard(nextChoice);
    } catch (err) {
      console.log('delete activity error', err);
      Alert.alert('Error', 'Could not delete this activity.');
    }
  };

  const deleteActivity = (act) => {
    const run = () => performDelete(act);

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Delete this activity? It will be removed from your schedule and choice board if saved there.')) {
        run();
      }
      return;
    }

    Alert.alert(
      'Delete activity',
      'Remove this activity? It will also be removed from your schedule and choice board if saved there.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: run },
      ]
    );
  };

  const performDeleteCategory = async () => {
    if (!categoryName) {
      Alert.alert('Error', 'Cannot delete: missing category name.');
      return;
    }
    try {
      const custom = await GetCustomCategories();
      const cat = custom?.find(
        (c) => (c.categoryName || '').trim() === categoryName
      );
      const uriSet = new Set(urisFromCategoryActivities(cat?.activities));

      const removed = await RemoveCustomCategory(categoryName);
      if (!removed) {
        Alert.alert(
          'Could not delete',
          'This category was not found in storage. Try going back to Home and opening it again.'
        );
        return;
      }

      const saved = await GetActivities();
      const nextSaved = saved.filter((s) => {
        const u = getActivityIconUri(s);
        if (u && uriSet.has(u)) return false;
        if (s.filePath && uriSet.has(s.filePath)) return false;
        if (s.id && uriSet.has(s.id)) return false;
        return true;
      });
      await SaveActivities(nextSaved);

      const choice = await GetChoiceBoard();
      const nextChoice = (choice || []).filter((c) => {
        const u = getActivityIconUri(c);
        if (u && uriSet.has(u)) return false;
        if (c.filePath && uriSet.has(c.filePath)) return false;
        if (c.id && uriSet.has(c.id)) return false;
        return true;
      });
      await SaveChoiceBoard(nextChoice);

      navigation.goBack();
    } catch (err) {
      console.log('delete category error', err);
      Alert.alert('Error', 'Could not delete this category.');
    }
  };

  const deleteEntireCategory = () => {
    const run = () => performDeleteCategory();

    if (Platform.OS === 'web') {
      if (
        typeof window !== 'undefined' &&
        window.confirm(
          `Delete the category "${categoryName}" and all of its activities? This cannot be undone. Activities will be removed from your schedule and choice board if saved there.`
        )
      ) {
        run();
      }
      return;
    }

    Alert.alert(
      'Delete category',
      `Delete "${categoryName}" and all of its activities? This cannot be undone. Activities will be removed from your schedule and choice board if saved there.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete category', style: 'destructive', onPress: run },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Activity</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteCategoryBtn} onPress={deleteEntireCategory}>
        <Text style={styles.deleteCategoryBtnText}>Delete entire category</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={{ fontWeight: '600' }}>Activity Name:</Text>
            <TextInput style={styles.modalInput} value={newActName} onChangeText={setNewActName} />

            <Text style={{ fontWeight: '600', marginTop: 8 }}>Activity Icon:</Text>
            <Button title={newActIcon ? "Change Image" : "Pick Image"} onPress={pickImage} />

            {newActIcon && (
              <Image source={{ uri: newActIcon }} style={{ width: 80, height: 80, marginVertical: 10, alignSelf: 'center' }} />
            )}

            <Button title="Add" onPress={addActivity} />
            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Activities Grid */}
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
          {activities.map((act, i) => {
            const iconUri = typeof(act.icon) === "string" ? act.icon : act.icon.uri;
            return (
              <View key={`${iconUri}-${i}`} style={styles.activityRow}>
                <TouchableOpacity onPress={() => toggleSelection(act)}>
                  <View style={[styles.circleCustom, selectedActivities.includes(iconUri) && styles.selectedCircle]}>
                    <Image source={{ uri: iconUri }} style={styles.circleImage} />
                  </View>
                  <Text style={styles.activityText}>{act.name}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => deleteActivity(act)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
        </ScrollView>
      </View>

      <StatusBar style="auto" />
      <BottomNavBar />
    </SafeAreaView>
  );
}

// ------------------- Styles -------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', width: '100%' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    width: 300,
    maxWidth: '100%',
    paddingHorizontal: 8,
  },
  activityRow: { alignItems: 'center', marginBottom: 4 },
  deleteBtn: { marginTop: 4, paddingVertical: 4, paddingHorizontal: 10 },
  deleteBtnText: { color: '#c00', fontSize: 14, fontWeight: '600' },

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

  deleteCategoryBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  deleteCategoryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#b00020',
    textDecorationLine: 'underline',
  },

  divider: { height: 1, backgroundColor: '#333', width: '90%', alignSelf: 'center', marginVertical: 10 },

  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 8, width: '80%' },
  modalInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginVertical: 10, paddingHorizontal: 8, height: 40 },
});
