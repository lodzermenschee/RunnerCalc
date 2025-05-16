// components/NumericInput.js
import { useTheme } from '@react-navigation/native';
import { StyleSheet, TextInput } from 'react-native';

export default function NumericInput({ value, onChangeText, placeholder, style, ...rest }) {
  const { colors } = useTheme();

  const handleFocus = () => {
    if (value === '0') onChangeText('');
  };

  return (
    <TextInput
      style={[styles.input, style, { color: colors.text }]}
      keyboardType="numeric"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.text + '99'}
      onFocus={handleFocus}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    width: '30%',
    textAlign: 'center',
  },
});
