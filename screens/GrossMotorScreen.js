import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/*Creating an array of circles*/
//new comment

//comment2

export default function GrossMotorScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Image source = {require('./Group_12.png')} />
      <ScrollView>
        <View style = {styles.grid}>
          <TouchableOpacity 
            activeOpacity = {0.6}>
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
