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

    const pathName = '../Logo.png';

    const act1 = '../assets/FineMotorPictures/cutting.png';
    const act2 = '../assets/FineMotorPictures/writing.png';
    const act3 = '../assets/FineMotorPictures/tweezers.png';

    const [selectedActivities, setSelectedActivities] = useState(GetActivities());
   
     function toggleSelection(id) {
       var prev = GetActivities();
       prev = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
       //console.log('toggleSelection');
       //console.log(JSON.stringify(prev));
       SaveActivities(prev);
       setSelectedActivities(prev);
     };
      //make a class that has a function that does the below - so that i can add a new object each time new thing added to schedule
  //click it again, gets removed from the list

    const activities = GetActivities();

 

    return (
      <SafeAreaView style={styles.container}>
        <Image source = {require(pathName)} />

        <Text style={styles.headtext}>Schedule</Text>
        <View style={{height: 1, backgroundColor: '#000000ff', width: '80%', marginVertical: 10,}}/>

        <ScrollView>
          <View style = {styles.grid}>

          {activities.map((activity, index) =>(
            <View key = {index}>

              <Text style = {styles.text1}>Activity {index + 1}:</Text>
              <TouchableOpacity>
              <View style={[
                styles.scheduleback,
                selectedActivities.includes(index) && styles.selectedCircle,
              ]}>
              <Image source={{ uri: activity }} style={styles.circleImage} />
            </View>
            </TouchableOpacity>
            <View style={styles.horizontalLine} />


            </View>
          ))}
            

            {/* how it's supposed to be:: */}


            <Text style = {styles.text1}>Activity 1:</Text>
            <TouchableOpacity activeOpacity ={0.6} onPress={(act3) => toggleSelection()}>
              <View style = {[styles.scheduleback, selectedActivities.includes(act3) && styles.selectedCircle]}>
                <Image source = {require(act3)} style={styles.circleImage}/>
                </View>
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
      width: '400px',
    },

    headtext:{
      fontSize: '45px',
    },

    text1:{
      fontSize: '30px',
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 40,
    },

    scheduleback:{
      width: 100,
      height: 100,
      padding: 20,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 20,
      marginVertical: 20,
      backgroundColor: 'rgba(159, 197, 162, 1)',
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
  