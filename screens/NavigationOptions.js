// BottomNavBar.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SaveActivities, GetActivities } from '../ActivitiesSaver.js';

export default function BottomNavBar() {
  const navigation = useNavigation();

  return (
    <View style={styles.navBar}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.navText}>← Back</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Text style={styles.navText}>⌂ Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Schedule')}>
        <Text style={styles.navText}>🗓 Schedule</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ChoiceBoard')}>
        <Text style={styles.navText}>✅ Choice Board</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  navText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});
