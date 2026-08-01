import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Button, Alert, Image, ActivityIndicator,
  StyleSheet, ScrollView, Platform // 👈 1. AGREGAR Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';

const API_LISTA  = 'http:///movil/core/get_usuarios.php';
const API_SAVE   = 'http:///movil/core/save_qr.php';

export default function GenerarQrScreen() {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [cargandoLista, setCargandoLista] = useState(true);
  const [cargandoQR, setCargandoQR] = useState(false);
  
  const [qrContent, setQrContent] = useState('');
  const [qrPreview, setQrPreview] = useState(null);
  
  const viewShotRef = useRef();

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const res = await fetch(API_LISTA);
      const data = await res.json();
      if (data.ok) {
        setUsuarios(data.usuarios);
      } else {
        Alert.alert('Error', data.msg);
      }
    } catch (e) {
      Alert.alert('Error de red', e.message);
    } finally {
      setCargandoLista(false);
    }
  };

  const getUsuarioActual = () => {
    return usuarios.find(u => u.usuario_id == usuarioSeleccionado);
  };

  const generarYGuardarQR = async () => {
    const usuario = getUsuarioActual();
    if (!usuario) {
      return Alert.alert('Selecciona un usuario');
    }

    setCargandoQR(true);
    setQrPreview(null);

    try {
      const claveTemp = Math.random().toString(36).slice(-8).toUpperCase();
      const expira = new Date(Date.now() + 30 * 60 * 1000).toISOString();

      const contenidoQR = JSON.stringify({
        user_id: usuario.usuario_id,
        user:    usuario.usuario_nombre,
        nombre:  usuario.usuario_nombrecomp,
        correo:  usuario.usuario_correo,
        clave:   claveTemp,
        exp:     expira
      });

      setQrContent(contenidoQR);

      // 👈 2. Aumentamos el tiempo a 500ms para asegurar que el QR se dibuje
      setTimeout(async () => {
        try {
          if (!viewShotRef.current) {
            throw new Error("El componente de captura aún no está listo.");
          }

          // 👈 3. CAMBIO CRÍTICO: Usar "tmpfile" en lugar de "data-uri"
          const uri = await viewShotRef.current.capture({
            format: "png",
            result: "tmpfile" 
          });
          
          setQrPreview(uri);

          const formData = new FormData();
          formData.append('usuario_id',       usuario.usuario_id.toString());
          formData.append('usuario_nombre',   usuario.usuario_nombre);
          formData.append('correo',           usuario.usuario_correo);
          formData.append('clave_temporal',   claveTemp);
          formData.append('expira',           expira);
          formData.append('contenido_qr',     contenidoQR);
          
          // 👈 4. Ajuste de URI para compatibilidad nativa (especialmente iOS)
          const fileUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;

          formData.append('qr_imagen', {
            uri: fileUri,
            name: `qr_${usuario.usuario_id}_${Date.now()}.png`,
            type: 'image/png'
          });

          const res = await fetch(API_SAVE, {
            method: 'POST',
            body: formData
          });
          
          // Validar que la respuesta sea JSON antes de parsear
          const textResponse = await res.text();
          let data;
          try {
            data = JSON.parse(textResponse);
          } catch (e) {
            throw new Error("El servidor no devolvió un JSON válido: " + textResponse);
          }

          if (data.ok) {
            Alert.alert('Éxito', `QR generado y guardado.\nRuta: ${data.ruta_qr}\nClave: ${claveTemp}`);
          } else {
            Alert.alert('Error del servidor', data.msg || 'Error desconocido');
          }
        } catch (error) {
          console.error("🔥 ERROR DETALLADO:", error); // Esto mostrará el error en la consola si vuelve a fallar
          Alert.alert('Error', error.message);
        } finally {
          setCargandoQR(false);
        }
      }, 500); 

    } catch (e) {
      console.error("🔥 ERROR GENERAL:", e);
      Alert.alert('Error', e.message);
      setCargandoQR(false);
    }
  };

  if (cargandoLista) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Cargando usuarios...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Generar QR para Usuario</Text>

      <Text style={styles.label}>Selecciona un usuario:</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={usuarioSeleccionado}
          onValueChange={(itemValue) => setUsuarioSeleccionado(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="-- Selecciona --" value="" />
          {usuarios.map((u) => (
            <Picker.Item
              key={u.usuario_id}
              label={`${u.usuario_id} - ${u.usuario_nombre} (${u.usuario_nombrecomp})`}
              value={u.usuario_id.toString()}
            />
          ))}
        </Picker>
      </View>

      {usuarioSeleccionado && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}><Text style={styles.bold}>ID:</Text> {getUsuarioActual().usuario_id}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Usuario:</Text> {getUsuarioActual().usuario_nombre}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Nombre:</Text> {getUsuarioActual().usuario_nombrecomp}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Correo:</Text> {getUsuarioActual().usuario_correo}</Text>
        </View>
      )}

      <Button
        title={cargandoQR ? 'Generando...' : 'Generar y Guardar QR'}
        onPress={generarYGuardarQR}
        disabled={cargandoQR || !usuarioSeleccionado}
      />

      {cargandoQR && <ActivityIndicator style={{ marginTop: 20 }} />}

      {qrContent !== '' && (
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          
          {/* 👈 5. CAMBIO CRÍTICO: result: 'tmpfile' aquí también */}
          <ViewShot ref={viewShotRef} options={{ format: 'png', result: 'tmpfile' }}>
            <QRCode
              value={qrContent}
              size={250}
              color="#000000"
              backgroundColor="#ffffff"
            />
          </ViewShot>

          {qrPreview && (
            <>
              <Text style={[styles.bold, { marginTop: 20 }]}>Vista previa final:</Text>
              <Image source={{ uri: qrPreview }} style={styles.qrImage} />
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, marginBottom: 5, fontWeight: '600' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 15, backgroundColor: '#fff' },
  picker: { height: 50 },
  infoBox: { backgroundColor: '#f5f5f5', padding: 10, borderRadius: 8, marginBottom: 20 },
  infoText: { fontSize: 14, marginBottom: 3 },
  bold: { fontWeight: 'bold' },
  qrImage: { width: 250, height: 250, marginTop: 10, borderWidth: 1, borderColor: '#ddd' }
});