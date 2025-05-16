// screens/IntroScreen.js
import { useNavigation } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

// Pełny kod pliku IntroScreen.js
export default function IntroScreen() {
  const navigation = useNavigation();
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Po 3 sekundach startujemy animację fade-in trwającą 3s
    const fadeTimeout = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }, 3000);

    // Całkowity czas 3s (tylko tło) + 3s animacji + 2s hold = 8000ms
    const navTimeout = setTimeout(() => {
      // Po intro przejście do wyboru języka
      navigation.replace('LanguageSelect');
    }, 3000);

    return () => {
      clearTimeout(fadeTimeout);
      clearTimeout(navTimeout);
    };
  }, [navigation, opacity]);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/images/logo.png')}
        style={[styles.logo, { opacity }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff0000', // czerwone tło
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6,
  },
});
