import { useLocalSearchParams, useRouter } from "expo-router";
import { PhoneAuthProvider, signInWithCredential } from "firebase/auth";
import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { auth } from "../config/firebaseConfig";

export default function OtpPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const verificationId = Array.isArray(params.verificationId)
    ? params.verificationId[0]
    : params.verificationId;

  const mobile = Array.isArray(params.mobile)
    ? params.mobile[0]
    : params.mobile;

  const regNumber = Array.isArray(params.regNumber)
    ? params.regNumber[0]
    : params.regNumber;

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      Alert.alert("Invalid OTP", "Please enter a valid 6-digit OTP.");
      return;
    }

    if (!verificationId) {
      Alert.alert("Error", "Missing verification ID.");
      return;
    }

    setIsVerifying(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const userCredential = await signInWithCredential(auth, credential);

      console.log("✅ Auth Success:", userCredential.user.phoneNumber);

      Alert.alert("Success", "Mobile number verified!");

      router.push({
        pathname: "/location",
        params: { regNumber: regNumber || "" },
      });
    } catch (error: any) {
      console.error("OTP Verification Failed:", error);
      Alert.alert("Error", error.message || "Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Mobile Number</Text>
      <Text style={styles.subtitle}>OTP sent to +91 {mobile}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter 6-digit OTP"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleVerifyOtp}
        disabled={isVerifying}
      >
        <Text style={styles.buttonText}>
          {isVerifying ? "Verifying..." : "Verify OTP"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    color: "#003366",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f4f4f4",
    padding: 14,
    borderRadius: 8,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#003366",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  backLink: {
    alignItems: "center",
  },
  backText: {
    fontSize: 16,
    color: "#003366",
    textDecorationLine: "underline",
  },
});
