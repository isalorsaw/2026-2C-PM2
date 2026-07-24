import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  TouchableOpacity, 
  Modal, 
  TextInput 
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';

const API_URL = 'http://test.bonaquian.com/movil/core/gps/';

const MiLocalizacion = () => {
  // 🆕 Estados para la ubicación y los puntos de la BD
  const [location, setLocation] = useState(null);
  const [puntos, setPuntos] = useState([]);
  const [cargando, setCargando] = useState(false);
  
  // 🆕 Estados para el Modal de guardar nuevo punto
  const [modalVisible, setModalVisible] = useState(false);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState(null);
  const [nombrePunto, setNombrePunto] = useState('');
  const [descripcionPunto, setDescripcionPunto] = useState('');

  // 1. Obtener ubicación actual (Tu código original)
  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para mostrar el mapa.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation.coords);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación.');
    }
  };

  // 🆕 2. Cargar puntos desde la base de datos
  const cargarPuntos = async () => {
    setCargando(true);
    try {
      const response = await fetch(`${API_URL}get.php`);
      const data = await response.json();
      
      if (data && Array.isArray(data)) {
        setPuntos(data);
      } else {
        Alert.alert('Aviso', 'No se encontraron puntos guardados.');
      }
    } catch (error) {
      console.error('Error al cargar puntos:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  // 🆕 3. Guardar nuevo punto en la base de datos
  const guardarPunto = async () => {
    if (!puntoSeleccionado) return;

    setCargando(true);
    try {
      const formData = new FormData();
      formData.append('latitud', puntoSeleccionado.latitude.toString());
      formData.append('longitud', puntoSeleccionado.longitude.toString());
      formData.append('nombre', nombrePunto);
      formData.append('descripcion', descripcionPunto);

      const response = await fetch(`${API_URL}insert.php`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Éxito', 'Punto guardado correctamente');
        setModalVisible(false);
        setNombrePunto('');
        setDescripcionPunto('');
        cargarPuntos(); // Recargar el mapa con el nuevo punto
      } else {
        Alert.alert('Error', data.message || 'No se pudo guardar el punto');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', 'Error de conexión con el servidor');
    } finally {
      setCargando(false);
    }
  };

  // Cargar ubicación y puntos al iniciar
  useEffect(() => {
    const iniciar = async () => {
      await getLocation();
      // Pequeña pausa para asegurar que la ubicación se estableció antes de cargar
      setTimeout(() => {
        cargarPuntos();
      }, 500);
    };
    iniciar();
  }, []);

  // Si aún no tenemos la ubicación, mostrar carga
  if (!location) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={{ marginTop: 10 }}>Obteniendo tu ubicación...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Overlay de carga */}
      {cargando && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={{ marginTop: 10, color: '#0066cc' }}>Procesando...</Text>
        </View>
      )}

      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.015,   // 🆕 Zoom más cercano para ver mejor la ubicación
          longitudeDelta: 0.0121,
        }}
        showsUserLocation={true}       // 🆕 Muestra el punto azul de tu ubicación
        showsMyLocationButton={true}   // 🆕 Botón para volver a centrar en ti
        // 🆕 4. Detectar toque en el mapa para guardar nuevo punto
        onPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          setPuntoSeleccionado({ latitude, longitude });
          setModalVisible(true); // Abrir modal directamente
        }}
      >
        {/* Marcador de tu ubicación actual (opcional, ya que showsUserLocation=true lo hace) */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="📍 Tú estás aquí"
          pinColor="blue"
        />

        {/* 🆕 5. Renderizar los puntos traídos de la base de datos */}
        {puntos.map((punto, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: parseFloat(punto.latitud),
              longitude: parseFloat(punto.longitud),
            }}
            title={punto.nombre || 'Punto GPS'}
            description={punto.descripcion || ''}
            pinColor="red"
          />
        ))}
      </MapView>

      {/* 🆕 Botón flotante para recargar puntos manualmente */}
      <TouchableOpacity style={styles.reloadButton} onPress={cargarPuntos}>
        <Text style={styles.buttonText}>🔄 Recargar Puntos</Text>
      </TouchableOpacity>

      {/* 🆕 6. Modal para ingresar datos del nuevo punto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Guardar Nuevo Punto</Text>
            
            <Text style={styles.coordinatesText}>
              Latitud: {puntoSeleccionado?.latitude.toFixed(6)}
            </Text>
            <Text style={styles.coordinatesText}>
              Longitud: {puntoSeleccionado?.longitude.toFixed(6)}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre del punto (ej: Casa, Oficina)"
              value={nombrePunto}
              onChangeText={setNombrePunto}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción (opcional)"
              value={descripcionPunto}
              onChangeText={setDescripcionPunto}
              multiline
              numberOfLines={4}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setPuntoSeleccionado(null);
                }}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={guardarPunto}
              >
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// 🆕 Estilos organizados para que se vea profesional
const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  map: { flex: 1 },
  loadingOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 1000,
  },
  reloadButton: {
    position: 'absolute', bottom: 30, right: 20,
    backgroundColor: '#0066cc', paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 25, elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4,
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { backgroundColor: 'white', borderRadius: 15, padding: 25, width: '85%', elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#333' },
  coordinatesText: { fontSize: 14, color: '#666', marginBottom: 5, textAlign: 'center', fontFamily: 'monospace' },
  input: { borderWidth: 1, borderColor: '#DDD', borderRadius: 8, padding: 12, marginBottom: 15, fontSize: 16, backgroundColor: '#F9F9F9' },
  textArea: { height: 100, textAlignVertical: 'top' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  button: { flex: 1, padding: 14, borderRadius: 8, marginHorizontal: 5 },
  cancelButton: { backgroundColor: '#E0E0E0' },
  saveButton: { backgroundColor: '#0066cc' },
});

export default MiLocalizacion;