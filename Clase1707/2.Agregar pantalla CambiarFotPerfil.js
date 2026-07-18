// screens/UserProfile.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PhotoCapture from '../componentes/CapturaImagen';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserProfile = () => {
  const [recordId, setRecordId] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id'); 
      console.log('ID de usuario cargado desde AsyncStorage:', userId);
      setRecordId(userId);
    }
    catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
  };


  const handlePhotoSaved = (imageUrl) => {
    console.log('Foto guardada en:', imageUrl);
    // Actualizar UI o estado local
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil de Usuario</Text>
      
      <PhotoCapture
        tableName="tbl_usuario_img"
        fieldID="usuario_id"
        fieldRuta="usuario_img_ruta"
        recordId={recordId}
        onPhotoSaved={handlePhotoSaved}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default UserProfile;