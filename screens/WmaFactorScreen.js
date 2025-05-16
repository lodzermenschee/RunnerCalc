import { useTheme } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import NumericInput from '../components/NumericInput';
import { ThemedText } from '../components/ThemedText';
import { ageFactors, openStandard } from '../constants/wmaFactors';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const DISTANCES = ['5', '10', '21.0975', '42.195'];

export default function WmaFactorScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();

  // stan formularza
  const [distance, setDistance] = useState(DISTANCES[0]);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('female');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // stan modala
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [selectedDescription, setSelectedDescription] = useState('');
  const [infoVisible, setInfoVisible] = useState(false);

  const toSeconds = (h, m, s) =>
    (parseInt(h, 10) || 0) * 3600 +
    (parseInt(m, 10) || 0) * 60 +
    (parseInt(s, 10) || 0);

  const formatHMS = (t) => {
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = Math.round(t % 60);
    if (h > 0) return `${h}:${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  const calculate = () => {
    Keyboard.dismiss();
    const d = parseFloat(distance);
    const a = parseInt(age, 10);
    const tSec = toSeconds(hours, minutes, seconds);

    if (isNaN(d) || d <= 0) {
      setError(t('wmaFactor.errors.invalidDistance'));
      setResult(null);
      return;
    }
    if (isNaN(a) || a < 35 || a > 100) {
      setError(t('wmaFactor.errors.invalidAge'));
      setResult(null);
      return;
    }
    if (tSec <= 0) {
      setError(t('wmaFactor.errors.invalidTime'));
      setResult(null);
      return;
    }

    const f = ageFactors[gender]?.[a]?.[d] || null;
    if (!f) {
      setError(t('wmaFactor.errors.noData'));
      setResult(null);
      return;
    }

    const ageGradedTime = tSec * f;
    const stdOpen = openStandard[gender][d];
    const stdAge = stdOpen / f;
    const pct = (stdAge / tSec) * 100;

    setResult({
      factor: f.toFixed(4),
      ageGradedTime: formatHMS(ageGradedTime),
      openStandard: formatHMS(stdOpen),
      ageStandard: formatHMS(stdAge),
      percent: pct.toFixed(1) + '%',
    });
    setError('');
  };

  const showDescription = (key) => {
    const title = t(`wmaFactor.results.labels.${key}`);
    let desc = t(`wmaFactor.results.legends.${key}`);
    desc = desc.replace(/^[^:]+:\s*/, '');
    setSelectedTitle(title);
    setSelectedDescription(desc);
    setModalVisible(true);
  };

  const getCloseLabel = () => {
    const lang = i18n.language.toLowerCase();
    if (lang.startsWith('pl')) return 'ZAMKNIJ';
    if (lang.startsWith('de')) return 'schließen';
    return 'CLOSE';
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info o działaniu kalkulatora */}
        <View style={styles.infoContainer}>
          <TouchableOpacity onPress={() => setInfoVisible(true)}>
            <MaterialCommunityIcons name="information-outline" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {/* Wybór dystansu */}
        <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 8 }}>
          {t('wmaFactor.selectDistance')}
        </ThemedText>
        <View style={styles.presets}>
          {DISTANCES.map((v) => (
            <TouchableOpacity
              key={v}
              style={[
                styles.preset,
                {
                  borderColor: colors.primary,
                  backgroundColor: distance === v ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => {
                Keyboard.dismiss();
                setDistance(v);
                setResult(null);
              }}
            >
              <ThemedText type="button" style={{ color: distance === v ? '#fff' : colors.text }}>
                {t(`wmaFactor.presets.${v === '21.0975' ? 'halfMarathon'
                  : v === '42.195' ? 'marathon' : v}`)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Wiek */}
        <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 8 }}>
          {t('wmaFactor.ageLabel')}
        </ThemedText>
        <NumericInput
          value={age}
          onChangeText={setAge}
          placeholder={t('wmaFactor.placeholders.age')}
          style={styles.full}
        />

        {/* Płeć */}
        <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 8 }}>
          {t('wmaFactor.genderLabel')}
        </ThemedText>
        <View style={styles.presets}>
          {['female', 'male'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[
                styles.preset,
                {
                  borderColor: colors.primary,
                  backgroundColor: gender === g ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => {
                Keyboard.dismiss();
                setGender(g);
                setResult(null);
              }}
            >
              <ThemedText type="button" style={{ color: gender === g ? '#fff' : colors.text }}>
                {t(`wmaFactor.genderOptions.${g}`)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Czas */}
        <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 8 }}>
          {t('wmaFactor.finishTimeLabel')}
        </ThemedText>
        <View style={styles.timeRow}>
          <NumericInput
            value={hours}
            onChangeText={setHours}
            placeholder={t('wmaFactor.placeholders.hours')}
          />
          <NumericInput
            value={minutes}
            onChangeText={setMinutes}
            placeholder={t('wmaFactor.placeholders.minutes')}
          />
          <NumericInput
            value={seconds}
            onChangeText={setSeconds}
            placeholder={t('wmaFactor.placeholders.seconds')}
          />
        </View>

        <Button
          title={t('wmaFactor.buttons.calculate')}
          onPress={calculate}
          color={colors.primary}
        />

        {error ? (
          <ThemedText type="caption" style={{ color: colors.notification, marginTop: 8 }}>
            {error}
          </ThemedText>
        ) : null}

        {/* Wyniki z ikoną i modalem */}
        {result && (
          <View style={styles.results}>
            {Object.entries(result).map(([k, v]) => (
              <View key={k} style={styles.resultItem}>
                <TouchableOpacity style={styles.resultRow} onPress={() => showDescription(k)}>
                  <ThemedText type="button" style={{ color: colors.text }}>
                    {t(`wmaFactor.results.labels.${k}`)}
                  </ThemedText>
                  <View style={styles.valueContainer}>
                    <ThemedText type="button" style={{ color: colors.text }}>
                      {v}
                    </ThemedText>
                    <MaterialCommunityIcons
                      name="information-outline"
                      size={20}
                      style={{ color: colors.primary, marginLeft: 6 }}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal z opisem */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedTitle}</Text>
            <Text style={styles.modalText}>{selectedDescription}</Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>{getCloseLabel()}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Modal: ogólna informacja o kalkulatorze */}
      <Modal
        animationType="fade"
        transparent
        visible={infoVisible}
        onRequestClose={() => setInfoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('wmaFactor.title')}</Text>
            <Text style={styles.modalText}>{t('wmaFactor.description')}</Text>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
              onPress={() => setInfoVisible(false)}
            >
              <Text style={styles.closeButtonText}>{getCloseLabel()}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16 },
  infoContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  preset: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 4,
    width: '48%',
    marginBottom: 8,
  },
  full: { width: '100%', marginBottom: 16 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  results: { marginTop: 16 },
  resultItem: { marginBottom: 12 },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  valueContainer: { flexDirection: 'row', alignItems: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    color: '#000',
  },
  closeButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 4 },
  closeButtonText: {
    fontSize: 14,
    color: '#fff',
    textTransform: 'uppercase',
  },
});
