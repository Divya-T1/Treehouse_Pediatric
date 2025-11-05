import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import BottomNavBar from './NavigationOptions';
import AddCategoryModal from './AddCategoryModal';

export default function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);

  // Load categories from AsyncStorage or use defaults
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const saved = await AsyncStorage.getItem('categories');
        if (saved) {
          setCategories(JSON.parse(saved));
        } else {
          setCategories([
            { name: 'Gross Motor', image: require('../Running.png') },
            { name: 'Fun Activities', image: require('../TeddyBear.png') },
            { name: 'Fine Motor', image: require('../Arts.png') },
            { name: 'Room Spaces', image: require('../Door.png') },
            { name: 'Sensory', image: require('../PlayDoh.png') },
            { name: 'ADL', image: require('../Brushing.png') },
            { name: 'Regulation', image: require('../Headphones.png') },
            { name: 'Toys/Games', image: require('../assets/toy.png') },
          ]);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };

    loadCategories();
  }, []);

  // Save categories when they change
  useEffect(() => {
    const saveCategories = async () => {
      try {
        await AsyncStorage.setItem('categories', JSON.stringify(categories));
      } catch (err) {
        console.error('Error saving categories:', err);
      }
    };
    if (categories.length > 0) saveCategories();
  }, [categories]);

  // 🔹 Add new category
  const [modalVisible, setModalVisible] = useState(false);
  const handleAddCategory = (newCat) => {
    setCategories([...categories, newCat]);
  };

  // 🔹 Handle category press navigation
  const handleCategoryPress = (cat, index) => {
    switch (cat.name) {
      case 'ADL':
        navigation.navigate('ADL');
        break;
      case 'Fine Motor':
        navigation.navigate('Fine Motor');
        break;
      case 'Room Spaces':
        navigation.navigate('Room Spaces');
        break;
      case 'Regulation':
        navigation.navigate('Regulation');
        break;
      case 'Sensory':
        navigation.navigate('SensoryScreen');
        break;
      case 'Toys/Games':
        navigation.navigate('Toys and Games');
        break;
      case 'Gross Motor':
        navigation.navigate('Gross Motor');
        break;
      case 'Fun Activities':
        navigation.navigate('Fun Activities');
        break;
      default:
        navigation.navigate('CategoryScreen', {
          categoryIndex: index,
          categories,
          setCategories,
        });
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../Logo.png')} style={{ marginBottom: 10 }} />

      {/* Add Category Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>+ Add Category</Text>
      </TouchableOpacity>

      {/* Separator */}
      <View style={styles.separator} />

      <ScrollView>
        <View style={styles.grid}>
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={index}
              style={styles.circle}
              onPress={() => handleCategoryPress(cat, index)}
            >
              <Image source={cat.image} style={styles.icon} />
              <Text style={styles.activityText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <AddCategoryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddCategory}
      />

      <StatusBar style="auto" />
      <BottomNavBar />
    </SafeAreaView>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#fff', width: '100%' },
  addButton: {
    width: 140,
    height: 40,
    backgroundColor: 'rgba(108, 126, 107, 1)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  separator: { height: 1, backgroundColor: '#ccc', width: '90%', marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly' },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    backgroundColor: 'rgb(211,211,211)',
  },
  icon: { width: 60, height: 60, borderRadius: 30 },
  activityText: { marginTop: 5, fontSize: 14, textAlign: 'center', fontWeight: '600' },
});
