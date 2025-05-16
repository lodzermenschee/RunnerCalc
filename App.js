// App.js
import React, { useState } from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from './context/theme-context';
import { useFonts, Montserrat_700Bold } from '@expo-google-fonts/montserrat';

// Screens
import IntroScreen from './screens/IntroScreen';
import LanguageSelectScreen from './screens/LanguageSelectScreen';
import HomeScreen from './screens/HomeScreen';
import SpeedCalcScreen from './screens/SpeedCalcScreen';
import TrainingCalcScreen from './screens/TrainingCalcScreen';
import EquivalentCalcScreen from './screens/EquivalentCalcScreen';
import WmaFactorScreen from './screens/WmaFactorScreen';

const Stack = createStackNavigator();

// Styl headera – tylko w jednym miejscu!
const headerTitleStyle = {
  fontFamily: 'Montserrat_700Bold',
  fontWeight: 'bold',
  fontSize: 18,
  letterSpacing: 1,
  color: '#222',
};

export default function App() {
  const { t, i18n } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  let [fontsLoaded] = useFonts({ Montserrat_700Bold });
  if (!fontsLoaded) return null;

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const changeLanguage = (lang) => i18n.changeLanguage(lang);

  const theme = isDarkMode ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider>
      <NavigationContainer theme={theme}>
        <Stack.Navigator
          key={i18n.language}
          initialRouteName="Intro"
          screenOptions={{
            headerTitleAlign: 'center',
            headerTitleStyle, // używamy własnego stylu
            headerStyle: {
              backgroundColor: isDarkMode ? '#111' : '#f8f9fb',
              elevation: 0,
              shadowOpacity: 0,
            },
          }}
        >
          {/* Intro bez headera */}
          <Stack.Screen
            name="Intro"
            component={IntroScreen}
            options={{ headerShown: false }}
          />

          {/* Wybór języka bez headera */}
          <Stack.Screen
            name="LanguageSelect"
            options={{ headerShown: false }}
          >
            {(props) => (
              <LanguageSelectScreen
                {...props}
                changeLanguage={changeLanguage}
              />
            )}
          </Stack.Screen>

          {/* Ekran główny */}
          <Stack.Screen
            name="Home"
            options={{ headerShown: false }}
          >
            {(props) => (
              <HomeScreen
                {...props}
                toggleTheme={toggleTheme}
                isDarkMode={isDarkMode}
                language={i18n.language}
                t={t}
              />
            )}
          </Stack.Screen>

          {/* Kalkulatory */}
          <Stack.Screen
            name="SpeedCalc"
            component={SpeedCalcScreen}
            options={{
              headerShown: false,
              title: t('home.paceCalculator'),
              headerTitleStyle,
            }}
          />
       <Stack.Screen
  name="TrainingCalc"
  component={TrainingCalcScreen}
  options={{
    headerShown: false, // ← to jest najważniejsze!
  }}
/>

          <Stack.Screen
            name="EquivalentCalc"
            component={EquivalentCalcScreen}
            options={{
              title: t('home.equivalentCalculator'),
              headerTitleStyle,
            }}
          />
          <Stack.Screen
            name="WmaFactor"
            component={WmaFactorScreen}
            options={{
              title: t('home.wmaAgeGrading'),
              headerTitleStyle,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}
