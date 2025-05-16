// components/NumericInput.js
import React, { forwardRef } from 'react';
import { StyleSheet, TextInput } from 'react-native';

const NumericInput = forwardRef(function NumericInput(
  { value, onChangeText, placeholder, style, ...rest },
  ref
) {
  const handleFocus = () => {
    if (value === '0') onChangeText('');
  };

  return (
    <TextInput
      ref={ref}
      style={[styles.input, style, { color: '#222' }]}
      keyboardType="numeric"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#AAA"
      onFocus={handleFocus}
      blurOnSubmit={true}  // ważne!
      {...rest}
    />
  );
});

export default NumericInput;

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
