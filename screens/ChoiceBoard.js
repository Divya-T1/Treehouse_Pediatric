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
  TextInput,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import BottomNavBar from './NavigationOptions.js';
import { GetActivities, SaveActivities } from '../ActivitiesSaver.js';
import { useNavigation } from '@react-navigation/native';
import {createChoiceBoardPDF} from '../PDFSaver.js';
import { GetChoiceBoard, SaveChoiceBoard } from '../ActivitiesSaver.js';


export default function ChoiceBoard() {
  const [activities, setActivities] = useState([]);
  const [choiceBoardActivities, setChoiceBoardActivities] = useState([]);

  const navigation = useNavigation();

  const toggleSelection = (act) =>  {
    const id = act.id;
    const prev = choiceBoardActivities;


    const exists = prev.find(item => item.id === id);
    const next = exists
      ? prev.filter(item => item.id !== id)
      : [...prev, act];

    if(next.length > 3){
      createMax3Alert();
      return;
    }

    setChoiceBoardActivities(next);
  };


  const createMax3Alert = () => {
    alert("You can only select up to 3 activities.");
    Alert.alert(
      "Maximum Selection Reached",
      "You can only select up to 3 activities.",
      [{ text: "OK" }]
    );
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.notesButtonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={() => {SaveChoiceBoard(choiceBoardActivities)}}>
              <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton}>
              <Text onPress={() => {createChoiceBoardPDF()}} style={styles.saveButtonText}>Create PDF</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, choiceBoardActivities]);

  // Load once on mount
  useEffect(() => {
    (async () => {
      const saved = await GetActivities();
      setActivities(saved || []);
      const savedChoiceBoard = await GetChoiceBoard();
      setChoiceBoardActivities(savedChoiceBoard);
    })();
    //console.log(filePaths);
  }, []);

  // Refresh every time the screen gets focus
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const saved = await GetActivities();
        const savedChoiceBoard = await GetChoiceBoard();
        if (alive){
          setActivities(saved || []);     
          setChoiceBoardActivities(savedChoiceBoard);
        } 
      })();
      return () => { alive = false; };
    }, [])
  );

  const renderItem = ({ item, index }) => {


    const iconUri = typeof(item.icon) === "string" ? item.icon : item.icon.uri;
    const src = {uri: iconUri};

    return (
      <View style={styles.row}>
        <Text style={styles.label}>Activity {index + 1}</Text>
        <View style={[styles.iconAndTextInput]}>
          <View style={styles.iconCircle}>
            
            <TouchableOpacity activeOpacity={0.6} onPress={() => {toggleSelection(item)}}>
                <View style={[styles.normalCircle, choiceBoardActivities.find(act => act.id === item.id) && styles.selectedCircle]}>
                    {src ? (
                        <Image source={src} style={styles.iconImage} />
                    ) : (
                        <Text style={styles.fallback}>?</Text>
                    )}
                </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Choice Board</Text>

      <FlatList
        data={choiceBoardActivities}
        keyExtractor={(it, idx) => `${it}-${idx}`}
        renderItem={renderItem}
        contentContainerStyle={choiceBoardActivities.length === 0 && { flex: 1, justifyContent: 'center' }}
        style={styles.MainFlatListStyle}
        horizontal={true}
      />

      <FlatList
        data={activities}
        keyExtractor={(it, idx) => `${it}-${idx}`}
        renderItem={renderItem}
        contentContainerStyle={activities.length === 0 && { flex: 1, justifyContent: 'center' }}
        style={styles.FlatListStyle}
        horizontal={true}
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
  FlatListStyle: {
    width: '100%',
    position: 'absolute',
    bottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#000000ff',
  },
  MainFlatListStyle: {
    display: 'flex',
    position: 'absolute',
    top: 70,
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
    borderColor: '#ddd',
    borderWidth: 1,
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
    textAlign: 'center',
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
      paddingHorizontal: 40,
      paddingVertical: 10,
      width: '100%',
      justifyContent: 'center',
  }, 
  textBox: {
    width: '100%',
    fontSize: '20px',
  },
  normalCircle: { width: 75, height: 75, borderRadius: 75, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(211,211,211)', overflow: 'hidden' },
  selectedCircle: {
    backgroundColor: 'rgb(218, 188, 188)',
  },
});

