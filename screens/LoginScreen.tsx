import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigation";

type LoginNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Login"
>;
const screenHeight = Dimensions.get("window").height;

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigation = useNavigation<LoginNavigationProp>();

  return (
    <ImageBackground
      source={require("../assets/images/login_bg.png")}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        {/* Logo */}
        <View style={styles.logoWrapper}>
          <Image
            source={require("../assets/images/logo_app.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Form */}
        <View style={styles.formWrapper}>
          {/* Username */}
          <View style={styles.inputBox}>
            <FontAwesome name="user" size={16} color="#333" />
            <TextInput
              placeholder="User Name"
              style={styles.input}
              placeholderTextColor="#555"
            />
          </View>

          {/* Password */}
          <View style={styles.inputBox}>
            <FontAwesome name="lock" size={16} color="#333" />
            <TextInput
              placeholder="Password"
              secureTextEntry={!showPassword}
              style={styles.input}
              placeholderTextColor="#555"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <FontAwesome
                name={showPassword ? "eye-slash" : "eye"}
                size={16}
                color="#333"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>

          {/* Remember me */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View style={styles.checkbox}>
              {rememberMe && (
                <FontAwesome name="check" size={14} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Ricorda password</Text>
          </TouchableOpacity>

          {/* Links */}
          <View style={styles.linkRow}>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.link}>Registrati</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.link}>Hai dimenticato la password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login button */}
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, resizeMode: "cover" },
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  logoWrapper: {
    position: "absolute",
    top: screenHeight * 0.17,
    alignItems: "center",
  },
  logo: { width: 200, height: 200 },
  formWrapper: {
    position: "absolute",
    top: screenHeight * 0.5,
    width: "85%",
    alignItems: "center",
  },
  inputBox: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 10,
    marginVertical: 6,
    width: "100%",
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
    fontFamily: "Cormorant",
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
    marginBottom: 20,
  },
  link: {
    color: "#fff",
    fontSize: 12,
    textDecorationLine: "underline",
    fontFamily: "Cormorant",
  },
  loginButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 4,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cinzel",
    textAlign: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxLabel: { fontFamily: "Cormorant", fontSize: 14, color: "#fff" },
});
