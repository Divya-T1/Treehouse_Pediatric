import { useNavigation } from '@react-navigation/native';
import { View, StyleSheet, Text, TextInput, Button, Dimensions, TouchableOpacity} from 'react-native';
import React, { useState, useEffect } from 'react';
import BottomNavBar from './NavigationOptions.js';
import { GetActivities, SaveActivities } from '../NotesSaver.js';
import { clearData } from '../ActivitiesSaver.js';
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
        <View style={styles.saveButtonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={() => { SaveActivities(text) }}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={() => { createPDF(text) } } >
                <Text style={styles.saveButtonText}>Create PDF</Text>
            </TouchableOpacity>
        </View>
        ),
    });
    }, [navigation, text]);

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
        width: '90%',
        height: '90%',
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
    },
    saveButtonContainer: {
        flexDirection: 'row',
        gap: 20,
        padding:20,
    },
    saveButton: {
        backgroundColor: 'transparent', // transparent background
        borderWidth: 1,
        padding: 5,
        borderColor: '#333', // optional border
    },
    saveButtonText: {
        color: '#333', // custom text color
        textTransform: 'none', // keep lowercase
        fontSize: 16,
    }
});