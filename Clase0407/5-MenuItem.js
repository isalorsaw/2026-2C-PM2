// src/componentes/MenuItem.js
import React from 'react';
import { View,TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MenuItem({ item, onPress }) {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={item.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Círculo decorativo de fondo */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        <Text style={styles.emoji}>{item.emoji}</Text>
        <Text style={styles.title}>{item.title}</Text>
        
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>→</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 8 },
      web: { boxShadow: '0 8px 24px rgba(0,0,0,0.3)' },
    }),
  },
  card: {
    padding: 18,
    height: 140,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  emoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  // Círculos decorativos de fondo (glassmorphism)
  decorCircle1: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    top: -20,
    right: -20,
  },
  decorCircle2: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    bottom: -10,
    left: -10,
  },
});