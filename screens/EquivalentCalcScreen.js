// screens/EquivalentCalcScreen.js
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const DISTANCE_PRESETS = ['5', '10', '21.0975', '42.195'];
const TARGET_DISTANCES = ['5', '10', '21.0975', '42.195', '3', '1.5'];
const RIEGEL_EXPONENT = 1.06;

export default function EquivalentCalcScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();

  const [distance, setDistance] = useState(DISTANCE_PRESETS[0]);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
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

  const formatPace = (t, d) => {
    const spk = t / d;
    const m = Math.floor(spk / 60);
    const s = Math.round(spk % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  const calculateEquivalents = () => {
    Keyboard.dismiss();
    const d = parseFloat(distance.replace(',', '.'));
    const totalSec = toSeconds(hours, minutes, seconds);
    if (isNaN(d) || d <= 0 || totalSec <= 0) {
      setError(t('equivalentCalc.errors.invalidInput'));
      setResults(null);
      return;
    }
    setError('');
    const res = TARGET_DISTANCES.map((value) => {
      const key =
        value === '21.0975'
          ? 'halfMarathon'
          : value === '42.195'
          ? 'marathon'
          : value === '1.5'
          ? '1_5'
          : value;
      const eq = totalSec * Math.pow(value / d, RIEGEL_EXPONENT);
      return {
        key,
        time: formatHMS(eq),
        pace: formatPace(eq, value),
      };
    });
    setResults(res);
  };

  const handlePreset = (v) => {
    Keyboard.dismiss();
    setDistance(v);
    setError('');
    setResults(null);
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

        <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 8 }}>
          {t('equivalentCalc.selectRaceLabel')}
        </ThemedText>
        <View style={styles.presets}>
          {DISTANCE_PRESETS.map((value) => {
            const key =
              value === '21.0975'
                ? 'halfMarathon'
                : value === '42.195'
                ? 'marathon'
                : value;
            return (
              <TouchableOpacity
                key={value}
                style={[
                  styles.preset,
                  {
                    borderColor: colors.primary,
                    backgroundColor: distance === value ? colors.primary : 'transparent',
                  },
                ]}
                onPress={() => handlePreset(value)}
              >
                <ThemedText type="button" style={{ color: distance === value ? '#fff' : colors.text }}>
                  {t(`equivalentCalc.presets.${key}`)}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        <ThemedText type="subtitle" style={{ color: colors.text, marginBottom: 8 }}>
          {t('equivalentCalc.finishTimeLabel')}
        </ThemedText>
        <View style={styles.timeRow}>
          <NumericInput value={hours} onChangeText={setHours} placeholder={t('equivalentCalc.placeholders.hours')} />
          <NumericInput value={minutes} onChangeText={setMinutes} placeholder={t('equivalentCalc.placeholders.minutes')} />
          <NumericInput value={seconds} onChangeText={setSeconds} placeholder={t('equivalentCalc.placeholders.seconds')} />
        </View>

        <Button title={t('equivalentCalc.buttons.calculate')} onPress={calculateEquivalents} color={colors.primary} />

        {error ? (
          <ThemedText type="caption" style={{ color: colors.notification, marginTop: 8 }}>
            {error}
          </ThemedText>
        ) : null}

        {results && (
          <View style={styles.resultsContainer}>
            <View style={styles.headerRow}>
              <ThemedText type="button" style={[styles.header, { color: colors.text, flex: 2 }]}>
                {t('equivalentCalc.table.race')}
              </ThemedText>
              <ThemedText type="button" style={[styles.header, { color: colors.text, flex: 1, textAlign: 'center' }]}>
                {t('equivalentCalc.table.time')}
              </ThemedText>
              <ThemedText type="button" style={[styles.header, { color: colors.text, flex: 1, textAlign: 'center' }]}>
                {t('equivalentCalc.table.pace')}
              </ThemedText>
            </View>
            {results.map(({ key, time, pace }) => (
              <View key={key} style={styles.resultRow}>
                <ThemedText type="body" style={{ color: colors.text, flex: 2 }}>
                  {t(`equivalentCalc.targets.${key}`)}
                </ThemedText>
                <ThemedText type="body" style={{ color: colors.text, flex: 1, textAlign: 'center' }}>
                  {time}
                </ThemedText>
                <ThemedText type="body" style={{ color: colors.text, flex: 1, textAlign: 'center' }}>
                  {pace}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal: ogólna informacja o kalkulatorze */}
      <Modal
        animationType="fade"
        transparent
        visible={infoVisible}
        onRequestClose={() => setInfoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('equivalentCalc.title')}</Text>
            <Text style={styles.modalText}>{t('equivalentCalc.description')}</Text>
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
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    width: '48%',
    marginBottom: 8,
  },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  resultsContainer: { marginTop: 16 },
  headerRow: { flexDirection: 'row', marginBottom: 8, borderBottomWidth: 1, borderColor: '#ccc', paddingBottom: 4 },
  header: { fontWeight: 'bold' },
  resultRow: { flexDirection: 'row', paddingVertical: 4 },
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
    textAlign: 'center',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
    color: '#000',
  },
  closeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  closeButtonText: {
    fontSize: 14,
    color: '#fff',
    textTransform: 'uppercase',
  },
});
