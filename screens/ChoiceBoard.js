// screens/ChoiceBoard.js
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
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import BottomNavBar from './NavigationOptions.js';
import { GetActivities, GetChoiceBoard, SaveChoiceBoard } from '../ActivitiesSaver.js';
import { useNavigation } from '@react-navigation/native';
import { createChoiceBoardPDF } from '../PDFSaver.js';

export default function ChoiceBoard() {
  const [activities, setActivities] = useState([]);
  const [choiceBoardActivities, setChoiceBoardActivities] = useState([]);

  const navigation = useNavigation();

  // Toggle activity selection (max 3)
  const toggleSelection = (act) => {
    const exists = choiceBoardActivities.find(item => item.id === act.id);
    let next = exists
      ? choiceBoardActivities.filter(item => item.id !== act.id)
      : [...choiceBoardActivities, act];

    if (next.length > 3) {
      Alert.alert("Maximum Selection Reached", "You can only select up to 3 activities.", [{ text: "OK" }]);
      return;
    }

    setChoiceBoardActivities(next);
  };

  // Header buttons
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.saveButton} onPress={() => SaveChoiceBoard(choiceBoardActivities)}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={createChoiceBoardPDF}>
            <Text style={styles.saveButtonText}>Create PDF</Text>
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, choiceBoardActivities]);

  // Load activities
  useEffect(() => {
    (async () => {
      const saved = await GetActivities();
      const savedChoiceBoard = await GetChoiceBoard();
      setActivities(saved || []);
      setChoiceBoardActivities(savedChoiceBoard || []);
    })();
  }, []);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        if (!alive) return;
        const saved = await GetActivities();
        const savedChoiceBoard = await GetChoiceBoard();
        setActivities(saved || []);
        setChoiceBoardActivities(savedChoiceBoard || []);
      })();
      return () => { alive = false; };
    }, [])
  );

  // Render each activity item
  const renderItem = ({ item }) => {
    const iconUri = typeof(item.icon) === "string" ? item.icon : item.icon?.uri;
    const src = iconUri ? { uri: iconUri } : null;
    const isSelected = choiceBoardActivities.find(act => act.id === item.id);

    return (
      <TouchableOpacity style={styles.activityWrapper} onPress={() => toggleSelection(item)}>
        <View style={[styles.activityCircle, isSelected && styles.selectedCircle]}>
          {src ? <Image source={src} style={styles.iconImage} /> : <Text style={styles.fallback}>?</Text>}
        </View>
        <Text style={styles.activityLabel}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Choice Board</Text>
      <Text style={styles.instructionText}>Select up to 3 activities for your choice board</Text>

      {/* Selected Activities */}
      <FlatList
        data={choiceBoardActivities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.flatList}
      />

      {/* All Activities */}
      <Text style={styles.sectionTitle}>All Activities</Text>
      <FlatList
        data={activities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.flatList}
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
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 8,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    textAlign: 'center',
  },
  flatList: {
    maxHeight: 140,
    marginBottom: 10,
  },
  activityWrapper: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  activityCircle: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#D3D3D3', // unselected
    borderWidth: 2,
    borderColor: '#7A5E4C',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  selectedCircle: {
    backgroundColor: '#D2E1D0', // selected
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
  activityLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 75,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 10,
  },
  saveButton: {
    backgroundColor: '#7A5E4C',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
