import { useNavigation } from '@react-navigation/native';
import { View, StyleSheet, Text, TextInput, Button, Dimensions} from 'react-native';
import React, { useState, useEffect } from 'react';
import BottomNavBar from './NavigationOptions.js';
import { GetActivities, SaveActivities } from '../NotesSaver.js';
import {createPDF} from '../PDFSaver.js';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export default function NotesModal() {

    const navigation = useNavigation();
    const [text, onChangeText] = useState('');
    
    useEffect(() => {
        (async () => {
            const saved = await GetActivities();
            onChangeText(saved || "");
        })();
    }, [onChangeText]);

    useEffect(() => {
    navigation.setOptions({
        headerRight: () => (
        <View style={styles.saveButton}>
            <Button onPress={() => { SaveActivities(text) }} title="Save" > </Button>
            <Button onPress={() => { createPDF(text) } } title="Create PDF"> </Button>
        </View>
        ),
    });
    }, [navigation, text])

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', }}>
            <TextInput
                multiline                     // Allow multiple lines
                style={styles.textBox}
                value={text}  // Controlled value
                onChangeText={onChangeText}
            />
        </View>
    );
}

//TODO: Find better way of doing the CSS.
const styles = StyleSheet.create({
    container: {
        
    },
    textBox: {
        flex: 1,
        width: windowWidth-20,
        height : windowHeight-200,
    },
    saveButton: {
        flexDirection: 'row',
        gap: 20,
        padding:20,
    },
});