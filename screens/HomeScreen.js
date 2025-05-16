import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // ← TA LINIJKA JEST KLUCZOWA
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import i18n from '../i18n';
import CustomSwitch from '../components/CustomSwitch';

// Kolory pastelowe do przycisków kalkulatorów
const pastelColors = [
  '#B8D8FF', // Pace
  '#FFB3B3', // Training
  '#B9F5D8', // Equivalent
  '#FFD6C0', // WMA
];

export default function HomeScreen({ toggleTheme, isDarkMode }) {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      headerLeft: () => null,
    });
  }, [navigation]);

  const calculators = [
    {
      key: 'SpeedCalc',
      icon: 'speedometer',
      label: i18n.t('home.paceCalculator'),
      color: pastelColors[0],
    },
    {
      key: 'TrainingCalc',
      icon: 'clock-outline',
      label: i18n.t('home.trainingCalculator'),
      color: pastelColors[1],
    },
    {
      key: 'EquivalentCalc',
      icon: 'swap-horizontal-bold',
      label: i18n.t('home.equivalentCalculator'),
      color: pastelColors[2],
    },
    {
      key: 'WmaFactor',
      icon: 'chart-timeline-variant',
      label: i18n.t('home.wmaAgeGrading'),
      color: pastelColors[3],
    },
  ];

  // Stany animacji - tablica referencji Animated.Value
  const scaleAnim = useRef(calculators.map(() => new Animated.Value(1))).current;

  const handlePressIn = idx => {
    Animated.spring(scaleAnim[idx], {
      toValue: 1.07,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = idx => {
    Animated.spring(scaleAnim[idx], {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handleNavigate = key => {
    navigation.navigate(key);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#121212' : '#f8f9fb' }]}>
      {/* Przycisk powrotu do wyboru języka */}
      <TouchableWithoutFeedback onPress={() => navigation.navigate('LanguageSelect')}>
        <View style={styles.languageButton}>
          <MaterialCommunityIcons
            name="arrow-left-circle"
            size={34}
            color={isDarkMode ? '#fff' : '#333'}
          />
        </View>
      </TouchableWithoutFeedback>

      {/* Nagłówek */}
      <Text style={[
        styles.header,
        {
          fontFamily: 'Montserrat_700Bold',
          letterSpacing: 2,
          fontSize: 28,
          color: isDarkMode ? '#fff' : '#222',
          textShadowColor: 'rgba(180,180,180,0.15)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 6,
        }
      ]}>
        {i18n.t('home.selectCalculator')}
      </Text>

      {/* Lista kalkulatorów */}
      <View style={styles.optionsContainer}>
        {calculators.map((calc, idx) => (
          <TouchableWithoutFeedback
            key={calc.key}
            onPressIn={() => handlePressIn(idx)}
            onPressOut={() => handlePressOut(idx)}
            onPress={() => handleNavigate(calc.key)}
          >
            <Animated.View
              style={[
                styles.optionButton,
                { backgroundColor: calc.color, transform: [{ scale: scaleAnim[idx] }] }
              ]}
            >
              <MaterialCommunityIcons
                name={calc.icon}
                size={24}
                color="#555"
                style={styles.icon}
              />
              <Text style={styles.optionText}>
                {calc.label}
              </Text>
            </Animated.View>
          </TouchableWithoutFeedback>
        ))}
      </View>

      {/* Przełącznik ciemnego motywu */}
      <View style={styles.switchContainer}>
        <Text style={[styles.switchText, { color: isDarkMode ? '#fff' : '#333' }]}>
          {i18n.t('home.darkMode')}
        </Text>
        <CustomSwitch
          value={isDarkMode}
          onValueChange={toggleTheme}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
  },
  header: {
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '80%',
    padding: 15,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    marginVertical: 10,
    marginLeft: 0,
  },
  icon: {
    marginRight: 18,
    marginLeft: 2,
  },
  optionText: {
    fontSize: 16,
    color: '#555',
    fontWeight: 'bold',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 34,
    alignSelf: 'center',
  },
  switchText: {
    fontSize: 16,
    marginRight: 12,
    letterSpacing: 1,
  },
});
