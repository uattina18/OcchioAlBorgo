import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeScreen from "../screens/HomeScreen";
import ExploreScreen from "../screens/ExploreScreen";
import SegnalaEventoScreen from "../screens/SegnalaEventoScreen";
import ProfiloScreen from "../screens/ProfiloScreen";
import InvitaAmicoScreen from "../screens/InvitaAmicoScreen";
// import ScattaScreen from "../screens/ScattaScreen";
// import NotificheScreen from "../screens/NotificheScreen";
// import ProfiloScreen from "../screens/ProfiloScreen";
import SettingsScreen from "../screens/SettingsScreen";

export type RootStackParamList = {
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
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// In dev, forzo un "fresh mount" ad ogni reload per evitare stati vecchi
const NAV_KEY = __DEV__ ? `dev-${Date.now()}` : "app";

const Navigation: React.FC = () => {
  return (
    <NavigationContainer key={NAV_KEY}>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="Home" // <-- Avvio sempre su Home
      >
        {/* Se ti serve login in futuro, lascialo qui ma non come initial */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Explore" component={ExploreScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="SegnalaEvento" component={SegnalaEventoScreen} />
        <Stack.Screen name="Profilo" component={ProfiloScreen} />
        <Stack.Screen name="InvitaAmico" component={InvitaAmicoScreen} />
        {/* Registra le altre quando pronte */}
        {/* <Stack.Screen name="Scatta" component={ScattaScreen} /> */}
        {/* <Stack.Screen name="Notifiche" component={NotificheScreen} /> */}
        {/* <Stack.Screen name="Profilo" component={ProfiloScreen} /> */}
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
