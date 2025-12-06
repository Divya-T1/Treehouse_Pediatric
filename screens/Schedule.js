// screens/Schedule.js
import React, { useEffect, useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import BottomNavBar from './NavigationOptions.js';
import { GetActivities, SaveActivities } from '../ActivitiesSaver.js';
import { useNavigation } from '@react-navigation/native';
import {createPDF} from '../PDFSaver.js';

// Icon registry: map the saved string IDs -> static require(...)
const ICONS = {
  // ADL
  '../assets/ADL/button.png': require('../assets/ADL/button.png'),
  '../assets/ADL/pants.png': require('../assets/ADL/pants.png'),
  '../assets/ADL/running_shoes.png': require('../assets/ADL/running_shoes.png'),
  '../assets/ADL/socks_.png': require('../assets/ADL/socks_.png'),
  '../assets/ADL/t-shirt.png': require('../assets/ADL/t-shirt.png'),
  '../assets/ADL/toothbrush.png': require('../assets/ADL/toothbrush.png'),
  '../assets/ADL/zipper.png': require('../assets/ADL/zipper.png'),

  // Fine Motor
  '../assets/FineMotorPictures/coloring.png': require('../assets/FineMotorPictures/coloring.png'),
  '../assets/FineMotorPictures/cutting.png': require('../assets/FineMotorPictures/cutting.png'),
  '../assets/FineMotorPictures/dot_markers.png': require('../assets/FineMotorPictures/dot_markers.png'),
  '../assets/FineMotorPictures/drawing.png': require('../assets/FineMotorPictures/drawing.png'),
  '../assets/FineMotorPictures/craft.png': require('../assets/FineMotorPictures/craft.png'),
  '../assets/FineMotorPictures/painting.png': require('../assets/FineMotorPictures/painting.png'),
  '../assets/FineMotorPictures/tweezers.png': require('../assets/FineMotorPictures/tweezers.png'),
  '../assets/FineMotorPictures/writing.png': require('../assets/FineMotorPictures/writing.png'),

  // Gross Motor
  '../assets/Group_11.png': require('../assets/Group_11.png'),
  '../assets/Group_12.png': require('../assets/Group_12.png'),
  '../assets/image_6.png': require('../assets/image_6.png'),
  '../assets/image_7.png': require('../assets/image_7.png'),
  '../assets/image_9.png': require('../assets/image_9.png'),
  '../assets/image_10.png': require('../assets/image_10.png'),

  // Regulation (note the spaces in filenames)
  '../assets/Regulation/image 1.png': require('../assets/Regulation/image 1.png'),
  '../assets/Regulation/image 2.png': require('../assets/Regulation/image 2.png'),
  '../assets/Regulation/image 3.png': require('../assets/Regulation/image 3.png'),
  '../assets/Regulation/image 4.png': require('../assets/Regulation/image 4.png'),
  '../assets/Regulation/image 5.png': require('../assets/Regulation/image 5.png'),
  '../assets/Regulation/image 6.png': require('../assets/Regulation/image 6.png'),
  '../assets/Regulation/image 20.png': require('../assets/Regulation/image 20.png'),

  // Room Spaces
  '../assets/RoomSpacesPictures/horse.png': require('../assets/RoomSpacesPictures/horse.png'),
  '../assets/RoomSpacesPictures/house.png': require('../assets/RoomSpacesPictures/house.png'),
  '../assets/RoomSpacesPictures/mask.png': require('../assets/RoomSpacesPictures/mask.png'),
  '../assets/RoomSpacesPictures/puzzle.png': require('../assets/RoomSpacesPictures/puzzle.png'),
  '../assets/RoomSpacesPictures/sitting.png': require('../assets/RoomSpacesPictures/sitting.png'),
  '../assets/RoomSpacesPictures/talking.png': require('../assets/RoomSpacesPictures/talking.png'),
  '../assets/RoomSpacesPictures/toilet.png': require('../assets/RoomSpacesPictures/toilet.png'),
  '../assets/RoomSpacesPictures/treehouse.png': require('../assets/RoomSpacesPictures/treehouse.png'),
  '../assets/RoomSpacesPictures/utensils.png': require('../assets/RoomSpacesPictures/utensils.png'),
  '../assets/RoomSpacesPictures/weight.png': require('../assets/RoomSpacesPictures/weight.png'),

  // Sensory
  '../assets/Sensory/imageS.png': require('../assets/Sensory/imageS.png'),
  '../assets/Sensory/peanutball.png': require('../assets/Sensory/peanutball.png'),
  '../assets/Sensory/PlayDoh.png': require('../assets/Sensory/PlayDoh.png'),
  '../assets/Sensory/putty.png': require('../assets/Sensory/putty.png'),
  '../assets/Sensory/sandpit.png': require('../assets/Sensory/sandpit.png'),
  '../assets/Sensory/swing.png': require('../assets/Sensory/swing.png'),

  // Toys & Activities (TOYS)
  '../assets/TOYS/Group 16.png': require('../assets/TOYS/Group 16.png'),
  '../assets/TOYS/Group-1.png': require('../assets/TOYS/Group-1.png'),
  '../assets/TOYS/Group-2.png': require('../assets/TOYS/Group-2.png'),
  '../assets/TOYS/Group.png': require('../assets/TOYS/Group.png'),
  '../assets/TOYS/Vector-1.png': require('../assets/TOYS/Vector-1.png'),
  '../assets/TOYS/Vector-2.png': require('../assets/TOYS/Vector-2.png'),
  '../assets/TOYS/Vector-3.png': require('../assets/TOYS/Vector-3.png'),
  '../assets/TOYS/Vector-4.png': require('../assets/TOYS/Vector-4.png'),
  '../assets/TOYS/Vector-5.png': require('../assets/TOYS/Vector-5.png'),
  '../assets/TOYS/Vector.png': require('../assets/TOYS/Vector.png'),

  // ToyScreen extras
  '../ToyFood.png': require('../ToyFood.png'),
  '../assets/CarToy.png': require('../assets/CarToy.png'),
  '../assets/Train.png': require('../assets/Train.png'),
  '../assets/AnimalToy.png': require('../assets/AnimalToy.png'),
  '../assets/BookToy.png': require('../assets/BookToy.png'),
  '../assets/VideoToy.png': require('../assets/VideoToy.png'),
};


function combineListsAndSave(filePaths, notes){
  console.log(filePaths);
  console.log(notes);
  const newActivities = filePaths.map((path, index) => ({
    
    filePath: path,
    notes: notes[index] || '' // fallback to blank if no note
  }));
  SaveActivities(newActivities);
}


export default function Schedule() {
  const [activities, setActivities] = useState([]);
  const [filePaths, setFilePaths] = useState([]);
  const [notes, setNotes] = useState([]);

  const navigation = useNavigation();


  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.notesButtonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={() => {combineListsAndSave(filePaths, notes)}}>
              <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton}>
              <Text onPress={() => {createPDF(ICONS)}} style={styles.saveButtonText}>Create PDF</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, filePaths, notes, activities])

  // Load once on mount
  useEffect(() => {
    (async () => {
      const saved = await GetActivities();
      setActivities(saved || []);
      setFilePaths(saved.map(item => item.filePath));
      setNotes(saved.map(item => item.notes));
    })();
    //console.log(activities);
  }, []);

  // Refresh every time the screen gets focus
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const saved = await GetActivities();
        if (alive){
          setActivities(saved || []);
          setFilePaths(saved.map(item => item.filePath));
          setNotes(saved.map(item => item.notes));
        } 
      })();
      return () => { alive = false; };
    }, [])
  );

  const renderItem = ({ item, index }) => {
    const src = ICONS[item.filePath]; // item is the saved string ID
    //console.log(item);
    return (
      <View style={styles.row}>
        <Text style={styles.label}>Activity {index + 1}:</Text>
        <View style={styles.iconAndTextInput}>
          <View style={styles.iconCircle}>
            {src ? (
              <Image source={src} style={styles.iconImage} />
            ) : (
              <Text style={styles.fallback}>?</Text>
            )}
          </View>
          
          <TextInput
            multiline     // Allow multiple lines
            style={styles.textBox}
            value={notes[index]}  // Controlled value
            onChangeText={newText => {
              setNotes((prev) => {
                const newNotes = prev.map((value, i) => {
                  if(i == index){
                    return newText;
                  }
                  return value;
                })
                //console.log(newNotes);
                return newNotes;
              });
            }}

          />
          
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Schedule</Text>

      <FlatList
        data={activities}
        keyExtractor={(it, idx) => `${it}-${idx}`}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No activities selected yet. Pick some on ADL, Fine Motor, etc.
          </Text>
        }
        contentContainerStyle={activities.length === 0 && { flex: 1, justifyContent: 'center' }}
        style={{ width: '100%' }}
      />

      <StatusBar style="auto" />
      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    width: '100%',
    paddingTop: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  row: {
    width: '90%',
    marginHorizontal: '5%',
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,        // push icon downward
    textAlign: 'center',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8CACA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  iconImage: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },
  fallback: {
    fontSize: 16,
    color: '#888',
  },
  empty: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    paddingHorizontal: 24,
  },
  notesButtonContainer: {
    flexDirection: 'row',
    gap: 20,
    padding:20,
    paddingHorizontal: 20,
  },
  saveButton: {
      backgroundColor: 'transparent', // transparent background
      borderWidth: 1,
      padding: 5,
      borderColor: '#333', // optional border
  },
  saveButtonText: {
      color: '#333', // custom text color
      textTransform: 'none', // keep lowercase
      fontSize: 16,
  },
  iconAndTextInput: {
      flexDirection: 'row',
      gap: 20,
      padding:20,
      width: '100%',
  }, 
  textBox: {
    width: '100%',
    fontSize: '20px',
  }
});

