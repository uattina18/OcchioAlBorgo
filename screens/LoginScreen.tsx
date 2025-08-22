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
  Alert,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigation";
import { setItem, getItem, deleteItem } from "../utils/secureStore";

const screenHeight = Dimensions.get("window").height;
type Nav = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState(""); // opzionale per “ricorda password”
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const onLogin = async () => {
    try {
      if (!username.trim()) {
        Alert.alert("Attenzione", "Inserisci lo username.");
        return;
      }

      // Se hai una chiamata API, mettila qui e ottieni un token reale.
      // Per ora salviamo solo lo username (coerente con AuthLoadingScreen).
      await setItem("username", username.trim());

      if (rememberMe && password) {
        await setItem("password", password); // opzionale, se vuoi ricordarla
      } else {
        await deleteItem("password");
      }

      // Se in futuro usi un token:
      // await setItem("authToken", token);

      // Vai in Home azzerando lo stack (no back alla login)
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (e) {
      console.warn("Errore login:", e);
      Alert.alert("Errore", "Qualcosa è andato storto durante il login.");
    }
  };

  const loadRemembered = async () => {
    // opzionale: precompila username/password salvati
    const savedUser = await getItem("username");
    const savedPass = await getItem("password");
    if (savedUser) setUsername(savedUser);
    if (savedPass) {
      setPassword(savedPass);
      setRememberMe(true);
    }
  };

  React.useEffect(() => {
    loadRemembered();
  }, []);

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
            <FontAwesome
              name="user"
              size={16}
              color="#333"
              style={styles.icon}
            />
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="User Name"
              style={styles.input}
              placeholderTextColor="#555"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              accessibilityLabel="Campo User Name"
            />
          </View>

          {/* Password */}
          <View style={styles.inputBox}>
            <FontAwesome
              name="lock"
              size={16}
              color="#333"
              style={styles.icon}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              secureTextEntry={!showPassword}
              style={styles.input}
              placeholderTextColor="#555"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              accessibilityLabel="Campo Password"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((s) => !s)}
              accessibilityRole="button"
              accessibilityLabel={
                showPassword ? "Nascondi password" : "Mostra password"
              }
            >
              <FontAwesome
                name={showPassword ? "eye-slash" : "eye"}
                size={16}
                color="#333"
              />
            </TouchableOpacity>
          </View>

          {/* Remember me */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe((v) => !v)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: rememberMe }}
          >
            <View
              style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
            >
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
            <TouchableOpacity
              onPress={() => Alert.alert("Info", "Funzione in arrivo.")}
            >
              <Text style={styles.link}>Hai dimenticato la password?</Text>
            </TouchableOpacity>
          </View>

          {/* Login button */}
          <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
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
    justifyContent: "center",
    paddingHorizontal: 24,
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
    width: "100%",
    maxWidth: 400,
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
  icon: { marginRight: 8 },
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
    marginTop: 8,
  },
  link: {
    color: "#fff",
    fontSize: 12,
    textDecorationLine: "underline",
    fontFamily: "Cormorant",
  },
  loginButton: {
    backgroundColor: "#3a602a", // ✅ verde richiesto
    paddingVertical: 14,
    borderRadius: 6,
    marginTop: 14,
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
  checkboxChecked: {
    backgroundColor: "#000",
  },
  checkboxLabel: { fontFamily: "Cormorant", fontSize: 14, color: "#fff" },
});
