import { StatusBar } from 'expo-status-bar';
import {ScrollView} from 'react-native';
import { StyleSheet, Text, View, Image, SafeAreaView, FlatList, TouchableOpacity, TouchableHighlight} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import GrossMotorScreen from './screens/GrossMotorScreen';
import ToyAndActScreen from './screens/ToysAndActScreen';
import ToyScreen from './screens/ToyScreen';
import FineMotorScreen from './screens/FineMotorScreen';
import RoomSpacesScreen from './screens/RoomSpacesScreen';
import Regulation from './screens/Regulation';
import SensoryScreen from './screens/SensoryScreen';
import ADLScreen from './screens/ADLscreen.js';
import BottomNavBar from './screens/NavigationOptions.js';
import Schedule from './screens/Schedule.js';
import NotesModal from './screens/NotesModal.js';

const Stack = createNativeStackNavigator();

/*Creating an array of circles*/
//new comment

//comment2

function Homescreen({navigation}) {
  return (
    <SafeAreaView style={styles.container}>
      <Image source = {require('./Logo.png')} />
      <ScrollView>
        <View style = {styles.grid}>
          <TouchableOpacity 
            activeOpacity = {0.6}
            onPress={() => navigation.navigate('Gross Motor')
            }>
              <View style = {styles.circle1}>
                <Image
                    source = {require('./Running.png')}
                />
              </View>
              <Text style={styles.activityText}>Gross Motor</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity = {0.6}
            onPress={() => navigation.navigate('Toys And Activities')}>
              <View style = {styles.circle2}>
                <Image
                    source = {require('./TeddyBear.png')}
                />
              </View>
              <Text style={styles.activityText}>Fun Activities</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity = {0.6}
            onPress={() => navigation.navigate('Fine Motor')}>
              <View style = {styles.circle3}>
                <Image
                    source = {require('./Arts.png')}
                />
              </View>
              <Text style={styles.activityText}>Fine Motor</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity = {0.6}
            onPress={() => navigation.navigate('Room Spaces')}>
              <View style = {styles.circle4}>
                <Image
                    source = {require('./Door.png')}
                />
              </View>
              <Text style={styles.activityText}>Room Spaces</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity = {0.6}
            onPress={() => navigation.navigate('SensoryScreen')}>
              <View style = {styles.circle5}>
                <Image
                    source = {require('./PlayDoh.png')}
                />
              </View>
              <Text style={styles.activityText}>Sensory Screen</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity = {0.6}
            onPress={() => navigation.navigate('ADLScreen')}>
              <View style = {styles.circle6}>
                <Image
                    source = {require('./Brushing.png')}
                />
              </View>
              <Text style={styles.activityText}>ADL</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity = {0.6}
            onPress={() => navigation.navigate('Regulation')}>
              <View style = {styles.circle7}>
                <Image
                    source = {require('./Headphones.png')}
                />
              </View>
              <Text style={styles.activityText}>Regulation</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity = {0.6}
            onPress={() => navigation.navigate('ToyScreen')}>
              <View style = {styles.circle8}>
                <Image
                    style = {styles.circle7}
                    source = {require('./assets/toy.png')}
                />
              </View>
              <Text style={styles.activityText}>Toys/Games</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
      <BottomNavBar />
    </SafeAreaView>
  );
}

// function GrossMotor({navigation}) {
//   return <Text> "This is a new page" </Text>;
  
// }

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Group>
          <Stack.Screen name = 'Home'
            component = {Homescreen}
          />
          <Stack.Screen name = "Gross Motor" 
          component={GrossMotorScreen}
          />
          <Stack.Screen name = "Toys And Activities" 
          component={ToyAndActScreen}
          />
          <Stack.Screen name = "Fine Motor" 
          component={FineMotorScreen}
          />
          <Stack.Screen name = "Room Spaces" 
          component={RoomSpacesScreen}
          />
          <Stack.Screen name = "Regulation" 
          component={Regulation}
          />
          <Stack.Screen name = "SensoryScreen" 
          component={SensoryScreen}
          />
          <Stack.Screen name = "ADLScreen" 
          component={ADLScreen}
          />
          <Stack.Screen name = "ToyScreen" 
          component={ToyScreen}
          />
          <Stack.Screen name = "Schedule" 
          component={Schedule}
          />
        </Stack.Group>
        <Stack.Group screenOptions={{ presentation: 'modal' }}>
          <Stack.Screen name = "Notes" component = {NotesModal} />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  )

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
    backgroundColor: 'rgb(211,211,211)',
  },

  circle2: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: 'rgb(211,211,211)',
  },

  circle3: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: 'rgb(211,211,211)',
  },

  circle4: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: 'rgb(211,211,211)',
  },

  circle5: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: 'rgb(211,211,211)',
  },

  circle6: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: 'rgb(211,211,211)',
  },

  circle7: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: 'rgb(211,211,211)',
  },

  circle8: {
    width: 100,
    height: 100,
    flexDirection: 'row',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: 'rgb(211,211,211)',
  },

  a: {
    marginHorizontal: -15,
  },

  l1: {
    marginHorizontal: -15,
  },

  l2: {
    marginHorizontal: -15,
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
