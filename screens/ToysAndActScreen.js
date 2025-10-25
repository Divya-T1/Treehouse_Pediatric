import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView } from 'react-native';
import {
  StyleSheet, Text, View, Image, SafeAreaView, TouchableOpacity
} from 'react-native';
import BottomNavBar from './NavigationOptions.js';
import { SaveActivities, GetActivities } from '../ActivitiesSaver.js';

export default function ToysAndActScreen() {
  // static requires for RN bundler
  const logo = require('../Logo.png');
  const img1 = require('../assets/TOYS/Group 16.png');
  const img2 = require('../assets/TOYS/Group-1.png');
  const img3 = require('../assets/TOYS/Group-2.png');
  const img4 = require('../assets/TOYS/Group.png');
  const img5 = require('../assets/TOYS/Vector-1.png');
  const img6 = require('../assets/TOYS/Vector-2.png');
  const img7 = require('../assets/TOYS/Vector-3.png');
  const img8 = require('../assets/TOYS/Vector-4.png');
  const img9 = require('../assets/TOYS/Vector-5.png');
  const img10 = require('../assets/TOYS/Vector.png');

  // keep your existing string IDs for storage
  const act1 = '../assets/TOYS/Group 16.png';
  const act2 = '../assets/TOYS/Group-1.png';
  const act3 = '../assets/TOYS/Group-2.png';
  const act4 = '../assets/TOYS/Group.png';
  const act5 = '../assets/TOYS/Vector-1.png';
  const act6 = '../assets/TOYS/Vector-2.png';
  const act7 = '../assets/TOYS/Vector-3.png';
  const act8 = '../assets/TOYS/Vector-4.png';
  const act9 = '../assets/TOYS/Vector-5.png';
  const act10 = '../assets/TOYS/Vector.png';

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
            <Text style={styles.activityText}>Animals</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act2)}>
            <View style={[styles.circle2, selectedActivities.includes(act2) && styles.selectedCircle]}>
              <Image source={img2} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Toy Cars</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act3)}>
            <View style={[styles.circle3, selectedActivities.includes(act3) && styles.selectedCircle]}>
              <Image source={img3} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Work Table</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act4)}>
            <View style={[styles.circle4, selectedActivities.includes(act4) && styles.selectedCircle]}>
              <Image source={img4} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Toy Food</Text>
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
            <Text style={styles.activityText}>Watch Video</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act7)}>
            <View style={[styles.circle6, selectedActivities.includes(act7) && styles.selectedCircle]}>
              <Image source={img7} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Puzzles</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act8)}>
            <View style={[styles.circle6, selectedActivities.includes(act8) && styles.selectedCircle]}>
              <Image source={img8} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>iPad Time</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act9)}>
            <View style={[styles.circle6, selectedActivities.includes(act9) && styles.selectedCircle]}>
              <Image source={img9} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Instrument</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act10)}>
            <View style={[styles.circle6, selectedActivities.includes(act10) && styles.selectedCircle]}>
              <Image source={img10} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Toy Train</Text>
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
    backgroundColor: 'rgb(218, 188, 188)',
    overflow: 'hidden',
  },

  circle2: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginVertical: 20,
    backgroundColor: 'rgb(218, 188, 188)',
    overflow: 'hidden',
  },

  circle3: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginVertical: 20,
    backgroundColor: 'rgb(218, 188, 188)',
    overflow: 'hidden',
  },

  circle4: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginVertical: 20,
    backgroundColor: 'rgb(218, 188, 188)',
    overflow: 'hidden',
  },

  circle5: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginVertical: 20,
    backgroundColor: 'rgb(218, 188, 188)',
    overflow: 'hidden',
  },

  circle6: {
    width: 100, height: 100, borderRadius: 50,
    alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 20, marginVertical: 20,
    backgroundColor: 'rgb(218, 188, 188)',
    overflow: 'hidden',
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
