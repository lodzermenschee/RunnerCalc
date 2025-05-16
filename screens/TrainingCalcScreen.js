import { useTheme, useNavigation } from '@react-navigation/native';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Pressable,
} from 'react-native';
import NumericInput from '../components/NumericInput';
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
  const navigation = useNavigation();
  const { colors, dark } = useTheme();
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

  // Modal edycji czasu
  const [editMode, setEditMode] = useState('none');
  const [activeTimeField, setActiveTimeField] = useState('hours');

  const inputRefs = {
    hours: useRef(null),
    minutes: useRef(null),
    seconds: useRef(null),
  };

  // Focus na odpowiednie pole w modalu, jak w SpeedCalcScreen
  useEffect(() => {
    if (editMode === 'time') {
      setTimeout(() => {
        if (inputRefs[activeTimeField]?.current) {
          inputRefs[activeTimeField].current.focus();
        }
      }, 100);
    }
  }, [editMode, activeTimeField]);

  useEffect(() => {
    if (editMode === 'none') {
      Keyboard.dismiss();
    }
  }, [editMode]);

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
      {/* HEADER */}
      <View style={styles.customHeaderRow}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <MaterialCommunityIcons
            name="arrow-left-circle"
            size={34}
            color={dark ? '#fff' : '#333'}
          />
        </TouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Text
            style={[
              styles.headerTitleBig,
              { color: dark ? '#fff' : '#222' }
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {t('home.trainingCalculator')}
          </Text>
          <TouchableOpacity onPress={() => setInfoVisible(true)} style={styles.infoIcon}>
            <MaterialCommunityIcons
              name="information-outline"
              size={22}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.container}>
        {/* Dystans */}
        <Text
          style={{
            color: dark ? '#fff' : '#000',
            fontFamily: 'Montserrat_700Bold',
            fontSize: 15,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          {t('trainingCalc.distanceLabel')}
        </Text>
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
                    borderColor: '#B8D8FF',
                    backgroundColor: distance === d ? '#B8D8FF' : 'transparent',
                  },
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  setDistance(d);
                  setError('');
                  setResults(null);
                }}
              >
                <Text
                  style={{
                    color: distance === d ? '#222' : dark ? '#fff' : colors.text,
                    fontFamily: 'Montserrat_700Bold',
                    fontSize: 16,
                  }}
                >
                  {t(`trainingCalc.presets.${key}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Czas ukończenia */}
        <Text
          style={{
            color: dark ? '#fff' : '#000',
            fontFamily: 'Montserrat_700Bold',
            fontSize: 15,
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          {t('trainingCalc.finishTimeLabel')}
        </Text>
        <View style={styles.timeRow}>
          <TouchableOpacity
            style={styles.timeInputTouch}
            onPress={() => {
              setActiveTimeField('hours');
              setEditMode('time');
            }}
          >
            <NumericInput
              value={hours}
              onChangeText={setHours}
              placeholder=""
              style={[styles.timeBoxBig, { color: '#222' }]}
              editable={false}
              keyboardType="numeric"
            />
            <Text style={styles.unitLabel}>g</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.timeInputTouch}
            onPress={() => {
              setActiveTimeField('minutes');
              setEditMode('time');
            }}
          >
            <NumericInput
              value={minutes}
              onChangeText={setMinutes}
              placeholder=""
              style={[styles.timeBoxBig, { color: '#222' }]}
              editable={false}
              keyboardType="numeric"
            />
            <Text style={styles.unitLabel}>min</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.timeInputTouch}
            onPress={() => {
              setActiveTimeField('seconds');
              setEditMode('time');
            }}
          >
            <NumericInput
              value={seconds}
              onChangeText={setSeconds}
              placeholder=""
              style={[styles.timeBoxBig, { color: '#222' }]}
              editable={false}
              keyboardType="numeric"
            />
            <Text style={styles.unitLabel}>s</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#B8D8FF' }]}
          onPress={calculateTrainingPaces}
        >
          <Text style={styles.buttonText}>
            {t('trainingCalc.buttons.calculateTraining')}
          </Text>
        </TouchableOpacity>

        {error ? (
          <Text style={{ color: colors.notification, marginTop: 12, fontFamily: 'Montserrat_700Bold' }}>
            {error}
          </Text>
        ) : null}

        {results && (
          <View style={styles.resultsContainer}>
            {Object.entries(results).map(([type, val]) => (
              <View key={type} style={styles.resultSection}>
                <TouchableOpacity
                  style={styles.resultRow}
                  onPress={() => showDescription(type)}
                >
                  <Text style={{
                    color: dark ? '#fff' : colors.text,
                    fontFamily: 'Montserrat_700Bold',
                    fontSize: 15,
                  }}>
                    {t(`trainingCalc.factors.${type}.title`)}:
                  </Text>
                  <View style={styles.valueContainer}>
                    <Text style={{
                      color: dark ? '#fff' : colors.text,
                      fontFamily: 'Montserrat_700Bold',
                      fontSize: 15,
                    }}>
                      {type === 'Easy'
                        ? `${val.low} ~ ${val.high} min/km`
                        : `${val} min/km`}
                    </Text>
                    <MaterialCommunityIcons
                      name="information-outline"
                      size={20}
                      style={{ color: '#1976D2', marginLeft: 6 }}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

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
              style={[styles.closeButton, { backgroundColor: '#B8D8FF' }]}
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
              style={[styles.closeButton, { backgroundColor: '#B8D8FF' }]}
              onPress={() => setInfoVisible(false)}
            >
              <Text style={styles.closeButtonText}>{getCloseLabel()}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal edycji czasu */}
      {editMode === 'time' && (
        <Modal
          animationType="slide"
          transparent
          visible={editMode === 'time'}
          onRequestClose={() => setEditMode('none')}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setEditMode('none')}
          >
            <View style={styles.modalCardWide}>
              <Text style={[styles.editLabel, { textAlign: 'center', alignSelf: 'center', color: dark ? '#fff' : '#000' }]}>
                {t('trainingCalc.finishTimeLabel')}
              </Text>
              <View style={styles.inputRowModalFinal}>
                <View style={styles.inputStack}>
                  <NumericInput
                    ref={inputRefs.hours}
                    value={hours}
                    onChangeText={setHours}
                    placeholder=""
                    style={[styles.inputModalFinal, { color: '#222' }]}
                    keyboardType="numeric"
                    autoFocus={activeTimeField === 'hours'}
                  />
                  <Text style={styles.timeLabelModalFinal}>g</Text>
                </View>
                <View style={styles.inputStack}>
                  <NumericInput
                    ref={inputRefs.minutes}
                    value={minutes}
                    onChangeText={setMinutes}
                    placeholder=""
                    style={[styles.inputModalFinal, { color: '#222' }]}
                    keyboardType="numeric"
                    autoFocus={activeTimeField === 'minutes'}
                  />
                  <Text style={styles.timeLabelModalFinal}>min</Text>
                </View>
                <View style={styles.inputStack}>
                  <NumericInput
                    ref={inputRefs.seconds}
                    value={seconds}
                    onChangeText={setSeconds}
                    placeholder=""
                    style={[styles.inputModalFinal, { color: '#222' }]}
                    keyboardType="numeric"
                    autoFocus={activeTimeField === 'seconds'}
                  />
                  <Text style={styles.timeLabelModalFinal}>s</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.okButton, { alignSelf: 'center', marginTop: 18 }]}
                onPress={() => {
                  Object.values(inputRefs).forEach(ref => {
                    if (ref.current) ref.current.blur();
                  });
                  setEditMode('none');
                  setTimeout(() => {
                    Keyboard.dismiss();
                  }, 100);
                }}
              >
                <Text style={styles.okButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  customHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 52,
    marginBottom: 6,
    marginLeft: 4,
    width: '100%',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 18,
    justifyContent: 'flex-start',
  },
  headerTitleBig: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 20,
    letterSpacing: 1,
    flexShrink: 1,
    maxWidth: '84%',
  },
  infoIcon: {
    marginLeft: 2,
  },
  container: {
    padding: 16,
    paddingBottom: 36,
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  presetButton: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    width: '48%',
    marginBottom: 4,
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    gap: 8,
  },
  timeInputTouch: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  unitLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    gap: 14,
  },
  unitLabel: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    width: 78,
  },
  timeBoxBig: {
    borderWidth: 1,
    borderColor: '#B8D8FF',
    borderRadius: 6,
    width: 78,
    padding: 10,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 18,
    backgroundColor: '#F6FAFF',
    color: '#222',
    textAlign: 'center',
    marginHorizontal: 2,
  },
  button: {
    marginTop: 12,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#B8D8FF',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
    color: '#111',
    textTransform: 'none',
    letterSpacing: 1,
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
  // Modal do edycji czasu
  modalCardWide: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    width: '93%',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    alignItems: 'center',
  },
  editLabel: {
    color: '#000',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 17,
    marginBottom: 14,
    marginLeft: 4,
    textAlign: 'left',
  },
  inputRowModalFinal: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 12,
    width: '100%',
  },
  inputStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputModalFinal: {
    borderWidth: 1,
    borderColor: '#B8D8FF',
    borderRadius: 6,
    padding: 8,
    width: '85%',
    maxWidth: 62,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 18,
    color: '#222',
    backgroundColor: '#F6FAFF',
    textAlign: 'center',
    marginBottom: 2,
  },
  timeLabelModalFinal: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 15,
    color: '#888',
    marginTop: 2,
    textAlign: 'center',
  },
  okButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 28,
    backgroundColor: '#B8D8FF',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#B8D8FF',
    shadowOpacity: 0.13,
    shadowRadius: 2,
    elevation: 2,
  },
  okButtonText: {
    color: '#111',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
    letterSpacing: 1,
  },
});
