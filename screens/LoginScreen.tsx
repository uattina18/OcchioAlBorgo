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

const screenHeight = Dimensions.get("window").height;

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ImageBackground
      source={require("../assets/images/login_bg.png")}
      style={styles.background}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.logoWrapper}>
          <Image
            source={require("../assets/images/logo_app.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formWrapper}>
          <View style={styles.inputBox}>
            <FontAwesome
              name="user"
              size={16}
              color="#333"
              style={styles.icon}
            />
            <TextInput
              placeholder="User Name"
              style={styles.input}
              placeholderTextColor="#555"
            />
          </View>

          <View style={styles.inputBox}>
            <FontAwesome
              name="lock"
              size={16}
              color="#333"
              style={styles.icon}
            />
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

          <View style={styles.linkRow}>
            <TouchableOpacity>
              <Text style={styles.link}>Registrati</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text style={styles.link}>Hai dimenticato la password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginText}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
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
  logo: {
    width: 200,
    height: 200,
  },
  formWrapper: {
    position: "absolute",
    top: screenHeight * 0.5,
    width: "85%",
    alignItems: "center",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 10,
    marginVertical: 6,
    width: "100%",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
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
});
