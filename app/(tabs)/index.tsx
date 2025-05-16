import { Image } from 'expo-image';
import { Platform, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">RunnerCalc działa! 🚀</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Krok 1: Edytuj plik</ThemedText>
        <ThemedText>
          Otwórz <ThemedText type="defaultSemiBold">app/App.tsx</ThemedText> i zmień tekst powitalny,
          następnie zapisz plik.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Krok 2: Uruchom aplikację</ThemedText>
        <ThemedText>
          W terminalu wpisz <ThemedText type="defaultSemiBold">npm start</ThemedText>, a potem:
          {' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({ ios: 'i', android: 'a', web: 'w' })}
          </ThemedText>{' '}
          by odpalić odpowiednio iOS, Android emulator lub przeglądarkę.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Krok 3: Dodamy nawigację</ThemedText>
        <ThemedText>
          W następnym kroku przygotujemy ekran główny z przyciskami do czterech kalkulatorów.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 16,
  },
  reactLogo: {
    height: 178,
    width: 290,
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
});
