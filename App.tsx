import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import * as Font from 'react-native-font-loader';
import Navigation from './navigation/Navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    const loadFonts = async () => {
      await Font.loadFont(
        'Cinzel',
        require('./assets/fonts/Cinzel-Regular.ttf'),
      );
      await Font.loadFont(
        'Cormorant',
        require('./assets/fonts/static/CormorantGaramond-Regular.ttf'),
      );
      setFontsLoaded(true);
    };
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View>
        <Text>Caricamento...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <Navigation />
    </SafeAreaProvider>
  );
}
