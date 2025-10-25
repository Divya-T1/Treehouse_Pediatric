import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView } from 'react-native';
import {
  StyleSheet, Text, View, Image, SafeAreaView, TouchableOpacity
} from 'react-native';
import BottomNavBar from './NavigationOptions.js';
import { SaveActivities, GetActivities } from '../ActivitiesSaver.js';

export default function Regulation() {
  // static requires for RN bundler (filenames contain spaces; static require is important)
  const logo = require('../Logo.png');
  const img1 = require('../assets/Regulation/image 1.png');
  const img2 = require('../assets/Regulation/image 2.png');
  const img3 = require('../assets/Regulation/image 3.png');
  const img4 = require('../assets/Regulation/image 4.png');
  const img5 = require('../assets/Regulation/image 5.png');
  const img6 = require('../assets/Regulation/image 6.png');
  const img7 = require('../assets/Regulation/image 20.png');

  // keep IDs as your existing strings for storage
  const act1 = '../assets/Regulation/image 1.png';
  const act2 = '../assets/Regulation/image 2.png';
  const act3 = '../assets/Regulation/image 3.png';
  const act4 = '../assets/Regulation/image 4.png';
  const act5 = '../assets/Regulation/image 5.png';
  const act6 = '../assets/Regulation/image 6.png';
  const act7 = '../assets/Regulation/image 20.png';

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
            <Text style={styles.activityText}>Breathing</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act2)}>
            <View style={[styles.circle1, selectedActivities.includes(act2) && styles.selectedCircle]}>
              <Image source={img2} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Lights Off</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act3)}>
            <View style={[styles.circle1, selectedActivities.includes(act3) && styles.selectedCircle]}>
              <Image source={img3} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Quiet Space</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act4)}>
            <View style={[styles.circle1, selectedActivities.includes(act4) && styles.selectedCircle]}>
              <Image source={img4} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Hugging</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act5)}>
            <View style={[styles.circle1, selectedActivities.includes(act5) && styles.selectedCircle]}>
              <Image source={img5} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Relaxing</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act6)}>
            <View style={[styles.circle1, selectedActivities.includes(act6) && styles.selectedCircle]}>
              <Image source={img6} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Weighted Blanket</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act7)}>
            <View style={[styles.circle1, selectedActivities.includes(act7) && styles.selectedCircle]}>
              <Image source={img7} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Music</Text>
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
    width: 100,
    height: 100,
    padding: 0,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    marginVertical: 5,
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
