import * as Location from "expo-location";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";

const BACKEND_URL = "https://your-backend.com/api/location"; // ✅ Replace with actual endpoint

type Props = {
  regNumber: string;
};

export default function LocationSender({ regNumber }: Props) {
  const [statusMessage, setStatusMessage] = useState("Requesting location...");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const sendLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied", "Location access is required.");
          setStatusMessage("Permission denied");
          setLoading(false);
          return;
        }

        setStatusMessage("Fetching your current location...");
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        setStatusMessage("Sending location to server...");

        const response = await fetch(BACKEND_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ regNumber, latitude, longitude }),
        });

        if (!response.ok) throw new Error("Failed to send location");

        setStatusMessage("✅ Location sent successfully!");
        console.log("📍 Location sent:", { regNumber, latitude, longitude });

        // Navigate to index/home after a short delay
        setTimeout(() => {
          router.replace("/");
        }, 1500);
      } catch (error) {
        console.error("Location send failed:", error);
        Alert.alert("Error", "Failed to get or send location.");
        setStatusMessage("Error sending location");
      } finally {
        setLoading(false);
      }
    };

    sendLocation();
  }, []);

  return (
    <View style={styles.container}>
      {loading && <ActivityIndicator size="large" color="#003366" />}
      <Text style={styles.message}>{statusMessage}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4f8",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  message: {
    marginTop: 20,
    fontSize: 16,
    color: "#003366",
    textAlign: "center",
  },
});
