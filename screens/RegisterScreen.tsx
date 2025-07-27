import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../App";

export default function RegisterScreen() {
  const [nome, setNome] = useState("");
  const [cognome, setCognome] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleRegister = () => {
    if (
      !nome ||
      !cognome ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setErrorMsg("Compila tutti i campi!");
    } else if (password !== confirmPassword) {
      setErrorMsg("Le password non coincidono.");
    } else {
      setErrorMsg("");
      console.log("Registrazione completata!");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require("../assets/images/logo_pages.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Occhio Al Borgo</Text>
        </View>

        {/* Form */}
        <View style={styles.formWrapper}>
          {[
            "Nome",
            "Cognome",
            "Username",
            "Email",
            "Password",
            "Conferma Password",
          ].map((pl, i) => (
            <View key={i} style={styles.inputBox}>
              <TextInput
                placeholder={pl}
                placeholderTextColor="#555"
                secureTextEntry={
                  pl.toLowerCase().includes("password")
                    ? !(pl === "Password" ? showPassword : showConfirmPassword)
                    : false
                }
                style={styles.input}
                value={
                  pl === "Nome"
                    ? nome
                    : pl === "Cognome"
                    ? cognome
                    : pl === "Username"
                    ? username
                    : pl === "Email"
                    ? email
                    : pl === "Password"
                    ? password
                    : confirmPassword
                }
                onChangeText={(text) => {
                  if (pl === "Nome") setNome(text);
                  if (pl === "Cognome") setCognome(text);
                  if (pl === "Username") setUsername(text);
                  if (pl === "Email") setEmail(text);
                  if (pl === "Password") setPassword(text);
                  if (pl === "Conferma Password") setConfirmPassword(text);
                }}
              />
            </View>
          ))}
        </View>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleRegister}>
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
  container: { flex: 1, backgroundColor: "#e8e9ea", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 60,
    marginBottom: 20,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
  },
  logo: { width: 80, height: 80, marginRight: 20 },
  title: { fontSize: 22, fontFamily: "Cinzel", marginLeft: 15, color: "#000" },
  formWrapper: { width: "85%", alignItems: "center", marginTop: 10 },
  inputBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 6,
    width: "100%",
    height: 44,
    justifyContent: "center",
  },
  input: { fontSize: 16, color: "#000", fontFamily: "Cormorant" },
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
