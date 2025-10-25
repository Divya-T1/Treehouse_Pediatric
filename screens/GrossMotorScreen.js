import React, {useState, useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import {ScrollView} from 'react-native';
import { StyleSheet, Text, View, Image, SafeAreaView, FlatList, TouchableOpacity, TouchableHighlight, Button} from 'react-native';
import BottomNavBar from './NavigationOptions.js';
import { SaveActivities, GetActivities } from '../ActivitiesSaver.js';

/*Creating an array of circles*/
//new comment

//comment2

export default function GrossMotorScreen() {

  const pathName = '../Logo.png';
  const act1 = '../assets/Group_11.png';
  const act2 = '../assets/Group_12.png';
  const act3 = '../assets/image_6.png';
  const act4 = '../assets/image_7.png';
  const act5 = '../assets/image_9.png';
  const act6 = '../assets/image_10.png';
  

  const [selectedActivities, setSelectedActivities] = useState([]);
  
  useEffect(() => {
    GetActivities().then((prev) => {
      setSelectedActivities(prev);
    });
  }, []);
  
  console.log(selectedActivities);


  function toggleSelection(id) {
    GetActivities().then(success);

    function success(prev) {
      prev = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      //console.log('toggleSelection');
      //console.log(JSON.stringify(prev));
      SaveActivities(prev);
      setSelectedActivities(prev);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source = {require(pathName)} />
      <ScrollView>
        <View style = {styles.grid}>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act1)}>
            <View style={[styles.circle1, selectedActivities.includes(act1) && styles.selectedCircle]}>
              <Image source={require(act1)} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Rock Climbing</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act2)}>
            <View style={[styles.circle2, selectedActivities.includes(act2) && styles.selectedCircle]}>
              <Image source={require(act2)} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Sliding</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act3)}>
            <View style={[styles.circle3, selectedActivities.includes(act3) && styles.selectedCircle]}>
              <Image source={require(act3)} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Yoga</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act4)}>
            <View style={[styles.circle4, selectedActivities.includes(act4) && styles.selectedCircle]}>
              <Image source={require(act4)} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Balancing Beam</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act5)}>
            <View style={[styles.circle5, selectedActivities.includes(act5) && styles.selectedCircle]}>
              <Image source={require(act5)} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Trampoline</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act6)}>
            <View style={[styles.circle6, selectedActivities.includes(act6) && styles.selectedCircle]}>
              <Image source={require(act6)} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Obstacle Course</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
