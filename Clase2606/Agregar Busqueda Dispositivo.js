/*Paso 1: Instalar dependencia Datepicker 
npm install @react-native-community/datetimepicker*/

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Button,
  ActivityIndicator,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Datos de ejemplo (en producción vendrían de tu API/Base de datos)
const dispositivosData = [
  {
    dispo_unique_id: 'DEV001',
    dispo_nombre_equipo: 'Laptop Juan',
    dispo_marca: 'Dell',
    dispo_modelo: 'Inspiron 15',
    dispo_so: 'Windows',
    dispo_so_version: '11',
    dispo_dir_mac: '00:1B:44:11:3A:B7',
    dispo_fregistro: '2024-01-15T10:30:00',
    dispo_factual: '2024-06-25T14:20:00',
  },
  {
    dispo_unique_id: 'DEV002',
    dispo_nombre_equipo: 'iPhone Maria',
    dispo_marca: 'Apple',
    dispo_modelo: 'iPhone 13',
    dispo_so: 'iOS',
    dispo_so_version: '17.0',
    dispo_dir_mac: 'A4:5E:60:C8:2F:1D',
    dispo_fregistro: '2024-02-20T09:15:00',
    dispo_factual: '2024-06-26T08:45:00',
  },
  {
    dispo_unique_id: 'DEV003',
    dispo_nombre_equipo: 'Samsung Galaxy',
    dispo_marca: 'Samsung',
    dispo_modelo: 'S23',
    dispo_so: 'Android',
    dispo_so_version: '14',
    dispo_dir_mac: 'B8:27:EB:A3:C4:5F',
    dispo_fregistro: '2024-03-10T16:00:00',
    dispo_factual: '2024-06-24T19:30:00',
  },
  // Agrega más dispositivos según necesites
];

const DispositivosScreen = () => {
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFin, setShowPickerFin] = useState(false);
  const [dispositivosFiltrados, setDispositivosFiltrados] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filtrar dispositivos cuando cambian las fechas
  useEffect(() => {
    filtrarDispositivos();
  }, [fechaInicio, fechaFin]);

  const filtrarDispositivos = () => {
    setLoading(true);
    
    const inicio = new Date(fechaInicio);
    inicio.setHours(0, 0, 0, 0);
    
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);

    const filtrados = dispositivosData.filter((dispositivo) => {
      const fechaRegistro = new Date(dispositivo.dispo_fregistro);
      const fechaActual = new Date(dispositivo.dispo_factual);
      
      // Verificar si alguna de las dos fechas está dentro del rango
      const dentroRangoRegistro = fechaRegistro >= inicio && fechaRegistro <= fin;
      const dentroRangoActual = fechaActual >= inicio && fechaActual <= fin;
      
      return dentroRangoRegistro || dentroRangoActual;
    });

    setDispositivosFiltrados(filtrados);
    setLoading(false);
  };

  const onChangeFechaInicio = (event, selectedDate) => {
    setShowPickerInicio(Platform.OS === 'ios');
    if (selectedDate) {
      setFechaInicio(selectedDate);
    }
  };

  const onChangeFechaFin = (event, selectedDate) => {
    setShowPickerFin(Platform.OS === 'ios');
    if (selectedDate) {
      setFechaFin(selectedDate);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.deviceCard}>
      <View style={styles.deviceHeader}>
        <Text style={styles.deviceId}>{item.dispo_unique_id}</Text>
        <Text style={styles.deviceName}>{item.dispo_nombre_equipo}</Text>
      </View>
      
      <View style={styles.deviceInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Marca:</Text>
          <Text style={styles.infoValue}>{item.dispo_marca}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Modelo:</Text>
          <Text style={styles.infoValue}>{item.dispo_modelo}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Sistema Operativo:</Text>
          <Text style={styles.infoValue}>
            {item.dispo_so} {item.dispo_so_version}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>MAC:</Text>
          <Text style={styles.infoValue}>{item.dispo_dir_mac}</Text>
        </View>
      </View>

      <View style={styles.datesContainer}>
        <View style={styles.dateBox}>
          <Text style={styles.dateLabel}>📅 Registro:</Text>
          <Text style={styles.dateValue}>{formatDate(item.dispo_fregistro)}</Text>
        </View>
        <View style={styles.dateBox}>
          <Text style={styles.dateLabel}>🔄 Último Acceso:</Text>
          <Text style={styles.dateValue}>{formatDate(item.dispo_factual)}</Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No se encontraron dispositivos</Text>
      <Text style={styles.emptySubtext}>
        en el rango de fechas seleccionado
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header con Date Pickers */}
      <View style={styles.header}>
        <Text style={styles.title}>Dispositivos</Text>
        
        <View style={styles.datePickersContainer}>
          {/* Date Picker Inicio */}
          <View style={styles.datePickerWrapper}>
            <Text style={styles.datePickerLabel}>Fecha Inicio:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowPickerInicio(true)}
            >
              <Text style={styles.dateButtonText}>
                {fechaInicio.toLocaleDateString('es-ES')}
              </Text>
            </TouchableOpacity>
            {showPickerInicio && (
              <DateTimePicker
                value={fechaInicio}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChangeFechaInicio}
              />
            )}
          </View>

          {/* Date Picker Fin */}
          <View style={styles.datePickerWrapper}>
            <Text style={styles.datePickerLabel}>Fecha Fin:</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowPickerFin(true)}
            >
              <Text style={styles.dateButtonText}>
                {fechaFin.toLocaleDateString('es-ES')}
              </Text>
            </TouchableOpacity>
            {showPickerFin && (
              <DateTimePicker
                value={fechaFin}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onChangeFechaFin}
              />
            )}
          </View>
        </View>

        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {dispositivosFiltrados.length} dispositivo(s) encontrado(s)
          </Text>
        </View>
      </View>

      {/* Lista de Dispositivos */}
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={dispositivosFiltrados}
          renderItem={renderItem}
          keyExtractor={(item) => item.dispo_unique_id}
          ListEmptyComponent={renderEmptyList}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
          refreshing={loading}
          onRefresh={filtrarDispositivos}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  datePickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  datePickerWrapper: {
    flex: 1,
    marginHorizontal: 4,
  },
  datePickerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  dateButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  dateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  resultsInfo: {
    alignItems: 'center',
    marginTop: 8,
  },
  resultsText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  deviceId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  deviceInfo: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    width: 130,
  },
  infoValue: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  datesContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
  },
  dateBox: {
    marginBottom: 6,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DispositivosScreen;