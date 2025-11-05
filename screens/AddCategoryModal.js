import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function AddCategoryModal({ visible, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [pickedImage, setPickedImage] = useState(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) setPickedImage(result.assets[0].uri);
  };

  const handleCreate = () => {
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      image: pickedImage ? { uri: pickedImage } : require('../assets/default.png'),
      items: [],
    });

    setName('');
    setPickedImage(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Add New Category</Text>
          <TextInput
            placeholder="Category Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <TouchableOpacity style={styles.modalBtn} onPress={pickImage}>
            <Text style={styles.modalBtnText}>Choose Icon</Text>
          </TouchableOpacity>

          {pickedImage && (
            <Image
              source={{ uri: pickedImage }}
              style={{ width: 80, height: 80, marginTop: 10, resizeMode: 'contain' }}
            />
          )}

          <View style={styles.buttons}>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: '#999' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCreate}>
              <Text style={{ color: 'green', fontWeight: 'bold' }}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  box: { backgroundColor: '#fff', padding: 20, borderRadius: 10, width: '80%' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 10 },
  modalBtn: { backgroundColor: 'rgba(108, 126, 107, 1)', padding: 10, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
  modalBtnText: { color: 'white', fontWeight: 'bold' },
  buttons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});
