import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, SafeAreaView, View, Text, Image, TouchableOpacity, Modal, TextInput, Button, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';

import GrossMotorScreen from './screens/GrossMotorScreen';
import ToyAndActScreen from './screens/ToysAndActScreen';
import ToyScreen from './screens/ToyScreen';
import FineMotorScreen from './screens/FineMotorScreen';
import RoomSpacesScreen from './screens/RoomSpacesScreen';
import Regulation from './screens/Regulation';
import SensoryScreen from './screens/SensoryScreen';
import ADLScreen from './screens/ADLscreen.js';
import BottomNavBar from './screens/NavigationOptions.js';
import Schedule from './screens/Schedule.js';
import NotesModal from './screens/NotesModal.js';
import CustomCategoryScreen from './screens/CustomCategoryScreen';
import { AddCategory, GetCategories } from './ActivitiesSaver.js';
import useAppState from './useAppState.js';

const Stack = createNativeStackNavigator();

function Homescreen({ navigation }) {
  const currentAppState = useAppState();

  const [modalVisible, setModalVisible] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatImage, setNewCatImage] = useState(null);
  const [customCategories, setCustomCategories] = useState([]);

  // Load custom categories
  useEffect(() => {
    (async () => {
      const cats = await GetCategories();
      setCustomCategories(cats);
    })();
  }, []);

  // Pick category icon
  const pickCategoryImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setNewCatImage(result.assets[0].uri);
      }
    } catch (e) {
      console.log("Image picker error:", e);
    }
  };

  // Add new category
  const addCategory = async () => {
    if (!newCatName || !newCatImage) return;

    const updated = await AddCategory(newCatName, newCatImage);
    setCustomCategories(updated);

    setModalVisible(false);
    setNewCatName('');
    setNewCatImage(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('./Logo.png')} />

      {/* Add Category Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Category</Text>
      </TouchableOpacity>
      <View style={styles.divider} />

      {/* Add Category Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={{ fontWeight: '600' }}>Category Name:</Text>
            <TextInput
              style={styles.modalInput}
              value={newCatName}
              onChangeText={setNewCatName}
            />

            <Text style={{ fontWeight: '600', marginTop: 10 }}>Category Icon:</Text>

            <TouchableOpacity style={styles.imageButton} onPress={pickCategoryImage}>
              <Text style={{ color: 'white', fontWeight: '600', textAlign: 'center' }}>
                PICK IMAGE
              </Text>
            </TouchableOpacity>

            <View style={{ alignItems: 'center', marginVertical: 10 }}>
              <Image
                source={
                  newCatImage
                    ? { uri: newCatImage }
                    : require('./assets/ADL/button.png') 
                }
                style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee' }}
              />
            </View>

            <Button title="Add" onPress={addCategory} />
            <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <ScrollView>
        <View style={styles.grid}>
          {/* ORIGINAL CATEGORIES */}
          <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.navigate('Gross Motor')}>
            <View style={styles.circle}><Image source={require('./Running.png')} /></View>
            <Text style={styles.activityText}>Gross Motor</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.navigate('Toys And Activities')}>
            <View style={styles.circle}><Image source={require('./TeddyBear.png')} /></View>
            <Text style={styles.activityText}>Fun Activities</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.navigate('Fine Motor')}>
            <View style={styles.circle}><Image source={require('./Arts.png')} /></View>
            <Text style={styles.activityText}>Fine Motor</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.navigate('Room Spaces')}>
            <View style={styles.circle}><Image source={require('./Door.png')} /></View>
            <Text style={styles.activityText}>Room Spaces</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.navigate('SensoryScreen')}>
            <View style={styles.circle}><Image source={require('./PlayDoh.png')} /></View>
            <Text style={styles.activityText}>Sensory Screen</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.navigate('ADLScreen')}>
            <View style={styles.circle}><Image source={require('./Brushing.png')} /></View>
            <Text style={styles.activityText}>ADL</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.navigate('Regulation')}>
            <View style={styles.circle}><Image source={require('./Headphones.png')} /></View>
            <Text style={styles.activityText}>Regulation</Text>
          </TouchableOpacity>

          {/* FIXED TOYS/GAMES ICON SIZE */}
          <TouchableOpacity activeOpacity={0.6} onPress={() => navigation.navigate('ToyScreen')}>
            <View style={styles.circle}>
              <Image
                source={require('./assets/toy.png')}
                style={{ width: 70, height: 70, resizeMode: 'contain' }}
              />
            </View>
            <Text style={styles.activityText}>Toys/Games</Text>
          </TouchableOpacity>

          {/* CUSTOM CATEGORIES */}
          {customCategories.map((cat, i) => (
            <TouchableOpacity
              key={i}
              activeOpacity={0.6}
              onPress={() => navigation.navigate('CustomCategory', { categoryName: cat.categoryName })}
            >
              <View style={styles.circle}>
                <Image source={{ uri: cat.icon }} style={{ width: 80, height: 80, borderRadius: 40 }} />
              </View>
              <Text style={styles.activityText}>{cat.categoryName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <StatusBar style="auto" />
      <BottomNavBar />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Group>
          <Stack.Screen name="Home" component={Homescreen} />
          <Stack.Screen name="Gross Motor" component={GrossMotorScreen} />
          <Stack.Screen name="Toys And Activities" component={ToyAndActScreen} />
          <Stack.Screen name="Fine Motor" component={FineMotorScreen} />
          <Stack.Screen name="Room Spaces" component={RoomSpacesScreen} />
          <Stack.Screen name="Regulation" component={Regulation} />
          <Stack.Screen name="SensoryScreen" component={SensoryScreen} />
          <Stack.Screen name="ADLScreen" component={ADLScreen} />
          <Stack.Screen name="ToyScreen" component={ToyScreen} />
          <Stack.Screen name="Schedule" component={Schedule} />
          <Stack.Screen name="CustomCategory" component={CustomCategoryScreen} />
        </Stack.Group>
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name="Notes" component={NotesModal} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', width: '100%' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', width: 300 },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: 'rgb(211,211,211)',
  },
  imageButton: {
    backgroundColor: '#333',
    padding: 8,
    borderRadius: 6,
    marginTop: 6
  },
  activityText: { fontSize: 16, textAlign: 'center', fontWeight: '600', color: '#333' },
  addButton: { backgroundColor: '#ccc', paddingVertical: 10, paddingHorizontal: 20, marginTop: 10, borderRadius: 6, alignSelf: 'center' },
  addButtonText: { fontSize: 16, fontWeight: '600', color: '#333' },
  divider: { height: 1, backgroundColor: '#333', width: '90%', alignSelf: 'center', marginVertical: 10 },
  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 8, width: '80%' },
  modalInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, marginVertical: 10, paddingHorizontal: 8, height: 40 },
});
