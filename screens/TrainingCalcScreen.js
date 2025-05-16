import { useTheme } from '@react-navigation/native';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
} from 'react-native';
import NumericInput from '../components/NumericInput';
import { ThemedText } from '../components/ThemedText';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const DISTANCE_PRESETS = ['5', '10', '21.0975', '42.195'];

const FACTORS = {
  Easy: { low: 1.18, high: 1.30 },
  Marathon: { factor: 1.0425 },
  Threshold: { factor: 0.98 },
  Interval: { factor: 0.90 },
  Repetition: { factor: 0.84 },
};

export default function TrainingCalcScreen() {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();

  const [distance, setDistance] = useState(DISTANCE_PRESETS[0]);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [infoVisible, setInfoVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [selectedDescription, setSelectedDescription] = useState('');

  const toSeconds = (h, m, s) =>
    (parseInt(h, 10) || 0) * 3600 +
    (parseInt(m, 10) || 0) * 60 +
    (parseInt(s, 10) || 0);

  const formatPace = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
  };

  const calculateTrainingPaces = () => {
    Keyboard.dismiss();
    const d = parseFloat(distance.replace(',', '.'));
    const totalSec = toSeconds(hours, minutes, seconds);
    if (isNaN(d) || d <= 0 || totalSec <= 0) {
      setError(t('trainingCalc.errors.invalidInput'));
      setResults(null);
      return;
    }
    const res = {};
    Object.entries(FACTORS).forEach(([type, data]) => {
      if (type === 'Easy') {
        const low = (totalSec / d) * data.low;
        const high = (totalSec / d) * data.high;
        res.Easy = { low: formatPace(low), high: formatPace(high) };
      } else {
        const secPerKm = (totalSec / d) * data.factor;
        res[type] = formatPace(secPerKm);
      }
    });
    setResults(res);
    setError('');
  };

  const showDescription = (type) => {
    const title = t(`trainingCalc.factors.${type}.title`);
    let desc = t(`trainingCalc.factors.${type}.description`);
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

        {/* Dystans */}
        <ThemedText
          type="subtitle"
          style={{ color: colors.text, marginBottom: 8 }}
        >
          {t('trainingCalc.distanceLabel')}
        </ThemedText>
        <View style={styles.presetsContainer}>
          {DISTANCE_PRESETS.map((d) => {
            const key =
              d === '21.0975'
                ? 'halfMarathon'
                : d === '42.195'
                ? 'marathon'
                : d;
            return (
              <TouchableOpacity
                key={d}
                style={[
                  styles.presetButton,
                  {
                    borderColor: colors.primary,
                    backgroundColor:
                      distance === d ? colors.primary : 'transparent',
                  },
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setDistance(d);
                  setError('');
                  setResults(null);
                }}
              >
                <ThemedText
                  type="button"
                  style={{ color: distance === d ? '#fff' : colors.text }}
                >
                  {t(`trainingCalc.presets.${key}`)}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Czas ukończenia */}
        <ThemedText
          type="subtitle"
          style={{ color: colors.text, marginBottom: 8 }}
        >
          {t('trainingCalc.finishTimeLabel')}
        </ThemedText>
        <View style={styles.timeRow}>
          <NumericInput
            value={hours}
            onChangeText={setHours}
            placeholder={t('trainingCalc.placeholders.hours')}
          />
          <NumericInput
            value={minutes}
            onChangeText={setMinutes}
            placeholder={t('trainingCalc.placeholders.minutes')}
          />
          <NumericInput
            value={seconds}
            onChangeText={setSeconds}
            placeholder={t('trainingCalc.placeholders.seconds')}
          />
        </View>

        <Button
          title={t('trainingCalc.buttons.calculateTraining')}
          onPress={calculateTrainingPaces}
          color={colors.primary}
        />

        {error ? (
          <ThemedText
            type="caption"
            style={{ color: colors.notification, marginTop: 12 }}
          >
            {error}
          </ThemedText>
        ) : null}

        {results && (
          <View style={styles.resultsContainer}>
            {Object.entries(results).map(([type, val]) => (
              <View key={type} style={styles.resultSection}>
                <TouchableOpacity
                  style={styles.resultRow}
                  onPress={() => showDescription(type)}
                >
                  <ThemedText type="button" style={{ color: colors.text }}>
                    {t(`trainingCalc.factors.${type}.title`)}:
                  </ThemedText>
                  <View style={styles.valueContainer}>
                    <ThemedText type="button" style={{ color: colors.text }}>
                      {type === 'Easy'
                        ? `${val.low} ~ ${val.high} min/km`
                        : `${val} min/km`}
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

      {/* Modal: opis pojedynczego wyniku */}
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
            <Text style={styles.modalTitle}>{t('trainingCalc.title')}</Text>
            <Text style={styles.modalText}>{t('trainingCalc.description')}</Text>
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
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  presetButton: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 8,
    width: '48%',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  resultsContainer: { marginTop: 16 },
  resultSection: { marginBottom: 16 },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
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
