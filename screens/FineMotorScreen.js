import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ScrollView } from 'react-native';
import {
  StyleSheet, Text, View, Image, SafeAreaView,
  TouchableOpacity
} from 'react-native';
import BottomNavBar from './NavigationOptions.js';
import { SaveActivities, GetActivities } from './ActivitiesSaver.js';

export default function FineMotorScreen() {
  // Use static requires (safe for RN bundler)
  const logo = require('../Logo.png');
  const img1 = require('../assets/FineMotorPictures/coloring.png');
  const img2 = require('../assets/FineMotorPictures/cutting.png');
  const img3 = require('../assets/FineMotorPictures/dot_markers.png');
  const img4 = require('../assets/FineMotorPictures/drawing.png');
  const img5 = require('../assets/FineMotorPictures/craft.png');
  const img6 = require('../assets/FineMotorPictures/painting.png');
  const img7 = require('../assets/FineMotorPictures/tweezers.png');
  const img8 = require('../assets/FineMotorPictures/writing.png');

  // Keep your selected IDs as strings you already use
  const act1 = '../assets/FineMotorPictures/coloring.png';
  const act2 = '../assets/FineMotorPictures/cutting.png';
  const act3 = '../assets/FineMotorPictures/dot_markers.png';
  const act4 = '../assets/FineMotorPictures/drawing.png';
  const act5 = '../assets/FineMotorPictures/craft.png';
  const act6 = '../assets/FineMotorPictures/painting.png';
  const act7 = '../assets/FineMotorPictures/tweezers.png';
  const act8 = '../assets/FineMotorPictures/writing.png';

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
            <Text style={styles.activityText}>Coloring</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act2)}>
            <View style={[styles.circle2, selectedActivities.includes(act2) && styles.selectedCircle]}>
              <Image source={img2} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Cutting</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act3)}>
            <View style={[styles.circle3, selectedActivities.includes(act3) && styles.selectedCircle]}>
              <Image source={img3} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Dot Markers</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act4)}>
            <View style={[styles.circle4, selectedActivities.includes(act4) && styles.selectedCircle]}>
              <Image source={img4} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Drawing</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act5)}>
            <View style={[styles.circle5, selectedActivities.includes(act5) && styles.selectedCircle]}>
              <Image source={img5} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Craft</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act6)}>
            <View style={[styles.circle6, selectedActivities.includes(act6) && styles.selectedCircle]}>
              <Image source={img6} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Painting</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act7)}>
            <View style={[styles.circle6, selectedActivities.includes(act7) && styles.selectedCircle]}>
              <Image source={img7} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Tweezers</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act8)}>
            <View style={[styles.circle6, selectedActivities.includes(act8) && styles.selectedCircle]}>
              <Image source={img8} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Writing</Text>
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
    width: 300, // RN expects numbers, not '300px'
  },
  circle1: { width: 100, height: 100, padding: 20, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(218, 188, 188)', overflow: 'hidden' },
  circle2: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(218, 188, 188)', overflow: 'hidden' },
  circle3: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(218, 188, 188)', overflow: 'hidden' },
  circle4: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(218, 188, 188)', overflow: 'hidden' },
  circle5: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(218, 188, 188)', overflow: 'hidden' },
  circle6: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginVertical: 20, backgroundColor: 'rgb(218, 188, 188)', overflow: 'hidden' },
  circleImage: { width: 80, height: 80, resizeMode: 'contain' },
  selectedCircle: { backgroundColor: 'rgb(211,211,211)' },
  activityText: { fontSize: 16, textAlign: 'center', fontWeight: '600', color: '#333' },
});
