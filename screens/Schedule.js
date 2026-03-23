// screens/Schedule.js
import React, { useEffect, useState, useCallback} from 'react';
import { StatusBar } from 'expo-status-bar';
import { Alert, Platform } from 'react-native';
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


export default function Schedule() {
  const [activities, setActivities] = useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.notesButtonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={() => {SaveActivities(activities)}}>
              <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton}>
              <Text onPress={() => {createPDF()}} style={styles.saveButtonText}>Create PDF</Text>
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

  console.log(activities);

  const handleNoteChange = (index, newNote) => {
    const updatedActivities = [...activities];
    updatedActivities[index] = {
      ...updatedActivities[index],
      notes: newNote
    };
    setActivities(updatedActivities);
  };
  const moveUp = (index) => {
  if (index === 0) return;

  const updated = [...activities];

  const temp = updated[index - 1];
  updated[index - 1] = updated[index];
  updated[index] = temp;

  setActivities(updated);
};

const moveDown = (index) => {
  if (index === activities.length - 1) return;

  const updated = [...activities];

  const temp = updated[index + 1];
  updated[index + 1] = updated[index];
  updated[index] = temp;

  setActivities(updated);
};

const deleteActivity = (index) => {
  if (Platform.OS === 'web') {
    const confirmDelete = window.confirm("Are you sure you want to delete this activity?");
    if (confirmDelete) {
      const updated = [...activities];
      updated.splice(index, 1);
      setActivities(updated);
    }
  } else {
    Alert.alert(
      "Delete Activity",
      "Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updated = [...activities];
            updated.splice(index, 1);
            setActivities(updated);
          }
        }
      ]
    );
  }
};

 const renderItem = ({ item, index }) => {

  const src = {
    uri: typeof item.icon === "string"
      ? item.icon
      : item.icon?.uri
  };

  return (
    <View style={styles.row}>

      <Text style={styles.label}>
        Activity {index + 1}: {item.name}
      </Text>

      <View style={styles.iconAndTextInput}>

        <View style={styles.iconCircle}>
          {src ? (
            <Image source={src} style={styles.iconImage} />
          ) : (
            <Text style={styles.fallback}>?</Text>
          )}
        </View>

        <TextInput
          multiline
          style={styles.textBox}
          value={item.notes || ''}
          onChangeText={(text) => handleNoteChange(index, text)}
        />
        <View style={styles.moveButtons}>
          <TouchableOpacity onPress={() => moveUp(index)}>
          <Text style={styles.moveText}>↑</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => moveDown(index)}>
          <Text style={styles.moveText}>↓</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => deleteActivity(index)}>
          <Text style={styles.deleteText}>🗑️</Text>
          </TouchableOpacity>
        </View>

       
        
       

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
  moveButtons: {
  flexDirection: "row",
  gap: 20,
  marginTop: 10,
},

moveText: {
  fontSize: 22,
  fontWeight: "bold",
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