import React, { useState, useEffect } from 'react';
import { 
  View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Modal, 
  TextInput, Button, ScrollView 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AddActivity, RemoveActivity, GetActivities, SaveCategories, GetCategories } from './ActivitiesSaver';
import BottomNavBar from './NavigationOptions';

export default function CategoryScreen({ route }) {
  const { categoryIndex } = route.params;

  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState({ name: '', activities: [] });
  const [selected, setSelected] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newActivityName, setNewActivityName] = useState('');
  const [newActivityImage, setNewActivityImage] = useState(null);

  useEffect(() => {
  const loadData = async () => {
    const savedCategories = await GetCategories();
    setCategories(savedCategories || []);
    const currentCategory = savedCategories?.[categoryIndex] || { name: '', activities: [] };
    setCategory(currentCategory);

    // Now scheduled is a list of activity objects
    const scheduled = await GetActivities();
    const selectedMap = {};
    scheduled.forEach(act => { selectedMap[act.key] = true; });
    setSelected(selectedMap);
  };
  loadData();
}, []);


  // Handle selecting/unselecting an activity
const handlePress = async (activity) => {
  const key = activity.key;
  if (!key) return;

  const newSelected = { ...selected };
  if (selected[key]) {
    delete newSelected[key];
    await RemoveActivity(key);
  } else {
    newSelected[key] = true;
    await AddActivity(activity); // NOTE: pass the full activity object!
  }
  setSelected(newSelected);
};

  // Pick image from device
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setNewActivityImage(result.assets[0].uri);
    }
  };

  // Add new activity
  const addNewActivity = async () => {
    if (!newActivityName.trim()) return;

    const key = `activity-${Date.now()}`; // unique key
    const newAct = {
      name: newActivityName.trim(),
      key,
      imageUri: newActivityImage || null, // null fallback
    };

    // Update category and categories state
    const updatedCategory = {
      ...category,
      activities: [...category.activities, newAct],
    };

    const updatedCategories = [...categories];
    updatedCategories[categoryIndex] = updatedCategory;

    // Save to AsyncStorage
    await SaveCategories(updatedCategories);

    // Update state so FlatList re-renders immediately
    setCategory(updatedCategory);
    setCategories(updatedCategories);
    setNewActivityName('');
    setNewActivityImage(null);
    setShowModal(false);
  };

  // Render each activity in FlatList
  const renderActivity = ({ item }) => {
    const isSelected = !!selected[item.key];
    const source = item.imageUri
      ? { uri: item.imageUri }          // picked image
      : require('../assets/default.png'); // default fallback

    return (
      <TouchableOpacity
        style={[styles.activityBox, isSelected && { backgroundColor: '#aaa' }]}
        onPress={() => handlePress(item)}
      >
        <Image source={source} style={styles.activityImage} />
        <Text style={styles.activityText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ flex: 1, padding: 10 }}>
        <Text style={styles.categoryTitle}>{category.name}</Text>

<TouchableOpacity
  style={[styles.mainAddButton]}
  onPress={() => setShowModal(true)}
>
  <Text style={styles.mainAddButtonText}>Add Activity</Text>
</TouchableOpacity>

        <FlatList
          data={category.activities}
          keyExtractor={(item) => item.key}
          numColumns={3}
          renderItem={renderActivity}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </View>

      <BottomNavBar />

      {/* Modal */}
      {/* Modal */}
<Modal visible={showModal} transparent animationType="slide">
  <ScrollView contentContainerStyle={styles.modalContainer}>
    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>New Activity</Text>

    <TextInput
      placeholder="Activity Name"
      value={newActivityName}
      onChangeText={setNewActivityName}
      style={styles.input}
    />

    <Button title="Pick Image from Device" onPress={pickImage} color="#6C7E6B" />

    {newActivityImage && (
      <Image
        source={{ uri: newActivityImage }}
        style={{ width: 80, height: 80, marginTop: 10, resizeMode: 'contain' }}
      />
    )}

    {/* Buttons side by side */}
    <View style={styles.buttonRow}>
      <TouchableOpacity style={[styles.modalBtn, { backgroundColor: 'green' }]} onPress={addNewActivity}>
        <Text style={styles.modalBtnText}>Add Activity</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#ccc' }]} onPress={() => setShowModal(false)}>
        <Text style={[styles.modalBtnText, { color: '#333' }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
</Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  mainAddButton: {
  backgroundColor: 'green',       // same green color
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 8,
  alignItems: 'center',
  marginBottom: 10,
},
mainAddButtonText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 16,
},

  buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  width: '80%',
  marginTop: 15,
},
modalBtn: {
  flex: 1,
  padding: 10,
  borderRadius: 8,
  alignItems: 'center',
  marginHorizontal: 5,
},
modalBtnText: {
  color: 'white',
  fontWeight: 'bold',
},

  categoryTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  activityBox: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgb(230,230,230)',
    padding: 5,
    borderRadius: 8,
  },
  activityImage: { width: 60, height: 60, resizeMode: 'contain' },
  activityText: { marginTop: 5, textAlign: 'center', fontSize: 14 },
  modalContainer: {
    margin: 30,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    top: 100,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    width: '80%',
    padding: 5,
    marginVertical: 10,
    borderRadius: 5,
  },
});
