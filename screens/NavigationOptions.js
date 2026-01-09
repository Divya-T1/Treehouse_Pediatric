// BottomNavBar.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SaveActivities, GetActivities } from '../ActivitiesSaver.js';

export default function BottomNavBar() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const navBarIcons = [require('../assets/NavBarIcons/Calendar.png'), require('../assets/NavBarIcons/Home.png'), require('../assets/NavBarIcons/ChoiceBoard.png')]
  const navBarIconsSelected = [require('../assets/NavBarIcons/Calendar_Selected.png'), require('../assets/NavBarIcons/Home_Selected.png'), require('../assets/NavBarIcons/ChoiceBoard_Selected.png')]

  const state = navigation.getState(); 
  const currentRouteName = state.routes[state.index].name; 

  return (
    <View style={[styles.navBar, { paddingBottom: insets.bottom }]}>
      <TouchableOpacity onPress={() => navigation.navigate('Schedule')} style={styles.navBarIconContainer}>
        <Image
          source={currentRouteName === 'Schedule' ? navBarIconsSelected[0] : navBarIcons[0]}
          style={styles.navBarIcon}
        />
        <Text style={styles.navText}>Schedule</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.navBarIconContainer}>
        <Image
          source={currentRouteName === 'Home' ? navBarIconsSelected[1] : navBarIcons[1]}
          style={styles.navBarIcon}
        />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('ChoiceBoard')} style={styles.navBarIconContainer}>
        <Image
          source={currentRouteName === 'ChoiceBoard' ? navBarIconsSelected[2] : navBarIcons[2]}
          style={styles.navBarIcon}
        />        
        <Text style={styles.navText}>Choice Board</Text>
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
    paddingVertical: 5,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  navText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  navBarIconContainer: {
    alignItems:'center',
    width: 100,
  },
  navBarIcon: {
    marginBottom:2,
    width:30,
    height:30,
  }
});
