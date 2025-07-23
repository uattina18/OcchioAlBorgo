import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Image } from "react-native";
import LoginScreen from "./screens/LoginScreen";

export default function App() {
  return <LoginScreen />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 180,
    height: 160,
    marginBottom: 20,
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },
});
