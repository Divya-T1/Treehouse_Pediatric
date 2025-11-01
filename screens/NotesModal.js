import { useNavigation } from '@react-navigation/native';
import { View, StyleSheet, Text, TextInput, Button} from 'react-native';
import React, { useState, useEffect } from 'react';

export default function notesModal() {
  const navigation = useNavigation();
  const [text, onChangeText] = useState('This should be previous text');

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <TextInput
            multiline                     // Allow multiple lines
            style={styles.textBox}
            value={text}  // Controlled value
            onChangeText={onChangeText}
        />
      <Button onPress={() => navigation.goBack()}>Dismiss</Button>
    </View>
  );
}

const styles = StyleSheet.create({
    textBox: {
    }
});