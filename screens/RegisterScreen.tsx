import React, { useState } from "react";
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
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigation";

type RegisterNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Register"
>;

const screenHeight = Dimensions.get("window").height;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterNavigationProp>();
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

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
          <Text style={styles.title}>Occhio Al Borgo</Text>
        </View>

        {/* Aggiungeremo qui i campi dopo */}
        <View style={styles.formWrapper}>
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Nome"
              style={styles.input}
              placeholderTextColor="#555"
              value={nome}
              onChangeText={setNome}
            />
          </View>
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Cognome"
              style={styles.input}
              placeholderTextColor="#555"
              value={cognome}
              onChangeText={setCognome}
            />
          </View>
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Username"
              style={styles.input}
              placeholderTextColor="#555"
              value={username}
              onChangeText={setUsername}
            />
          </View>
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Email"
              style={styles.input}
              placeholderTextColor="#555"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Password"
              style={styles.input}
              placeholderTextColor="#555"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
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
          <View style={styles.inputBox}>
            <TextInput
              placeholder="Conferma Password"
              style={styles.input}
              placeholderTextColor="#555"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <FontAwesome
                name={showConfirmPassword ? "eye-slash" : "eye"}
                size={16}
                color="#333"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>
        </View>
        {errorMessage !== "" && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            if (
              !nome ||
              !cognome ||
              !username ||
              !email ||
              !password ||
              !confirmPassword
            ) {
              setErrorMessage("Compila tutti i campi!");

              setError("");
            } else if (password !== confirmPassword) {
              setError("Le password non coincidono");
              setErrorMessage("");
            } else {
              setErrorMessage("");
              setError("");
              console.log("Registrazione completata!");
            }
          }}
        >
          <Text style={styles.buttonText}>Registrati</Text>
        </TouchableOpacity>
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginTextHint}>Hai già un account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>Accedi</Text>
          </TouchableOpacity>
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
    marginTop: 10,
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
  errorText: {
    color: "red",
    fontSize: 12,
    fontFamily: "Cormorant",
    marginBottom: 10,
    textAlign: "center",
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  loginTextHint: {
    fontSize: 14,
    fontFamily: "Cormorant",
    color: "#333",
    marginRight: 5,
  },
  loginLink: {
    fontSize: 14,
    fontFamily: "Cormorant",
    color: "#007AFF",
    textDecorationLine: "underline",
  },
});
