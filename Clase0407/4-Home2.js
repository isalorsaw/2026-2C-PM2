// src/pantallas/Home2.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, StatusBar, Platform,
  ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import MenuItem from '../componentes/MenuItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URLS } from '../config/config';

const CONFIG_MODULOS = {
  'DISPOSITIVOS': { emoji: '📱', gradient: ['#667eea', '#764ba2'], screen: 'DispoBus' },
  'USUARIOS':     { emoji: '👥', gradient: ['#f093fb', '#f5576c'], screen: 'Usuarios' },
  'REPORTES':     { emoji: '📊', gradient: ['#4facfe', '#00f2fe'], screen: 'Reportes' },
  'BITACORA':     { emoji: '📋', gradient: ['#43e97b', '#38f9d7'], screen: 'Bitacora' },
  'MAPIIP':       { emoji: '🌍', gradient: ['#fa709a', '#fee140'], screen: 'MapaIP' },
  'CONFIG':       { emoji: '⚙️', gradient: ['#30cfd0', '#330867'], screen: 'Config' },
};

export default function Home2() {
  const navigation = useNavigation();
  const [perfil, setPerfil] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cargandoMenu, setCargandoMenu] = useState(true);

  useEffect(() => {
    cargarPerfil();
    cargarMenuDinamico();
  }, []);

  // ============================================
  // 1️⃣ CARGAR PERFIL
  // ============================================
  const cargarPerfil = async () => {
    try {
      const nombreRaw = await AsyncStorage.getItem('user_nombre');
      const rolRaw = await AsyncStorage.getItem('user_session');
      const correoRaw = await AsyncStorage.getItem('user_correo');

      const perfil = {
        nombre: nombreRaw,
        rol: rolRaw,
        email: correoRaw,
        avatar: 'https://i.pravatar.cc/150?img=12',
      };

      console.log('Perfil cargado:', perfil);
      setPerfil(perfil);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      setPerfil({
        nombre: 'Usuario',
        rol: 'Invitado',
        email: '',
        avatar: 'https://i.pravatar.cc/150?img=12',
      });
    }
  };

  // ============================================
  // 2️⃣ 🆕 CARGAR MENÚ DINÁMICO (CON FOR TRADICIONAL)
  // ============================================
  const cargarMenuDinamico = async () => {
    try {
      // 🔑 Paso 1: Obtener el usuario_id guardado en el Login
      const usuarioId = await AsyncStorage.getItem('user_id');

      if (!usuarioId) {
        console.warn('⚠️ No hay usuario_id en AsyncStorage');
        setCargandoMenu(false);
        return;
      }

      // 🌐 Paso 2: Llamar al endpoint PHP
      const response = await fetch(API_URLS.MENU, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ usuario_id: parseInt(usuarioId) }),
      });

      const data = await response.json();
      console.log('📦 Respuesta de la API:', data);

      // ✅ Paso 3: Si la respuesta es exitosa, procesar los módulos
      if (data.status === 'success' && data.data) {
        
        // 🔄 Paso 4: Crear un arreglo vacío donde vamos a guardar los items
        const items = [];

        // 🔁 Paso 5: Recorrer CADA módulo que vino de la API
        for (let i = 0; i < data.data.length; i++) {
          // Obtener el módulo actual (como un "for each" en Java)
          const modulo = data.data[i];

          // Obtener el código en mayúsculas para buscar en CONFIG_MODULOS
          const codigo = modulo.modulo_codigo.toUpperCase();

          // Buscar la configuración visual (emoji, colores) para este módulo
          const config = CONFIG_MODULOS[0];

          // Si no existe configuración para este módulo, lo saltamos
          /*if (!config) {
            console.warn(`⚠️ Módulo "${codigo}" no tiene configuración visual`);
            continue; // ← Esto es como "continue" en Java: salta a la siguiente iteración
          }*/
         const emoji='⚙️';
         const gradient=['#30cfd0', '#330867'];

          // Crear el objeto del menú con todos los datos que necesita MenuItem
          const item = {
            id: modulo.modulo_codigo,
            title: modulo.modulo_nombre,
            screen: modulo.modulo_screen,
            emoji: emoji,
            gradient: gradient,
          };

          // Agregar el item al arreglo (como "list.add(item)" en Java)
          items.push(item);

          // 👀 Log para ver qué está pasando (puedes quitarlo después)
          console.log(`✅ Item ${i + 1} agregado:`, item);
        }

        // 📦 Paso 6: Guardar el arreglo final en el estado
        console.log('🎉 Total de items en el menú:', items.length);
        setMenuItems(items);
      } else {
        console.warn('La API no devolvió módulos:', data.message);
      }
    } catch (error) {
      console.error('❌ Error al cargar el menú:', error);
      Alert.alert('Error', 'No se pudieron cargar los accesos del menú');
    } finally {
      setCargandoMenu(false);
    }
  };

  // Agrupar en filas de 2 (para el grid)
  const filas = [];
  for (let i = 0; i < menuItems.length; i += 2) {
    filas.push(menuItems.slice(i, i + 2));
  }

  // ============================================
  // CERRAR SESIÓN
  // ============================================
  const cerrarSesion = () => {
    if (Platform.OS === 'web') {
      const confirmar = window.confirm('¿Estás seguro que deseas salir?');
      if (confirmar) {
        ejecutarLogout();
      }
      return;
    }

    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, salir',
          style: 'destructive',
          onPress: () => ejecutarLogout(),
        },
      ],
      { cancelable: true }
    );
  };

  const ejecutarLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'usuario', 'sesionActiva']);

      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      if (Platform.OS === 'web') {
        window.alert('No se pudo cerrar la sesión correctamente');
      } else {
        Alert.alert('Error', 'No se pudo cerrar la sesión correctamente');
      }
    }
  };

  // ✅ Si aún no carga el perfil, mostrar loading
  if (!perfil) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1a" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 🔵 HEADER CON PERFIL */}
        <LinearGradient
          colors={['#5353d8', '#7575db']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.topRow}>
            <View>
              <Text style={styles.saludo}>¡Hola de nuevo! 👋</Text>
              <Text style={styles.fecha}>
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </Text>
            </View>
            <TouchableOpacity style={styles.notifBtn}>
              <Text style={styles.notifIcon}>🔔</Text>
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: perfil.avatar }}
                style={styles.avatar}
              />
              <View style={styles.onlineIndicator} />
            </View>

            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{perfil.nombre}</Text>
              <Text style={styles.userRol}>{perfil.rol}</Text>
              <Text style={styles.userEmail}>{perfil.email}</Text>
            </View>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate('Perfil')}
            >
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* 🔵 SECCIÓN DE MENÚ */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
          <Text style={styles.sectionSubtitle}>Gestiona tu sistema</Text>

          {/* Grid de tarjetas */}
          {filas.map((fila, indexFila) => (
            <View key={indexFila} style={styles.menuRow}>
              {fila.map((item) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  onPress={() => navigation.navigate(item.screen)}
                />
              ))}
            </View>
          ))}

          {/* 🚪 BOTÓN CERRAR SESIÓN */}
          <TouchableOpacity
            style={styles.logoutCard}
            onPress={cerrarSesion}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#ff416c', '#ff4b2b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoutCardGradient}
            >
              <View style={styles.logoutDecorCircle1} />
              <View style={styles.logoutDecorCircle2} />

              <View style={styles.logoutContent}>
                <Text style={styles.logoutEmoji}>🚪</Text>
                <View style={styles.logoutTextContainer}>
                  <Text style={styles.logoutTitle}>Cerrar Sesión</Text>
                  <Text style={styles.logoutSubtitle}>Salir de tu cuenta</Text>
                </View>
                <View style={styles.logoutArrow}>
                  <Text style={styles.arrow}>→</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  saludo: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  fecha: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(89, 78, 187, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifIcon: {
    fontSize: 20,
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#ff416c',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notifBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(75, 48, 233, 0.73)',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(156, 209, 95, 0.69)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#fff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#43e97b',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  userRol: {
    fontSize: 13,
    color: '#ffd700',
    marginTop: 2,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(194, 221, 194, 0.86)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(66, 108, 224, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 14,
  },
  logoutCard: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#ff416c', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 8 },
      web: { boxShadow: '0 8px 24px rgba(255, 65, 108, 0.3)' },
    }),
  },
  logoutCardGradient: {
    padding: 20,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  logoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutEmoji: { fontSize: 32, marginRight: 16 },
  logoutTextContainer: { flex: 1 },
  logoutTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  logoutSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  logoutArrow: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(90, 86, 24, 0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  arrow: { color: '#fff', fontSize: 16, fontWeight: '700' },
  logoutDecorCircle1: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)', top: -30, right: -30,
  },
  logoutDecorCircle2: {
    position: 'absolute', width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.08)', bottom: -20, left: -20,
  },
});