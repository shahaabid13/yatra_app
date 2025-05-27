import { auth } from "../config/firebaseConfig";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Extend the Window interface to include recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: "",
    gender: "",
    dob: new Date(),
    address: "",
    regNumber: "",
    mobile: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const validate = () => {
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
      // Create hidden div manually
      let recaptchaDiv = document.getElementById("recaptcha-container");
      if (!recaptchaDiv) {
        recaptchaDiv = document.createElement("div");
        recaptchaDiv.id = "recaptcha-container";
        recaptchaDiv.style.display = "none";
        document.body.appendChild(recaptchaDiv);
      }

      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
          callback: (response: any) => {
            console.log("Recaptcha verified", response);
          },
        }
      );
    }
  };

  const handleSendOtp = async () => {
    if (!validate()) return;
    setIsSending(true);

    try {
      let appVerifier;

      if (Platform.OS === "web") {
        setupRecaptcha();
        appVerifier = window.recaptchaVerifier;
      }

      const confirmation = await signInWithPhoneNumber(
        auth,
        "+91" + form.mobile,
        appVerifier // `undefined` is OK for mobile
      );

      router.push({
        pathname: "/otp",
        params: {
          verificationId: confirmation.verificationId,
          mobile: form.mobile,
        },
      });
    } catch (error) {
      console.error("OTP Error", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send OTP.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 🛑 Removed View with id — now created programmatically */}

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
              setShowDatePicker(false);
              handleChange("dob", new Date(e.target.value));
            }}
            style={{ marginBottom: 12, fontSize: 16, padding: 12 }}
          />
        ) : (
          <DateTimePicker
            value={form.dob}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) handleChange("dob", selectedDate);
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
        onPress={handleSendOtp}
        disabled={isSending}
      >
        <Text style={styles.buttonText}>
          {isSending ? "Sending OTP..." : "Send OTP"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f8f9fa",
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#003366",
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
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  picker: {
    height: 50,
    color: "#333",
  },
  button: {
    backgroundColor: "#003366",
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    textAlign: "center",
    fontWeight: "600",
  },
});

export default RegisterPage;
