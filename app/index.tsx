import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

import { router } from "expo-router";

export default function MainPage() {
  return (
    
    <View style={styles.wrapper}> {/* ✅ Wrapper View added */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Navbar */}
        <View style={styles.navbar}>
          <Text style={styles.navTitle}>Amarnath Yatra</Text>
          <View style={styles.navButtons}>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => router.push("/register")}>
  <Text style={styles.buttonText}>Register</Text>
</TouchableOpacity>

          </View>
        </View>


        {/* Banner Image */}
        <Image source={require('../assets/images/banner.jpg')}  style={styles.banner} resizeMode="cover" />

        {/* Grid Section */}
        <View style={styles.gridContainer}>
          <TouchableOpacity style={styles.gridItem}>
            <Text style={styles.gridText}>🏥 Nearby Hospitals</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <Text style={styles.gridText}>🍲 Nearby Langers</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <Text style={styles.gridText}>🚓 Nearby Police Stations</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.gridItem}>
            <Text style={styles.gridText}>📞 Emergency Contacts</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ✅ Footer stays below everything */}
      <View style={styles.footer}>
        <Image
          source={require("../assets/images/msp-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.footerText}>
          © 2025 Amarnath Yatra App | Developed by MSP
        </Text>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#f4f4f4",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#003366",
    padding: 15,
  },
  navTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  navButtons: {
    flexDirection: "row",
  },
  button: {
    backgroundColor: "#ffffff20",
    padding: 8,
    marginLeft: 10,
    borderRadius: 6,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
  },
  banner: {
    width: "100%",
    height: 200,
    marginTop: 10,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 20,
  },
  gridItem: {
    backgroundColor: "#ffffff",
    width: "45%",
    marginVertical: 10,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    alignItems: "center",
  },
  gridText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003366",
    textAlign: "center",
  },
  footer: {
    backgroundColor: "#003366",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  footerText: {
    color: "white",
    fontSize: 14,
    marginLeft: 8,
  },
  logo: {
    width: 30,
    height: 30,
  },
});
