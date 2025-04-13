import React, {useState} from 'react';
import { StatusBar } from 'expo-status-bar';
import {ScrollView} from 'react-native';
import { StyleSheet, Text, View, Image, SafeAreaView, FlatList, TouchableOpacity, TouchableHighlight, Button} from 'react-native';

/*Creating an array of circles*/
//new comment

//comment2

export default function ToysAndActScreen() {

  const pathName = '../Logo.png';
  const act1 = '../assets/TOYS/Group 6.png';
  const act2 = '../assets/TOYS/Group 9.png';
  const act3 = '../assets/TOYS/Group 10.png';
  const act4 = '../assets/TOYS/fig 1.png';
  const act5 = '../assets/TOYS/eat 3.png';
  const act6 = '../assets/TOYS/blicks 1.png';
  const act7 = '../assets/TOYS/balcar 2.png';
  const act8 = '../assets/TOYS/teddy 1.png';

  const [selectedActivities, setSelectedActivities] = useState([]);

  const toggleSelection = (id) => {
    setSelectedActivities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
            <Text style={styles.activityText}>Train</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act2)}>
            <View style={[styles.circle2, selectedActivities.includes(act2) && styles.selectedCircle]}>
              <Image source={require(act2)} style={styles.circleImage} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act3)}>
            <View style={[styles.circle3, selectedActivities.includes(act3) && styles.selectedCircle]}>
              <Image source={require(act3)} style={styles.circleImage} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act4)}>
            <View style={[styles.circle4, selectedActivities.includes(act4) && styles.selectedCircle]}>
              <Image source={require(act4)} style={styles.circleImage} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act5)}>
            <View style={[styles.circle5, selectedActivities.includes(act5) && styles.selectedCircle]}>
              <Image source={require(act5)} style={styles.circleImage} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act6)}>
            <View style={[styles.circle6, selectedActivities.includes(act6) && styles.selectedCircle]}>
              <Image source={require(act6)} style={styles.circleImage} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act7)}>
            <View style={[styles.circle6, selectedActivities.includes(act7) && styles.selectedCircle]}>
              <Image source={require(act7)} style={styles.circleImage} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.6} onPress={() => toggleSelection(act8)}>
            <View style={[styles.circle6, selectedActivities.includes(act8) && styles.selectedCircle]}>
              <Image source={require(act8)} style={styles.circleImage} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
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
    backgroundColor: 'rgb(218, 188, 188)',
    overflow: 'hidden',
  },

  circleImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    //resizeMode: 'cover',
  },

  circle2: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: 'rgb(218, 188, 188)',
    overflow: 'hidden',
  },

  circle3: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: 'rgb(218, 188, 188)',
    overflow: 'hidden',
  },

  circle4: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: 'rgb(218, 188, 188)',
    overflow: 'hidden',
  },

  circle5: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: 'rgb(218, 188, 188)',
    overflow: 'hidden',
  },

  circle6: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: 'rgb(218, 188, 188)',
    overflow: 'hidden',
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
