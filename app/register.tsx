import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState, useRef } from "react";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { auth } from "../config/firebaseConfig";
import { useRouter } from "expo-router";
import { ActivityIndicator } from "react-native";

export default function RegisterPage() {
  const router = useRouter();
  const recaptchaVerifier = useRef(null);

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
  const [authScreenState, setAuthScreenState] = useState<"phone" | "otp" | "form">("phone");

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm({ ...form, [field]: value });
  };

  // Improved phone number validation
  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/[^\d]/g, "");
    return cleaned.length === 10;
  };

  const validateForm = () => {
    const { fullName, gender, dob, address, regNumber, mobile } = form;
    if (!fullName.trim()) {
      Alert.alert("Validation Error", "Full Name is required.");
      return false;
    }
    if (!gender) {
      Alert.alert("Validation Error", "Gender is required.");
      return false;
    }
    if (!dob) {
      Alert.alert("Validation Error", "Date of Birth is required.");
      return false;
    }
    if (!address.trim()) {
      Alert.alert("Validation Error", "Address is required.");
      return false;
    }
    if (!/^\d{10}$/.test(regNumber)) {
      Alert.alert("Validation Error", "Govt Registration Number must be 10 digits.");
      return false;
    }
    return true;
  };

  // Improved OTP sending function
  const sendOtp = async () => {
    if (!validatePhoneNumber(form.mobile)) {
      Alert.alert("Validation Error", "Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const phoneNumber = "+91" + form.mobile;
      const phoneProvider = new PhoneAuthProvider(auth);
      
      const verificationId = await phoneProvider.verifyPhoneNumber(
        phoneNumber,
        recaptchaVerifier.current
      );
      
      setVerificationId(verificationId);
      setAuthScreenState("otp");
      Alert.alert("Success", "OTP sent to your mobile number");
    } catch (error) {
      console.error("OTP sending error:", error);
      Alert.alert("Error", "Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Improved OTP verification
  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      Alert.alert("Invalid OTP", "Please enter a valid 6-digit OTP.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const userCredential = await signInWithCredential(auth, credential);
      const idToken = await userCredential.user.getIdToken();
      
      setFirebaseToken(idToken);
      setIsOtpVerified(true);
      setAuthScreenState("form");
      
      // Check if user exists
      const loginRes = await fetch("http://192.168.0.130:8080/api/auth/login", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      if (loginRes.ok) {
        Alert.alert("Welcome", "User already registered.");
        router.replace("/location");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      Alert.alert("Error", "Invalid OTP. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = async () => {
    if (!isOtpVerified) {
      Alert.alert("Error", "Please verify your mobile number first.");
      return;
    }
    if (!validateForm()) return;

    try {
      const registerRes = await fetch("http://192.168.0.130:8080/api/users/register", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firebaseToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          gender: form.gender,
          dob: form.dob.toISOString().split("T")[0],
          address: form.address,
          nicNumber: form.regNumber,
          phoneNumber: form.mobile,
        }),
      });

      if (!registerRes.ok) throw new Error("Failed to register user.");
      
      Alert.alert("Success", "Registration complete!");
      router.replace("/location");
    } catch (error) {
      console.error("Registration error:", error);
      Alert.alert("Error", "Registration failed. Please try again.");
    }
  };

  // Phone number input screen
  if (authScreenState === "phone") {
    return (
      <SafeAreaView style={styles.container}>
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaVerifier}
          firebaseConfig={auth.app.options}
        />
        
        <Text style={styles.label}>Mobile Number</Text>
        <TextInput
          style={styles.input}
          placeholder="10-digit number"
          keyboardType="phone-pad"
          maxLength={10}
          value={form.mobile}
          onChangeText={(text) => handleChange("mobile", text)}
        />
        
        {isSendingOtp ? (
          <ActivityIndicator size="large" color="#003366" />
        ) : (
          <TouchableOpacity style={styles.button} onPress={sendOtp}>
            <Text style={styles.buttonText}>Send OTP</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  // OTP verification screen
  if (authScreenState === "otp") {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.otpMessage}>
          Verification code sent to +91{form.mobile}
        </Text>
        
        <Text style={styles.label}>OTP</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter 6-digit OTP"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />
        
        {isVerifyingOtp ? (
          <ActivityIndicator size="large" color="#003366" />
        ) : (
          <TouchableOpacity 
            style={styles.button} 
            onPress={verifyOtp}
            disabled={isVerifyingOtp}
          >
            <Text style={styles.buttonText}>Verify OTP</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => setAuthScreenState("phone")}
        >
          <Text style={styles.secondaryButtonText}>Change Number</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Registration form screen
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.verifiedNumber}>
        Verified: +91{form.mobile}
      </Text>
      
      <Text style={styles.label}>Full Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter full name"
        value={form.fullName}
        onChangeText={(text) => handleChange("fullName", text)}
      />

      <Text style={styles.label}>Gender</Text>
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

      <Text style={styles.label}>Date of Birth</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)}>
        <TextInput
          style={styles.input}
          placeholder="Select Date"
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

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter address"
        value={form.address}
        onChangeText={(text) => handleChange("address", text)}
      />

      <Text style={styles.label}>Govt Registration Number</Text>
      <TextInput
        style={styles.input}
        placeholder="NIC / Registration No"
        keyboardType="numeric"
        maxLength={10}
        value={form.regNumber}
        onChangeText={(text) => handleChange("regNumber", text)}
      />

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>Complete Registration</Text>
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
  label: {
    marginBottom: 4,
    marginTop: 10,
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  dropdownWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
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
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#003366",
  },
  secondaryButtonText: {
    color: "#003366",
    fontSize: 17,
    fontWeight: "600",
  },
  otpMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#555",
  },
  verifiedNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "green",
    marginBottom: 20,
    textAlign: "center",
  },
});