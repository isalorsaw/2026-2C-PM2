import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { getDistance } from 'geolib';

const GPSDistancia = () => {
  // Define the two coordinates
  const coordinate1 = { latitude: 37.78825, longitude: -122.4324 }; // San Francisco
  const coordinate2 = { latitude: 34.0522, longitude: -118.2437 }; // Los Angeles

  // Calculate the distance between the two coordinates using geolib
  const distanceInMeters = getDistance(
    { latitude: coordinate1.latitude, longitude: coordinate1.longitude },
    { latitude: coordinate2.latitude, longitude: coordinate2.longitude }
  );

  // Convert distance to kilometers
  const distanceInKm = (distanceInMeters / 1000).toFixed(2);

  return (
    <View style={styles.container}>
      {/* MapView Component */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: (coordinate1.latitude + coordinate2.latitude) / 2,
          longitude: (coordinate1.longitude + coordinate2.longitude) / 2,
          latitudeDelta: 5, // Zoom level
          longitudeDelta: 5,
        }}
      >
        {/* Markers for the two coordinates */}
        <Marker coordinate={coordinate1} title="Point A" />
        <Marker coordinate={coordinate2} title="Point B" />

        {/* Polyline to connect the two points */}
        <Polyline
          coordinates={[coordinate1, coordinate2]}
          strokeColor="#FF0000" // Red line
          strokeWidth={3}
        />
      </MapView>

      {/* Display the calculated distance */}
      <View style={styles.distanceContainer}>
        <Text style={styles.distanceText}>
          Distance: {distanceInKm} km
        </Text>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  distanceContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 5,
  },
  distanceText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GPSDistancia;