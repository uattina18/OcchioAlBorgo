import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";

export default function LoginScreen() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <ImageBackground
      source={require("../assets/images/login_bg.png")}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.logoWrapper}>
          <Image
            source={require("../assets/images/logo_app.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.form}>
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
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 10,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 6,
    paddingHorizontal: 10,
    marginVertical: 8,
    width: "100%",
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    height: 40,
    color: "#000",
  },
  logoWrapper: {
    marginTop: "30%",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-start",
  },
  form: {
    width: "100%",
    flex: 2,
    justifyContent: "flex-start",
    alignItems: "center",
  },
});
