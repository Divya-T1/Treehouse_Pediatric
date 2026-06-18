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
import {createChoiceBoardPDF} from '../PDFSaver';
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

    if(next.length > 9){
      createMax9Alert();
      return;
    }

    setChoiceBoardActivities(next);
  };


  const createMax9Alert = () => {
    Alert.alert(
      "Maximum Selection Reached",
      "You can only select up to 9 activities.",
      [{ text: "OK" }]
    );
  };

  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerButtonsContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={() => {SaveChoiceBoard(choiceBoardActivities)}}>
              <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>Choice Board</Text>
          <TouchableOpacity style={styles.saveButton} onPress={() => {createChoiceBoardPDF()}}>
              <Text style={styles.saveButtonText}>Print</Text>
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

  const renderGridItem = ({ item }) => {
    const src = typeof item.icon === 'string' ? { uri: item.icon } : item.icon;
    return (
      <TouchableOpacity style={styles.gridItem} activeOpacity={0.6} onPress={() => toggleSelection(item)}>
        <View style={styles.normalCircle}>
          {src ? (
            <Image source={src} style={styles.iconImage} />
          ) : (
            <Text style={styles.fallback}>?</Text>
          )}
        </View>
        <Text style={styles.gridLabel} numberOfLines={2}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item, index }) => {

    const src = typeof(item.icon) === "string" ? {uri: item.icon} : item.icon;

    return (
      <View style={styles.row}>
        <Text style={styles.label}>{item.name}</Text>
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

      <View style={styles.gridSection}>
        <Text style={styles.sectionLabel}>
          Choice Board ({choiceBoardActivities.length}/9)
        </Text>
        <FlatList
          data={choiceBoardActivities}
          keyExtractor={(it, idx) => `cb-${it.id}-${idx}`}
          renderItem={renderGridItem}
          numColumns={3}
          contentContainerStyle={styles.gridContent}
          ListEmptyComponent={
            <Text style={styles.empty}>Tap activities below to add them</Text>
          }
        />
      </View>

      <View style={styles.pickerSection}>
        <Text style={styles.sectionLabel}>Schedule Activities</Text>
        <FlatList
          data={activities}
          keyExtractor={(it, idx) => `all-${it.id}-${idx}`}
          renderItem={renderItem}
          contentContainerStyle={{ paddingRight: 20 }}
          style={styles.FlatListStyle}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <StatusBar style="auto" />
      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    width: '100%',
    paddingTop: 12,
  },
  gridSection: {
    flex: 1,
    paddingHorizontal: 8,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  pickerSection: {
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 8,
    marginBottom: 100,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  gridContent: {
    paddingBottom: 8,
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  gridLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    color: '#000',
    marginTop: 4,
  },
  FlatListStyle: {
    width: '100%',
    height: 160,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
    color: '#000',
  },
  row: {
    width: 100,
    marginHorizontal: 5,  // Changed from '5%' to fixed 5px - reduces excessive spacing
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
    color: '#000',
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#D2E1D0',
    borderWidth: 2,
    borderColor: '#7A5E4C',
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
  headerButtonsContainer: {
    flexDirection: 'row',         // Arrange buttons horizontally
    alignItems: 'center',          // Center vertically
    gap: 30,
  },
  headerTitleText: {
    textAlign: 'center',
    fontSize: 16,      // Matches other screen titles
    fontWeight: '700',  // Matches other screen titles
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#7A5E4C',
    borderWidth: 1,
    height: 30,
    padding: 5,
    borderColor: '#7A5E4C',
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#fff',
    textTransform: 'none',
    fontSize: 16,
    textAlign: 'center',
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
    fontSize: 17,
  },
  normalCircle: {
    width: 75,
    height: 75,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    marginVertical: 10,
    backgroundColor: '#D3D3D3',
    borderWidth: 2,
    borderColor: '#7A5E4C',
    overflow: 'hidden'
  },
  selectedCircle: {
    backgroundColor: '#7A9B76',
  },
});

