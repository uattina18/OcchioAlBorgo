import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/Navigation";
import { FontAwesome } from "@expo/vector-icons";
import { Home, Compass, Camera, Bell, User } from "lucide-react-native";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function Navbar() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity
        onPress={() => navigation.navigate("Home")}
        style={styles.navItem}
      >
        <Home size={20} color="#000" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Explore")}
        style={styles.navItem}
      >
        <Compass size={20} color="#000" />
        <Text style={styles.navText}>Esplora</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Scatta")}
        style={styles.centralButton}
      >
        <Camera size={23} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Notifiche")}
        style={styles.navItem}
      >
        <Bell size={20} color="#000" />
        <Text style={styles.navText}>Notifiche</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Profilo")}
        style={styles.navItem}
      >
        <User size={20} color="#000" />
        <Text style={styles.navText}>Profilo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#91be7e",
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 8,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    zIndex: 10,
  },
  navText: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: "Cinzel",
    color: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  centralButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  navItem: {
    justifyContent: "center",
    alignItems: "center",
  },
});
