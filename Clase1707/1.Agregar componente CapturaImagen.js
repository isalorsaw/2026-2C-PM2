// components/PhotoCapture.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const API_URL = 'http://test.bonaquian.com/movil/core/uploadphoto.php';

const PhotoCapture = ({ tableName, fieldID, fieldRuta, recordId, onPhotoSaved }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Abrir cámara
  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  // Abrir galería
  const openGallery = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      setSelectedImage(result.assets[0]);
    }
  };

  const showOptions = () => {
    Alert.alert(
      'Seleccionar foto',
      '¿Cómo deseas agregar la foto?',
      [
        { text: 'Cámara', onPress: openCamera },
        { text: 'Galería', onPress: openGallery },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  // 🔧 FUNCIÓN AUXILIAR: Normalizar URI para Android/iOS
  const normalizeUri = (uri) => {
    // En Android, Expo a veces no incluye el prefijo file://
    if (Platform.OS === 'android' && !uri.startsWith('file://')) {
      return 'file://' + uri;
    }
    return uri;
  };

  const savePhoto = async () => {
    if (!selectedImage) {
      Alert.alert('Error', 'Por favor selecciona una foto primero');
      return;
    }

    setLoading(true);

    // 🔧 Normalizar URI
    const imageUri = normalizeUri(selectedImage.uri);

    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: selectedImage.mimeType || 'image/jpeg',  // ← usar mimeType en Expo
      name: selectedImage.fileName || `photo_${Date.now()}.jpg`,
    });
    formData.append('tableName', tableName);
    formData.append('fieldID', fieldID);
    formData.append('fieldRuta', fieldRuta);
    formData.append('recordId', recordId.toString());

    try {
      // 🔥 IMPORTANTE: NO poner Content-Type manualmente
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,  // ← Solo body, sin headers de Content-Type
      });

      // Leer respuesta como texto primero para debug
      const responseText = await response.text();
      console.log('Respuesta cruda del servidor:', responseText);
      console.log('Status:', response.status);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('No se pudo parsear JSON:', responseText);
        Alert.alert('Error', 'El servidor no devolvió una respuesta JSON válida');
        return;
      }

      if (data.success) {
        Alert.alert('Éxito', data.message || 'Foto guardada correctamente');
        if (onPhotoSaved) {
          onPhotoSaved(data.imageUrl);
        }
        setSelectedImage(null);
      } else {
        Alert.alert('Error', data.message || 'Error al guardar la foto');
      }
    } catch (error) {
      console.error('Error al subir foto:', error);
      Alert.alert('Error', 'Error de conexión con el servidor: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelSelection = () => {
    setSelectedImage(null);
  };

  return (
    <View style={styles.container}>
      {!selectedImage ? (
        <TouchableOpacity style={styles.selectButton} onPress={showOptions}>
          <Text style={styles.selectButtonText}>Seleccionar Foto</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.previewContainer}>
          <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={savePhoto} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cancelButton} onPress={cancelSelection}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 20 },
  selectButton: {
    backgroundColor: '#007AFF', padding: 15, borderRadius: 10,
    width: '100%', alignItems: 'center',
  },
  selectButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  previewContainer: { width: '100%', alignItems: 'center' },
  previewImage: { width: 300, height: 300, borderRadius: 10, marginBottom: 20 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  saveButton: {
    backgroundColor: '#34C759', padding: 15, borderRadius: 10,
    flex: 1, marginRight: 10, alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cancelButton: {
    backgroundColor: '#FF3B30', padding: 15, borderRadius: 10,
    flex: 1, marginLeft: 10, alignItems: 'center',
  },
  cancelButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default PhotoCapture;