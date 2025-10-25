import React, {useState, useEffect} from 'react';
import { StatusBar } from 'expo-status-bar';
import {ScrollView} from 'react-native';
import { StyleSheet, Text, View, Image, SafeAreaView, FlatList, TouchableOpacity, TouchableHighlight, Button} from 'react-native';
import BottomNavBar from './NavigationOptions.js';
import { SaveActivities, GetActivities } from '../ActivitiesSaver.js';

/*Creating an array of circles*/
//new comment

//comment2


export default function RoomSpacesScreen() {

  const pathName = '../Logo.png';
  const act1 = '../assets/RoomSpacesPictures/horse.png';
  const act2 = '../assets/RoomSpacesPictures/house.png';
  const act3 = '../assets/RoomSpacesPictures/mask.png';
  const act4 = '../assets/RoomSpacesPictures/puzzle.png';
  const act5 = '../assets/RoomSpacesPictures/sitting.png';
  const act6 = '../assets/RoomSpacesPictures/talking.png';
  const act7 = '../assets/RoomSpacesPictures/toilet.png';
  const act8 = '../assets/RoomSpacesPictures/treehouse.png';
  const act9 = '../assets/RoomSpacesPictures/utensils.png';
  const act10 = '../assets/RoomSpacesPictures/weight.png';



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
//Icons in Room Space left to match:
// OT room
// Toy Closet
// ABA Gym
// ABA treatment room


  return (
    <SafeAreaView style={styles.container}>
      <Image source = {require(pathName)} />
      <ScrollView>
        <View style = {styles.grid}>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act1)}>
            <View style={[styles.circle1, selectedActivities.includes(act1) && styles.selectedCircle]}>
              <Image source={require(act1)} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Rocking Chair</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act2)}>
            <View style={[styles.circle2, selectedActivities.includes(act2) && styles.selectedCircle]}>
              <Image source={require(act2)} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Nurse</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act3)}>
            <View style={[styles.circle3, selectedActivities.includes(act3) && styles.selectedCircle]}>
              <Image source={require(act3)} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Auditory Room</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act4)}>
            <View style={[styles.circle4, selectedActivities.includes(act4) && styles.selectedCircle]}>
              <Image source={require(act4)} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Puzzle Room</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act5)}>
            <View style={[styles.circle5, selectedActivities.includes(act5) && styles.selectedCircle]}>
              <Image source={require(act5)} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Waiting Room</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act6)}>
            <View style={[styles.circle6, selectedActivities.includes(act6) && styles.selectedCircle]}>
              <Image source={require(act6)} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Speech Room</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act7)}>
            <View style={[styles.circle6, selectedActivities.includes(act7) && styles.selectedCircle]}>
              <Image source={require(act7)} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Bathroom</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act8)}>
            <View style={[styles.circle6, selectedActivities.includes(act8) && styles.selectedCircle]}>
              <Image source={require(act8)} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Treetop Room</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act9)}>
            <View style={[styles.circle6, selectedActivities.includes(act9) && styles.selectedCircle]}>
              <Image source={require(act9)} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Kitchen</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act10)}>
            <View style={[styles.circle6, selectedActivities.includes(act10) && styles.selectedCircle]}>
              <Image source={require(act10)} style={styles.circleImage} />
            </View>
            <Text style={styles.activityText}>Gym</Text>
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
    paddingLeft: 10,
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
