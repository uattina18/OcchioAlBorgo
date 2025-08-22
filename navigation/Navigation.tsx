// navigation/Navigation.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Schermate
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen"; // ✅ unica Home giusta
import ExploreScreen from "../screens/ExploreScreen";
import ScattaScreen from "../screens/ScattaBorgoScreen";
import NotificheScreen from "../screens/NotificheScreen";
import ProfiloScreen from "../screens/ProfiloScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SegnalaEventoScreen from "../screens/SegnalaEventoScreen";
import InvitaAmicoScreen from "../screens/InvitaAmicoScreen";
import GalleriaScreen from "../screens/GalleriaScreen";
import EditProfiloScreen from "../screens/EditProfiloScreen";
import AuthLoadingScreen from "../screens/AuthLoadingScreen";
// import CambiaPasswordScreen from "../screens/CambiaPasswordScreen";

// Tipi di navigazione
export type RootStackParamList = {
  AuthLoadingScreen: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  Explore: undefined;
  Scatta: undefined;
  Notifiche: undefined;
  Profilo: undefined;
  SettingsScreen: undefined;
  SegnalaEvento: undefined;
  InvitaAmico: undefined;
  Galleria: undefined;
  EditProfilo: undefined;
  // CambiaPassword: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="AuthLoadingScreen" // 👈 entry: decide AuthLoading
        screenOptions={{ headerShown: false }}
      >
        {/* Loading → decide se andare a Home o Login */}
        <Stack.Screen name="AuthLoadingScreen" component={AuthLoadingScreen} />

        {/* Home corretta */}
        <Stack.Screen name="Home" component={HomeScreen} />

        {/* Altre schermate */}
        <Stack.Screen name="Explore" component={ExploreScreen} />
        <Stack.Screen name="Scatta" component={ScattaScreen} />
        <Stack.Screen name="Notifiche" component={NotificheScreen} />
        <Stack.Screen name="Profilo" component={ProfiloScreen} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        <Stack.Screen name="SegnalaEvento" component={SegnalaEventoScreen} />
        <Stack.Screen name="InvitaAmico" component={InvitaAmicoScreen} />
        <Stack.Screen name="Galleria" component={GalleriaScreen} />
        <Stack.Screen name="EditProfilo" component={EditProfiloScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        {/* <Stack.Screen name="CambiaPassword" component={CambiaPasswordScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
