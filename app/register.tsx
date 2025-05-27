import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { auth } from "../config/firebaseConfig";
// import axios from "axios";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

export default function RegisterWithOtpPage() {
  const [form, setForm] = useState({
    fullName: "",
    gender: "",
    dob: new Date(),
    address: "",
    regNumber: "",
    mobile: "",
  });

  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [firebaseToken, setFirebaseToken] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const validateForm = () => {
    const { fullName, gender, dob, address, regNumber, mobile } = form;
    if (!fullName || !gender || !dob || !address || !regNumber || !mobile) {
      Alert.alert("Error", "All fields are required.");
      return false;
    }
    if (!/^\d{10}$/.test(regNumber)) {
      Alert.alert("Error", "Govt Registration Number must be 10 digits.");
      return false;
    }
    if (!/^\d{10}$/.test(mobile)) {
      Alert.alert("Error", "Mobile number must be 10 digits.");
      return false;
    }
    return true;
  };

  const setupRecaptcha = () => {
    if (Platform.OS === "web" && !window.recaptchaVerifier) {
      let container = document.getElementById("recaptcha-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "recaptcha-container";
        document.body.appendChild(container);
      }

      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: (response: any) => console.log("reCAPTCHA resolved", response),
      });
    }
  };

  const sendOtp = async () => {
    if (!validateForm()) return;

    setIsSendingOtp(true);
    try {
      let appVerifier: any;
      if (Platform.OS === "web") {
        setupRecaptcha();
        appVerifier = window.recaptchaVerifier;
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        "+91" + form.mobile,
        appVerifier
      );
      setVerificationId(confirmation.verificationId);
      Alert.alert("Success", "OTP sent to your number.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to send OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      Alert.alert("Invalid OTP", "Enter a valid 6-digit OTP.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const userCredential = await signInWithCredential(auth, credential);
      const idToken = await userCredential.user.getIdToken();

      setFirebaseToken(idToken);
      setIsOtpVerified(true);
      Alert.alert("Verified", "Mobile number verified.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "OTP verification failed.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async () => {
    if (!isOtpVerified) {
      Alert.alert("Error", "Please verify your mobile number first.");
      return;
    }

    try {
      // 1. Register user
      const res = await axios.post(
        "http://localhost:8080/api/users/register",
        {
          fullName: form.fullName,
          gender: form.gender,
          dob: form.dob.toISOString().split("T")[0],
          address: form.address,
          nicNumber: form.regNumber,
          phoneNumber: form.mobile,
        },
        {
          headers: {
            Authorization: `Bearer ${firebaseToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const userId = res.data?.id; // If API returns userId

      // 2. Send location (mock coordinates here)
      await axios.post(
        "http://localhost:8080/api/users/location",
        {
          userId: userId || 123,
          latitude: 34.083656,
          longitude: 74.797371,
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            Authorization: `Bearer ${firebaseToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("Success", "Registration complete!");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Registration failed.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={form.fullName}
        onChangeText={(text) => handleChange("fullName", text)}
      />

      <View style={styles.dropdownWrapper}>
        <Picker
          selectedValue={form.gender}
          onValueChange={(value) => handleChange("gender", value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Gender" value="" />
          <Picker.Item label="Male" value="Male" />
          <Picker.Item label="Female" value="Female" />
          <Picker.Item label="Other" value="Other" />
        </Picker>
      </View>

      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          style={styles.input}
          placeholder="Date of Birth"
          value={form.dob.toDateString()}
          editable={false}
        />
      </TouchableOpacity>

      {showDatePicker &&
        (Platform.OS === "web" ? (
          <input
            type="date"
            onChange={(e) => {
              handleChange("dob", new Date(e.target.value));
              setShowDatePicker(false);
            }}
          />
        ) : (
          <DateTimePicker
            value={form.dob}
            mode="date"
            display="default"
            onChange={(e, selectedDate) => {
              if (selectedDate) handleChange("dob", selectedDate);
              setShowDatePicker(false);
            }}
          />
        ))}

      <TextInput
        style={styles.input}
        placeholder="Address"
        value={form.address}
        onChangeText={(text) => handleChange("address", text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Govt Registration Number"
        keyboardType="numeric"
        maxLength={10}
        value={form.regNumber}
        onChangeText={(text) => handleChange("regNumber", text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Mobile Number"
        keyboardType="phone-pad"
        maxLength={10}
        value={form.mobile}
        onChangeText={(text) => handleChange("mobile", text)}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={sendOtp}
        disabled={isSendingOtp}
      >
        <Text style={styles.buttonText}>
          {isSendingOtp ? "Sending OTP..." : "Send OTP"}
        </Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        keyboardType="number-pad"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isOtpVerified ? "green" : "#003366" },
        ]}
        onPress={verifyOtp}
        disabled={isVerifyingOtp || isOtpVerified}
      >
        <Text style={styles.buttonText}>
          {isOtpVerified ? "Verified" : isVerifyingOtp ? "Verifying..." : "Verify OTP"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { marginTop: 20 }]}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      {Platform.OS === "web" && <View id="recaptcha-container" />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  dropdownWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: "#003366",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
