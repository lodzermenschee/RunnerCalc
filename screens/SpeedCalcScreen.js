import { useTheme } from '@react-navigation/native';
import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Pressable,
} from 'react-native';
import NumericInput from '../components/NumericInput';
import { useFonts, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import { AnimatePresence, MotiView } from 'moti';

const DISTANCE_PRESETS = ['5', '10', '21.0975', '42.195'];
const pastelBlue = '#B8D8FF';
const labelGray = '#888';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SpeedCalcScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  let [fontsLoaded] = useFonts({ Montserrat_700Bold });

  const [mode, setMode] = useState('pace');
  const [distance, setDistance] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [paceMin, setPaceMin] = useState('');
  const [paceSec, setPaceSec] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState('none'); // 'none' | 'distance' | 'time'

  const inputRefs = {
    distance: useRef(null),
    hours: useRef(null),
    minutes: useRef(null),
    seconds: useRef(null),
    paceMin: useRef(null),
    paceSec: useRef(null),
  };

  if (!fontsLoaded) return null;

  const handleModeChange = (newMode) => {
    Keyboard.dismiss();
    setError('');
    setResult(null);
    setMode(newMode);
    setPaceMin('');
    setPaceSec('');
    setHours('');
    setMinutes('');
    setSeconds('');
  };

  const calculatePace = () => {
    Keyboard.dismiss();
    setEditMode('none');
    const dist = parseFloat(distance.replace(',', '.'));
    const h = parseInt(hours, 10) || 0;
    const m = parseInt(minutes, 10) || 0;
    const s = parseInt(seconds, 10) || 0;
    if (isNaN(dist) || dist <= 0) {
      setError(t('speedCalc.errors.invalidDistance'));
      return;
    }
    if (m < 0 || s < 0 || m > 59 || s > 59) {
      setError(t('speedCalc.errors.invalidMinSec'));
      return;
    }
    const totalSec = h * 3600 + m * 60 + s;
    if (totalSec <= 0) {
      setError(t('speedCalc.errors.nonZeroTime'));
      return;
    }
    const secPerKm = totalSec / dist;
    const pMin = Math.floor(secPerKm / 60);
    const pSec = Math.round(secPerKm % 60);
    setResult({ paceMin: pMin, paceSec: pSec });
    setError('');
  };

  const calculateTime = () => {
    Keyboard.dismiss();
    setEditMode('none');
    const dist = parseFloat(distance.replace(',', '.'));
    const pMin = parseInt(paceMin, 10) || 0;
    const pSec = parseInt(paceSec, 10) || 0;
    if (isNaN(dist) || dist <= 0) {
      setError(t('speedCalc.errors.invalidDistance'));
      return;
    }
    if (pMin < 0 || pSec < 0 || pSec > 59) {
      setError(t('speedCalc.errors.paceFormat'));
      return;
    }
    const secPerKm = pMin * 60 + pSec;
    if (secPerKm <= 0) {
      setError(t('speedCalc.errors.nonZeroPace'));
      return;
    }
    const totalSec = secPerKm * dist;
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = Math.round(totalSec % 60);
    setResult({ hours: h, minutes: m, seconds: s });
    setError('');
  };

  const handlePreset = (value) => {
    Keyboard.dismiss();
    setDistance(value);
    setError('');
    setResult(null);
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
        {/* Przełącznik trybu */}
        <View style={styles.modeSwitch}>
          {['pace', 'time'].map((m) => (
            <TouchableOpacity
              key={m}
              style={[
                styles.modeButton,
                {
                  borderColor: pastelBlue,
                  backgroundColor: mode === m ? pastelBlue : 'transparent',
                },
              ]}
              onPress={() => handleModeChange(m)}
            >
              <Text
                style={{
                  color: mode === m ? '#222' : colors.text,
                  fontFamily: 'Montserrat_700Bold',
                  fontSize: 16,
                }}
              >
                {t(`speedCalc.mode.${m}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ODSTĘP między przełącznikami a presetami */}
        <View style={{ height: 32 }} />

        {/* Presety */}
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
                    borderColor: pastelBlue,
                    backgroundColor: distance === d ? pastelBlue : 'transparent',
                  },
                ]}
                onPress={() => handlePreset(d)}
              >
                <Text
                  style={{
                    color: distance === d ? '#222' : colors.text,
                    fontFamily: 'Montserrat_700Bold',
                    fontSize: 16,
                  }}
                >
                  {t(`speedCalc.presets.${key}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* DUŻY ODSTĘP MIĘDZY PRESETAMI A POLEM DYSTANSU */}
        <View style={{ height: 40 }} />

        {/* Własny dystans */}
        <Text
          style={{
            color: '#000',
            textAlign: 'center',
            marginTop: 0,
            marginBottom: 6,
            fontFamily: 'Montserrat_700Bold',
            fontSize: 15,
          }}
        >
          {t('speedCalc.customDistanceLabel')}
        </Text>
        <View style={styles.inputRow}>
          <NumericInput
            ref={inputRefs.distance}
            value={distance}
            onChangeText={setDistance}
            placeholder={t('speedCalc.placeholders.distance')}
            style={styles.input}
            keyboardType="decimal-pad"
            onFocus={() => setEditMode('distance')}
          />
          <Text style={styles.inputUnit}>km</Text>
        </View>

        {/* DUŻY ODSTĘP MIĘDZY POLEM DYSTANSU A CZASEM */}
        <View style={{ height: 32 }} />

        {/* NAPIS NAD POLAMI DO CZASU LUB TEMPA */}
        {mode === 'pace' ? (
          <Text
            style={{
              color: '#000',
              textAlign: 'center',
              fontFamily: 'Montserrat_700Bold',
              fontSize: 15,
              marginBottom: 6,
            }}
          >
            Czas ukończenia
          </Text>
        ) : (
          <Text
            style={{
              color: '#000',
              textAlign: 'center',
              fontFamily: 'Montserrat_700Bold',
              fontSize: 15,
              marginBottom: 6,
            }}
          >
            Tempo (min./km)
          </Text>
        )}

        {/* Dane do obliczeń */}
        {mode === 'pace' ? (
          <View style={styles.inputRow}>
            <View style={styles.timeInput}>
              <NumericInput
                ref={inputRefs.hours}
                value={hours}
                onChangeText={setHours}
                placeholder=""
                style={styles.timeBoxBig}
                keyboardType="numeric"
                onFocus={() => setEditMode('time')}
              />
              <Text style={styles.timeLabel}>h</Text>
            </View>
            <View style={styles.timeInput}>
              <NumericInput
                ref={inputRefs.minutes}
                value={minutes}
                onChangeText={setMinutes}
                placeholder=""
                style={styles.timeBoxBig}
                keyboardType="numeric"
                onFocus={() => setEditMode('time')}
              />
              <Text style={styles.timeLabel}>min</Text>
            </View>
            <View style={styles.timeInput}>
              <NumericInput
                ref={inputRefs.seconds}
                value={seconds}
                onChangeText={setSeconds}
                placeholder=""
                style={styles.timeBoxBig}
                keyboardType="numeric"
                onFocus={() => setEditMode('time')}
              />
              <Text style={styles.timeLabel}>s</Text>
            </View>
          </View>
        ) : (
          <View style={styles.inputRow}>
            <View style={styles.timeInput}>
              <NumericInput
                ref={inputRefs.paceMin}
                value={paceMin}
                onChangeText={setPaceMin}
                placeholder=""
                style={styles.timeBoxBig}
                keyboardType="numeric"
                onFocus={() => setEditMode('time')}
              />
              <Text style={styles.timeLabel}>min</Text>
            </View>
            <View style={styles.timeInput}>
              <NumericInput
                ref={inputRefs.paceSec}
                value={paceSec}
                onChangeText={setPaceSec}
                placeholder=""
                style={styles.timeBoxBig}
                keyboardType="numeric"
                onFocus={() => setEditMode('time')}
              />
              <Text style={styles.timeLabel}>s</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: pastelBlue }]}
          onPress={mode === 'pace' ? calculatePace : calculateTime}
        >
          <Text style={styles.buttonText}>
            {mode === 'pace'
              ? t('speedCalc.buttons.calculatePace')
              : t('speedCalc.buttons.calculateTime')}
          </Text>
        </TouchableOpacity>

        {error ? (
          <Text style={{ color: colors.notification, marginTop: 12, fontFamily: 'Montserrat_700Bold' }}>
            {error}
          </Text>
        ) : null}

        {result && (
          <View style={{ marginTop: 24, alignItems: 'center' }}>
            {mode === 'pace' ? (
              <Text
                style={{
                  color: colors.text,
                  fontFamily: 'Montserrat_700Bold',
                  fontSize: 20,
                  letterSpacing: 1,
                }}
              >
                {t('speedCalc.results.pace', {
                  paceMin: result.paceMin,
                  paceSec: result.paceSec < 10 ? `0${result.paceSec}` : result.paceSec,
                })}
              </Text>
            ) : (
              <Text
                style={{
                  color: colors.text,
                  fontFamily: 'Montserrat_700Bold',
                  fontSize: 20,
                  letterSpacing: 1,
                }}
              >
                {t('speedCalc.results.time', {
                  hours: result.hours,
                  minutes: result.minutes < 10 ? `0${result.minutes}` : result.minutes,
                  seconds: result.seconds < 10 ? `0${result.seconds}` : result.seconds,
                })}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* MODAL TRYBU EDYCJI – DYSTANS */}
      <AnimatePresence>
        {editMode === 'distance' && (
          <MotiView
            from={{ opacity: 0, translateY: 60 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 60 }}
            transition={{ type: 'timing', duration: 320 }}
            style={styles.modalOverlay}
          >
            <Pressable style={styles.modalBg} onPress={() => setEditMode('none')} />
            <MotiView
              from={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'timing', duration: 300 }}
              style={styles.modalCard}
            >
              <Text style={styles.editLabel}>Wpisz własny dystans</Text>
              <View style={styles.inputRowModal}>
                <NumericInput
                  ref={inputRefs.distance}
                  value={distance}
                  onChangeText={setDistance}
                  placeholder={t('speedCalc.placeholders.distance')}
                  style={styles.inputModal}
                  keyboardType="decimal-pad"
                  autoFocus
                />
                <Text style={styles.inputUnitModal}>km</Text>
              </View>
              <TouchableOpacity
                style={styles.okButton}
                onPress={() => {
                  Keyboard.dismiss();
                  setEditMode('none');
                }}
              >
                <Text style={styles.okButtonText}>OK</Text>
              </TouchableOpacity>
            </MotiView>
          </MotiView>
        )}

        {/* MODAL TRYBU EDYCJI – CZAS UKOŃCZENIA/TEMPO */}
        {editMode === 'time' && (
          <MotiView
            from={{ opacity: 0, translateY: 60 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: 60 }}
            transition={{ type: 'timing', duration: 320 }}
            style={styles.modalOverlay}
          >
            <Pressable style={styles.modalBg} onPress={() => setEditMode('none')} />
            <MotiView
              from={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'timing', duration: 300 }}
              style={styles.modalCardWide}
            >
              <Text style={[styles.editLabel, { textAlign: 'center', alignSelf: 'center' }]}>
                {mode === 'pace' ? 'Czas ukończenia' : 'Tempo (min./km)'}
              </Text>
              <View style={styles.inputRowModalFinal}>
                {mode === 'pace' ? (
                  <>
                    <View style={styles.inputStack}>
                      <NumericInput
                        ref={inputRefs.hours}
                        value={hours}
                        onChangeText={setHours}
                        placeholder=""
                        style={styles.inputModalFinal}
                        keyboardType="numeric"
                        autoFocus
                      />
                      <Text style={styles.timeLabelModalFinal}>h</Text>
                    </View>
                    <View style={styles.inputStack}>
                      <NumericInput
                        ref={inputRefs.minutes}
                        value={minutes}
                        onChangeText={setMinutes}
                        placeholder=""
                        style={styles.inputModalFinal}
                        keyboardType="numeric"
                      />
                      <Text style={styles.timeLabelModalFinal}>min</Text>
                    </View>
                    <View style={styles.inputStack}>
                      <NumericInput
                        ref={inputRefs.seconds}
                        value={seconds}
                        onChangeText={setSeconds}
                        placeholder=""
                        style={styles.inputModalFinal}
                        keyboardType="numeric"
                      />
                      <Text style={styles.timeLabelModalFinal}>s</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.inputStack}>
                      <NumericInput
                        ref={inputRefs.paceMin}
                        value={paceMin}
                        onChangeText={setPaceMin}
                        placeholder=""
                        style={styles.inputModalFinal}
                        keyboardType="numeric"
                        autoFocus
                      />
                      <Text style={styles.timeLabelModalFinal}>min</Text>
                    </View>
                    <View style={styles.inputStack}>
                      <NumericInput
                        ref={inputRefs.paceSec}
                        value={paceSec}
                        onChangeText={setPaceSec}
                        placeholder=""
                        style={styles.inputModalFinal}
                        keyboardType="numeric"
                      />
                      <Text style={styles.timeLabelModalFinal}>s</Text>
                    </View>
                  </>
                )}
              </View>
              <TouchableOpacity
                style={[styles.okButton, { alignSelf: 'center', marginTop: 18 }]}
                onPress={() => {
                  Keyboard.dismiss();
                  setEditMode('none');
                }}
              >
                <Text style={styles.okButtonText}>
                  {mode === 'pace' ? 'Oblicz tempo' : 'Oblicz czas'}
                </Text>
              </TouchableOpacity>
            </MotiView>
          </MotiView>
        )}
      </AnimatePresence>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16 },
  modeSwitch: { flexDirection: 'row', marginBottom: 20 },
  modeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  presetsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  presetButton: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    width: '48%',
    marginBottom: 4,
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    marginBottom: 12,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#B8D8FF',
    borderRadius: 6,
    padding: 8,
    width: 100,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
    color: '#222',
    backgroundColor: '#F6FAFF',
    marginRight: 8,
    textAlign: 'center',
  },
  inputUnit: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 15,
    color: labelGray,
  },
  timeInput: {
    alignItems: 'center',
    marginHorizontal: 4,
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
  },
  timeLabel: {
    fontSize: 13,
    color: labelGray,
    marginTop: 2,
    fontFamily: 'Montserrat_700Bold',
    letterSpacing: 0.5,
    textTransform: 'lowercase',
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
  // Modal & animacja
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(30,30,30,0.28)',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    width: SCREEN_WIDTH * 0.82,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    alignItems: 'stretch',
  },
  modalCardWide: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    width: SCREEN_WIDTH * 0.93,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
    alignItems: 'center',
  },
  inputRowModal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 12,
    marginTop: 8,
  },
  inputUnitModal: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 16,
    color: labelGray,
  },
  inputModal: {
    borderWidth: 1,
    borderColor: '#B8D8FF',
    borderRadius: 6,
    padding: 8,
    width: 120,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 18,
    color: '#222',
    backgroundColor: '#F6FAFF',
    marginRight: 8,
    textAlign: 'center',
  },
  // OSTATECZNY styl do idealnych odstępów i szerokości
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
    color: labelGray,
    marginTop: 2,
    textAlign: 'center',
  },
  editLabel: {
    color: '#000',
    fontFamily: 'Montserrat_700Bold',
    fontSize: 17,
    marginBottom: 14,
    marginLeft: 4,
    textAlign: 'left',
  },
  okButton: {
    marginTop: 12,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 28,
    backgroundColor: pastelBlue,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: pastelBlue,
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
