import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import i18n from '../i18n'; // Importujemy i18n

const LanguageSelectScreen = ({ navigation }) => {
  const changeLanguage = (language) => {
    i18n.changeLanguage(language); // Zmiana języka
    navigation.replace('Home'); // Przejście do HomeScreen po wyborze języka
  };

  return (
    <View style={styles.container}>
      {/* Przycisk do wyboru Polski */}
      <TouchableOpacity onPress={() => changeLanguage('pl')}>
        <Image
          source={require('../assets/images/pl-flag.png')}
          style={styles.flag}
        />
      </TouchableOpacity>

      {/* Przycisk do wyboru Anglii */}
      <TouchableOpacity onPress={() => changeLanguage('en')}>
        <Image
          source={require('../assets/images/en-flag.png')}
          style={styles.flag}
        />
      </TouchableOpacity>

      {/* Przycisk do wyboru Niemiec (30% większa flaga) */}
      <TouchableOpacity onPress={() => changeLanguage('de')}>
        <Image
          source={require('../assets/images/de-flag.png')}
          style={[styles.flag, styles.flagLarge]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  flag: {
    width: 60,
    height: 40,
    margin: 20,
  },
  // 30% większe wymiary od podstawowego rozmiaru (60x40 → 78x52)
  flagLarge: {
    width: 78,
    height: 52,
  },
});

export default LanguageSelectScreen;
