import React, {useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import {ScrollView} from 'react-native';
import { StyleSheet, Text, View, Image, SafeAreaView, FlatList, TouchableOpacity, TouchableHighlight, Button} from 'react-native';
import BottomNavBar from './NavigationOptions.js';
import { SaveActivities, GetActivities } from '../ActivitiesSaver.js';

/*Creating an array of circles*/
//new comment

//comment2

export default function Schedule() {

    const [selectedActivities, setSelectedActivities] = useState([]);
  
    const toggleSelection = (id) => {
      setSelectedActivities((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <Text>Schedule</Text>
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
      justifyContent: 'top',
      width: '100%',
    },
  
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-evenly',
      width: '300px',
    },
  
    circle1: {
      width: 100,
      height: 100,
      padding: 20,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 20,
      marginVertical: 20,
      backgroundColor: 'rgb(195, 229, 236)',
    },
  
    circleImage: {
      width: 80,
      height: 80,
      resizeMode: 'contain',
    },
  
    circle2: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 20,
      marginVertical: 20,
      backgroundColor: 'rgb(195, 229, 236)',
    },
  
    circle3: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 20,
      marginVertical: 20,
      backgroundColor: 'rgb(195, 229, 236)',
    },
  
    circle4: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 20,
      marginVertical: 20,
      backgroundColor: 'rgb(195, 229, 236)',
    },
  
    circle5: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 20,
      marginVertical: 20,
      backgroundColor: 'rgb(195, 229, 236)',
    },
  
    circle6: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 20,
      marginVertical: 20,
      backgroundColor: 'rgb(195, 229, 236)',
    },
  
    selectedCircle: {
      borderWidth: 3,
      backgroundColor: 'rgb(211,211,211)',
      borderWidth: 0,
    },
  
    activityText: {
      fontSize: 16,
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: "center", 
      fontWeight: '600', 
      color: '#333', 
      textAlign: 'center', 
    },
  
  });
  