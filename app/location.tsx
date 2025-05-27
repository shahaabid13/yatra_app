import React, { useEffect, useState } from "react";
import { Alert, Button, StyleSheet, Text, View, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { app } from "../config/firebaseConfig"; // Your firebase app config

type Props = {
  regNumber: string;
};

export default function LocationSender({ regNumber }: Props) {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const db = getFirestore(app);

  const sendLocation = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied.");
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      // Save to Firebase Firestore
      await setDoc(doc(db, "locations", regNumber), {
        regNumber,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        timestamp: new Date().toISOString(),
      });

      console.log("📍 Location sent and saved:", loc.coords);
      router.replace("/"); // Navigate to home/index page
    } catch (err) {
      setErrorMsg(err?.message || "Failed to get location.");

      console.error("Error getting location:", err);
      setErrorMsg(err.message || "Failed to get location.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    sendLocation();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Getting your location...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>❌ {errorMsg}</Text>
        <Button title="Retry" onPress={sendLocation} />
        <Button title="Back" onPress={() => router.back()} />
      </View>
    );
  }

  if (location) {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="Your Location"
          />
        </MapView>
        <Button title="Continue" onPress={() => router.replace("/")} />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  map: {
    flex: 1,
  },
  errorText: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});
