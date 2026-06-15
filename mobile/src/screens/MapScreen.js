import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MapView, { UrlTile, Marker, Circle } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfirmTripSheet from '../components/ConfirmTripSheet';
import { calculateCredits } from '../utils/credits';
import { haversineDistanceKm } from '../utils/location';
import { deductCredits } from '../utils/storage';
import { colors } from '../theme';

export default function MapScreen({ navigation, route }) {
  const { source, scannedQr, transportMode } = route.params;
  const [destination, setDestination] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const region = useMemo(() => {
    if (destination) {
      const lat = (source.lat + destination.lat) / 2;
      const lng = (source.lng + destination.lng) / 2;
      const latDelta = Math.abs(source.lat - destination.lat) * 1.8 + 0.01;
      const lngDelta = Math.abs(source.lng - destination.lng) * 1.8 + 0.01;
      return { latitude: lat, longitude: lng, latitudeDelta: latDelta, longitudeDelta: lngDelta };
    }
    return {
      latitude: source.lat,
      longitude: source.lng,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
  }, [source, destination]);

  const distanceKm = destination ? haversineDistanceKm(source, destination) : 0;
  const credits = destination ? calculateCredits(distanceKm) : 0;

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setDestination({ lat: latitude, lng: longitude });
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    if (!destination || confirming) return;
    setConfirming(true);

    const creditsDeducted = calculateCredits(distanceKm);
    const remainingBalance = await deductCredits(creditsDeducted, {
      source,
      destination,
      distanceKm,
      transportMode,
      scannedQr,
    });

    setShowConfirm(false);
    navigation.replace('Receipt', {
      receipt: {
        source,
        destination,
        distanceKm,
        transportMode,
        creditsDeducted,
        remainingBalance,
      },
    });
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        mapType="none"
        initialRegion={region}
        region={destination ? region : undefined}
        onPress={handleMapPress}
        onLongPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />
        <Marker
          coordinate={{ latitude: source.lat, longitude: source.lng }}
          title="Source (A)"
          pinColor={colors.primary}
        />
        {destination && (
          <Marker
            coordinate={{ latitude: destination.lat, longitude: destination.lng }}
            title="Destination (B)"
            pinColor="#dc2626"
          />
        )}
        <Circle
          center={{ latitude: source.lat, longitude: source.lng }}
          radius={source.accuracy || 40}
          fillColor="rgba(15,118,110,0.12)"
          strokeColor={colors.primary}
        />
      </MapView>

      <SafeAreaView style={styles.header} edges={['top']}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Select Destination</Text>
          <Text style={styles.headerSub}>Tap or long-press on the map to set point B</Text>
        </View>
      </SafeAreaView>

      <ConfirmTripSheet
        visible={showConfirm && !!destination}
        distanceKm={distanceKm}
        credits={credits}
        transportMode={transportMode}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    marginBottom: 8,
  },
  backBtnText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  headerText: {},
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
});
