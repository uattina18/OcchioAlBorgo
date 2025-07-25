import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";

const screenHeight = Dimensions.get("window").height;

export default function RegisterScreen() {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        {/* LOGO in alto */}
        <View style={styles.header}>
          <Image
            source={require("../assets/images/logo_pages.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Registrati</Text>
        </View>

        {/* Aggiungeremo qui i campi dopo */}
        <View style={styles.formWrapper}>
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Username"
              style={styles.input}
              placeholderTextColor="#555"
            />
          </View>
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Email"
              style={styles.input}
              placeholderTextColor="#555"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8e9ea", // puoi cambiare per tema scuro
    alignItems: "center",
  },

  logo: {
    width: 80,
    height: 80,
    marginRight: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
  },
  title: {
    fontSize: 22,
    fontFamily: "Cinzel", // se vuoi un altro font qui, dimmi
    color: "#000",
    marginLeft: 15,
  },
  formWrapper: {
    width: "85%",
    alignItems: "center",
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 6,
    width: "100%",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#000",
    fontFamily: "Cormorant",
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 4,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Cinzel",
    textAlign: "center",
  },
});
