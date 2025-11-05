// screens/Schedule.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, SafeAreaView } from 'react-native';
import { GetActivities, ICONS } from './ActivitiesSaver';
import BottomNavBar from './NavigationOptions'; // import the nav bar

export default function Schedule() {
  const [activities, setActivities] = useState([]);

  // Activity names mapping directly in this file
  const ActivityNames = {
    // ADL
    '../assets/ADL/button.png': 'Button',
    '../assets/ADL/pants.png': 'Pants',
    '../assets/ADL/running_shoes.png': 'Running Shoes',
    '../assets/ADL/socks_.png': 'Socks',
    '../assets/ADL/t-shirt.png': 'T-Shirt',
    '../assets/ADL/toothbrush.png': 'Toothbrush',
    '../assets/ADL/zipper.png': 'Zipper',

    // Fine Motor
    '../assets/FineMotorPictures/coloring.png': 'Coloring',
    '../assets/FineMotorPictures/cutting.png': 'Cutting',
    '../assets/FineMotorPictures/dot_markers.png': 'Dot Markers',
    '../assets/FineMotorPictures/drawing.png': 'Drawing',
    '../assets/FineMotorPictures/craft.png': 'Craft',
    '../assets/FineMotorPictures/painting.png': 'Painting',
    '../assets/FineMotorPictures/tweezers.png': 'Tweezers',
    '../assets/FineMotorPictures/writing.png': 'Writing',

    // Gross Motor
    '../assets/Group_11.png': 'Gross Motor 1',
    '../assets/Group_12.png': 'Gross Motor 2',
    '../assets/image_6.png': 'Gross Motor 3',
    '../assets/image_7.png': 'Gross Motor 4',
    '../assets/image_9.png': 'Gross Motor 5',
    '../assets/image_10.png': 'Gross Motor 6',

    // Regulation
    '../assets/Regulation/image 1.png': 'Regulation 1',
    '../assets/Regulation/image 2.png': 'Regulation 2',
    '../assets/Regulation/image 3.png': 'Regulation 3',
    '../assets/Regulation/image 4.png': 'Regulation 4',
    '../assets/Regulation/image 5.png': 'Regulation 5',
    '../assets/Regulation/image 6.png': 'Regulation 6',
    '../assets/Regulation/image 20.png': 'Regulation 20',

    // Room Spaces
    '../assets/RoomSpacesPictures/horse.png': 'Rocking Chair',
    '../assets/RoomSpacesPictures/house.png': 'Nurse',
    '../assets/RoomSpacesPictures/mask.png': 'Auditory Room',
    '../assets/RoomSpacesPictures/puzzle.png': 'Puzzle Room',
    '../assets/RoomSpacesPictures/sitting.png': 'Waiting Room',
    '../assets/RoomSpacesPictures/talking.png': 'Speech Room',
    '../assets/RoomSpacesPictures/toilet.png': 'Bathroom',
    '../assets/RoomSpacesPictures/treehouse.png': 'Treetop Room',
    '../assets/RoomSpacesPictures/utensils.png': 'Kitchen',
    '../assets/RoomSpacesPictures/weight.png': 'Gym',

    // Sensory
    '../assets/Sensory/imageS.png': 'Sensory 1',
    '../assets/Sensory/peanutball.png': 'Peanut Ball',
    '../assets/Sensory/PlayDoh.png': 'PlayDoh',
    '../assets/Sensory/putty.png': 'Putty',
    './assets/Sensory/sandpit.png': 'Sandpit',
    '../assets/Sensory/swing.png': 'Swing',

    // TOYS
    '../assets/TOYS/Group 16.png': 'Toy Group 16',
    '../assets/TOYS/Group-1.png': 'Toy Group 1',
    '../assets/TOYS/Group-2.png': 'Toy Group 2',
    '../assets/TOYS/Group.png': 'Toy Group',
    '../assets/TOYS/Vector-1.png': 'Vector 1',
    '../assets/TOYS/Vector-2.png': 'Vector 2',
    '../assets/TOYS/Vector-3.png': 'Vector 3',
    '../assets/TOYS/Vector-4.png': 'Vector 4',
    '../assets/TOYS/Vector-5.png': 'Vector 5',
    '../assets/TOYS/Vector.png': 'Vector',

    // Extras
    '../ToyFood.png': 'Toy Food',
    '../assets/CarToy.png': 'Car Toy',
    '../assets/Train.png': 'Train',
    '../assets/AnimalToy.png': 'Animal Toy',
    '../assets/BookToy.png': 'Book Toy',
    '../assets/VideoToy.png': 'Video Toy',
  };

  useEffect(() => {
    const loadSchedule = async () => {
      const saved = await GetActivities();
      setActivities(saved || []);
    };
    loadSchedule();
  }, []);

const renderItem = ({ item, index }) => {
  // If no imageUri, fall back to ICONS registry
  let src = item.imageUri
    ? { uri: item.imageUri }
    : ICONS[item.key] || require('../assets/default.png');
  let name = item.name || ActivityNames[item.key] || `Activity ${index + 1}`;

  return (
    <View style={styles.row}>
      <Image source={src} style={styles.iconImage} />
      <Text style={styles.label}>{name}</Text>
    </View>
  );
};


  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Schedule</Text>
      <FlatList
  data={activities}
  keyExtractor={(item, idx) => item.key || (item + idx)}
  renderItem={renderItem}
  contentContainerStyle={{ paddingBottom: 100 }}
/>

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
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  row: {
    width: '90%',
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  iconImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});
