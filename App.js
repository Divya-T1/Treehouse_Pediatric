import { StatusBar } from 'expo-status-bar';
import {ScrollView} from 'react-native';
import { StyleSheet, Text, View, Image, SafeAreaView, FlatList, TouchableOpacity, TouchableHighlight} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


const Stack = createNativeStackNavigator();

/*Creating an array of circles*/



function Homescreen({navigation}) {
  return (
    <SafeAreaView style={styles.container}>
      <Image source = {require('./Logo.png')} />
      <ScrollView>
        <View style = {styles.grid}>
          <TouchableOpacity 
            activeOpacity = {0.6}
            onPress={() => navigation.navigate('Gross Motor')}>
              <View style = {styles.circle1}>
                <Image
                    source = {require('./Running.png')}
                />
              </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity = {0.6}
            onPress={() => console.log("HIIII")}>
              <View style = {styles.circle2}>
                <Image
                    source = {require('./TeddyBear.png')}
                />
              </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity = {0.6}
            onPress={() => console.log("HIIII")}>
              <View style = {styles.circle3}>
                <Image
                    source = {require('./Arts.png')}
                />
              </View>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity = {0.6}
            onPress={() => console.log("HIIII")}>
              <View style = {styles.circle4}>
                <Image
                    source = {require('./Door.png')}
                />
              </View>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity = {0.6}
            onPress={() => console.log("HIIII")}>
              <View style = {styles.circle5}>
                <Image
                    source = {require('./PlayDoh.png')}
                />
              </View>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity = {0.6}
            onPress={() => console.log("HIIII")}>
              <View style = {styles.circle6}>
                <Image
                    source = {require('./Brushing.png')}
                />
              </View>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity = {0.6}
            onPress={() => console.log("HIIII")}>
              <View style = {styles.circle7}>
                <Image
                    source = {require('./Headphones.png')}
                />
              </View>
          </TouchableOpacity>
          <TouchableOpacity 
            activeOpacity = {0.6}
            onPress={() => console.log("HIIII")}>
              <View style = {styles.circle8}>
                <Image
                    style = {styles.a}
                    source = {require('./mynaui_letter-a-solid.png')}
                />
                <Image
                    style = {styles.l1}
                    source = {require('./mynaui_letter-l-solid.png')}
                />
                <Image
                    style = {styles.l2}
                    source = {require('./mynaui_letter-l-solid.png')}
                />
              </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

function GrossMotor({navigation}) {
  return <Text> "This is a new page" </Text>;
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name = 'Home'
          component = {Homescreen}
        />
        <Stack.Screen name = "Gross Motor" component={GrossMotor}/>
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
  }
});
