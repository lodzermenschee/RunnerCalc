import React, { useEffect, useRef, useState } from 'react';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';

export default function CustomSwitch({ value, onValueChange }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const shadowAnim = useRef(new Animated.Value(value ? 6 : 2)).current;
  const [pressed, setPressed] = useState(false);

  // Stały, neutralny szary kolor
  const switchColor = '#bbbbbb';
  const borderColorOn = '#888';
  const borderColorOff = '#cccccc';

  useEffect(() => {
    Animated.spring(anim, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      friction: 6,
      tension: 120,
    }).start();

    Animated.spring(shadowAnim, {
      toValue: value ? 6 : 2,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [borderColorOff, borderColorOn],
  });

  const thumbPosition = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 32],
  });

  // Rozmiar thumb przy tapnięciu
  const thumbScale = pressed
    ? new Animated.Value(1.13)
    : anim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1],
      });

  // Cień thumb
  const thumbShadow = shadowAnim.interpolate({
    inputRange: [2, 6],
    outputRange: [2, 6],
  });

  const handlePressIn = () => setPressed(true);
  const handlePressOut = () => setPressed(false);

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={() => onValueChange(!value)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.switch,
          {
            backgroundColor: switchColor,
            borderColor: borderColor,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              left: thumbPosition,
              transform: [{ scale: thumbScale }],
              shadowRadius: thumbShadow,
              shadowColor: '#888',
              backgroundColor: '#fff',
              borderColor: value ? '#888' : '#aaa',
              opacity: pressed ? 0.86 : 1,
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  switch: {
    width: 60,
    height: 32,
    borderRadius: 18,
    justifyContent: 'center',
    padding: 2,
    borderWidth: 2,
  },
  thumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    position: 'absolute',
    top: 2,
    borderWidth: 2,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
  },
});
