// screens/Schedule.js
import React, { useEffect, useState, useCallback, useRef} from 'react';
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
  Platform,
  KeyboardAvoidingView,
  Keyboard
} from 'react-native';
import { CurrentRenderContext, useFocusEffect } from '@react-navigation/native';
import BottomNavBar from './NavigationOptions.js';
import { GetActivities, SaveActivities } from '../ActivitiesSaver.js';
import { useNavigation } from '@react-navigation/native';
import {createPDF} from '../PDFSaver.js';
//remove custom catogories getting removed when all delete
//add 4 choice board
//Specific deletion
//Add deleting after every session for privacy 

export default function Schedule() {
  const [activities, setActivities] = useState([]);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const flatListRef = useRef(null);

  const navigation = useNavigation();


  useEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.headerButtonsContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={() => {SaveActivities(activities)}}>
              <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitleText}>Schedule</Text>
          <TouchableOpacity style={styles.saveButton} onPress={() => {createPDF()}}>
              <Text style={styles.saveButtonText}>Print</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, activities]);

  // Load once on mount
  useEffect(() => {
    (async () => {
      const saved = await GetActivities();
      setActivities(saved || []);
    })();
    //console.log(filePaths);
  }, []);

  // Refresh every time the screen gets focus
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const saved = await GetActivities();
        if (alive){
          setActivities(saved || []);
        } 
      })();
      return () => { alive = false; };
    }, [])
  );

  //console.log(keyboardVisible);

  const handleNoteChange = (index, newNote) => {
    const updatedActivities = [...activities];
    updatedActivities[index] = {
      ...updatedActivities[index],
      notes: newNote
    };
    setActivities(updatedActivities);
    setCurrentNoteIndex(index);
  };

  const handlePressIn = (index) => {
    setCurrentNoteIndex(index);
    console.log(currentNoteIndex == activities.length-1);
    //console.log(activities.length);

    // Scroll to the focused item after a short delay to ensure keyboard is visible
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: index,
        animated: true,
        viewPosition: 0.5, // Center the item on screen
      });
    }, 300);
  }

  const renderItem = ({ item, index }) => {

    const src = typeof(item.icon) === "string" ? {uri: item.icon} : item.icon;

    return (
      <View style={styles.row}>
        <Text style={styles.label}>Activity {index + 1}: {item.name}</Text>
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
            value={item.notes || ''}  // Controlled value
            onChangeText={(text) => handleNoteChange(index, text)}
            onPressIn={() => handlePressIn(index)}
          />
          
        </View>
      </View>
    );
  };

  return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}>

        <FlatList
          ref={flatListRef}
          data={activities}
          keyExtractor={(it, idx) => `${it}-${idx}`}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No activities selected yet. Pick some on ADL, Fine Motor, etc.
            </Text>
          }
          contentContainerStyle={activities.length === 0 ? { flex: 1, justifyContent: 'center', paddingBottom: 150 } : { paddingBottom: 150 }}
          style={{ width: '100%' }}
          onScrollToIndexFailed={(info) => {
            // Fallback if scrollToIndex fails
            setTimeout(() => {
              flatListRef.current?.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: true,
              });
            }, 100);
          }}
        />

        <StatusBar style="auto" />
        <BottomNavBar />
      </KeyboardAvoidingView>
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
    marginTop: 8,
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
  headerButtonsContainer: {
    flexDirection: 'row',         // Arrange buttons horizontally
    alignItems: 'center',          // Center vertically
    gap: 30,
  },
  headerTitleText: {
    textAlign: 'center',
    fontSize: 16,      // Matches other screen titles
    fontWeight: '600',  // Matches other screen titles
    color: '#333',
  },
  saveButton: {
      backgroundColor: 'transparent', // transparent background
      borderWidth: 1,
      height: 30,
      padding: 5,
      borderColor: '#333', // optional border
  },
  saveButtonText: {
      color: '#333', // custom text color
      textTransform: 'none', // keep lowercase
      fontSize: 16,
      textAlign: 'center',
  },
  iconAndTextInput: {
      flexDirection: 'row',
      gap: 20,
      padding:20,
      width: '100%',
  }, 
  textBox: {
    width: 200,
    fontSize: 17,
  }
});

