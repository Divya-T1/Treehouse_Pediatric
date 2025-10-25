import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView } from 'react-native';
import {
  StyleSheet, Text, View, Image, SafeAreaView, TouchableOpacity
} from 'react-native';
import BottomNavBar from './NavigationOptions.js';
import { SaveActivities, GetActivities } from '../ActivitiesSaver.js';

export default function ToyScreen() {
  // static requires for RN bundler
  const logo = require('../Logo.png');
  const img1 = require('../ToyFood.png');
  const img2 = require('../assets/CarToy.png');
  const img3 = require('../assets/Train.png');
  const img4 = require('../assets/AnimalToy.png');
  const img5 = require('../assets/BookToy.png');
  const img6 = require('../assets/VideoToy.png');
  const img7 = require('../assets/TOYS/Vector-3.png');
  const img8 = require('../assets/TOYS/Vector-4.png');
  const img9 = require('../assets/TOYS/Vector-5.png');
  const img10 = require('../assets/TOYS/Group-2.png');

  // keep your existing string IDs for storage
  const act1 = '../ToyFood.png';
  const act2 = '../assets/CarToy.png';
  const act3 = '../assets/Train.png';
  const act4 = '../assets/AnimalToy.png';
  const act5 = '../assets/BookToy.png';
  const act6 = '../assets/VideoToy.png';
  const act7 = '../assets/TOYS/Vector-3.png';
  const act8 = '../assets/TOYS/Vector-4.png';
  const act9 = '../assets/TOYS/Vector-5.png';
  const act10 = '../assets/TOYS/Group-2.png';

  const [selectedActivities, setSelectedActivities] = useState([]);

  useEffect(() => {
    (async () => {
      const saved = await GetActivities();
      setSelectedActivities(saved || []);
    })();
  }, []);

  async function toggleSelection(id) {
    const prev = await GetActivities();
    const next = prev.includes(id)
      ? prev.filter(item => item !== id)
      : [...prev, id];
    await SaveActivities(next);
    setSelectedActivities(next);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Image source={logo} />
      <ScrollView>
        <View style={styles.grid}>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act1)}>
            <View style={[styles.circle1, selectedActivities.includes(act1) && styles.selectedCircle]}>
              <Image source={img1} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Toy Food</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act2)}>
            <View style={[styles.circle2, selectedActivities.includes(act2) && styles.selectedCircle]}>
              <Image source={img2} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Toy Car</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act3)}>
            <View style={[styles.circle3, selectedActivities.includes(act3) && styles.selectedCircle]}>
              <Image source={img3} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Toy Train</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act4)}>
            <View style={[styles.circle4, selectedActivities.includes(act4) && styles.selectedCircle]}>
              <Image source={img4} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Stuffed Animal</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act5)}>
            <View style={[styles.circle5, selectedActivities.includes(act5) && styles.selectedCircle]}>
              <Image source={img5} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Reading</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act6)}>
            <View style={[styles.circle6, selectedActivities.includes(act6) && styles.selectedCircle]}>
              <Image source={img6} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Video</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act7)}>
            <View style={[styles.circle6, selectedActivities.includes(act7) && styles.selectedCircle]}>
              <Image source={img7} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Puzzle</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act8)}>
            <View style={[styles.circle6, selectedActivities.includes(act8) && styles.selectedCircle]}>
              <Image source={img8} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>iPad</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act9)}>
            <View style={[styles.circle6, selectedActivities.includes(act9) && styles.selectedCircle]}>
              <Image source={img9} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Card Game</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act10)}>
            <View style={[styles.circle6, selectedActivities.includes(act10) && styles.selectedCircle]}>
              <Image source={img10} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Table Work</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
      <BottomNavBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', alignItems: 'center', width: '100%' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    width: 300, // number, not "300px"
  },

  circle1: {
    width: 100, height: 100, padding: 20, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginVertical: 20,
    backgroundColor: 'rgb(195, 229, 236)',
  },

  circle2: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginVertical: 20,
    backgroundColor: 'rgb(195, 229, 236)',
  },

  circle3: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginVertical: 20,
    backgroundColor: 'rgb(195, 229, 236)',
  },

  circle4: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginVertical: 20,
    backgroundColor: 'rgb(195, 229, 236)',
  },

  circle5: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginVertical: 20,
    backgroundColor: 'rgb(195, 229, 236)',
  },

  circle6: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginVertical: 20,
    backgroundColor: 'rgb(195, 229, 236)',
  },

  circleImage: { width: 80, height: 80, resizeMode: 'contain' },

  selectedCircle: { backgroundColor: 'rgb(211,211,211)' },

  activityText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
  },
});
