import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  StyleSheet, Dimensions, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

const API_VALIDATE = 'http:///movil/api/auth/login_qr.php';

export default function LoginQRScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState(null);
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1. Manejar el escaneo del QR
  const handleBarCodeScanned = ({ type, data }) => {
    if (!scannedData) {
      setScannedData(data); // Esto pausa el escaneo y muestra el campo de PIN
    }
  };

  // 2. Función para validar en el servidor
  const handleLogin = async () => {
    if (pin.length < 4) {
      return Alert.alert('Error', 'El PIN debe tener al menos 4 dígitos');
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('qr_data', scannedData);
      formData.append('pin', pin);

      const res = await fetch(API_VALIDATE, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.ok) {
        Alert.alert('¡Bienvenido!', `Hola ${data.usuario.nombrecomp}`);
        navigation.replace('Home2', { user: data.usuario });
      } else {
        Alert.alert('Acceso Denegado', data.msg);
        setPin(''); // Limpiar PIN para reintentar
      }
    } catch (error) {
      Alert.alert('Error de red', 'No se pudo conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Reiniciar el escaneo
  const resetScanner = () => {
    setScannedData(null);
    setPin('');
  };

  // 4. Pantalla de solicitud de permisos
  if (!permission) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Necesitamos tu permiso para usar la cámara</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Conceder Permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { width } = Dimensions.get('window');
  const BOX_SIZE = width * 0.7;

  return (
    <View style={styles.container}>
      {/* Cámara de fondo */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={scannedData ? undefined : handleBarCodeScanned}
      />

      {/* Overlay oscuro con marco de escaneo */}
      {!scannedData && (
        <View style={styles.overlay}>
          <View style={styles.unfocusedBox} />
          <View style={styles.scanBox}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>
          <View style={styles.unfocusedBox} />
          <Text style={styles.instructionText}>Encuadra el código QR dentro del marco</Text>
        </View>
      )}

      {/* Panel de ingreso de PIN (aparece después de escanear) */}
      {scannedData && (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.pinPanel}
        >
          <View style={styles.pinCard}>
            <Text style={styles.pinTitle}>✅ QR Escaneado</Text>
            <Text style={styles.pinSubtitle}>Ingresa tu PIN de 6 dígitos para continuar</Text>

            <TextInput
              style={styles.pinInput}
              placeholder="Ej: 123456"
              keyboardType="numeric"
              maxLength={6}
              value={pin}
              onChangeText={setPin}
              secureTextEntry
            />

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>INGRESAR AL SISTEMA</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={resetScanner} style={styles.retryButton}>
              <Text style={styles.retryText}>Escanear otro código</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  text: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  
  overlay: {
    flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center',
  },
  unfocusedBox: { flex: 1, width: '100%' },
  scanBox: { width: Dimensions.get('window').width * 0.7, height: Dimensions.get('window').width * 0.7, justifyContent: 'center', alignItems: 'center' },
  
  // Esquinas del marco
  cornerTopLeft: { position: 'absolute', top: 0, left: 0, width: 30, height: 30, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#667eea' },
  cornerTopRight: { position: 'absolute', top: 0, right: 0, width: 30, height: 30, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#667eea' },
  cornerBottomLeft: { position: 'absolute', bottom: 0, left: 0, width: 30, height: 30, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#667eea' },
  cornerBottomRight: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#667eea' },
  
  instructionText: { color: '#fff', fontSize: 16, marginTop: 30, textAlign: 'center', fontWeight: '600' },

  pinPanel: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)', padding: 20, paddingBottom: 40,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
  },
  pinCard: { backgroundColor: '#fff', padding: 25, borderRadius: 15, alignItems: 'center' },
  pinTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  pinSubtitle: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },
  pinInput: {
    width: '100%', height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    fontSize: 24, textAlign: 'center', letterSpacing: 8, marginBottom: 20, backgroundColor: '#f9f9f9',
  },
  button: {
    width: '100%', height: 50, backgroundColor: '#667eea', justifyContent: 'center',
    alignItems: 'center', borderRadius: 8, marginBottom: 15,
  },
  buttonDisabled: { backgroundColor: '#a0a8e0' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  retryButton: { padding: 10 },
  retryText: { color: '#667eea', fontSize: 14, fontWeight: '600' },
});