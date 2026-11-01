import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputInstance,
  type TextInputProps,
  View,
} from 'react-native';

import { colors, fonts } from '@/theme';

type Props = TextInputProps & {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  error?: string;
  /** Adds a show/hide eye button and hides the characters by default. */
  isPassword?: boolean;
  inputRef?: React.Ref<TextInputInstance>;
};

/** Labelled text field with an icon, an animated focus ring and an inline error. */
export default function AppInput({
  label,
  icon,
  error,
  isPassword = false,
  inputRef,
  onFocus,
  onBlur,
  ...rest
}: Props) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const focus = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focus, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: false, // animating colors can't use the native driver
    }).start();
  }, [focused, focus]);

  const borderColor = error
    ? colors.danger
    : focus.interpolate({ inputRange: [0, 1], outputRange: [colors.line, colors.dawn] });
  const backgroundColor = focus.interpolate({ inputRange: [0, 1], outputRange: [colors.mist, colors.white] });
  const iconColor = error ? colors.danger : focused ? colors.dawn : colors.slate;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <Animated.View style={[styles.field, { borderColor, backgroundColor }, focused && styles.fieldFocused]}>
        <Ionicons name={icon} size={20} color={iconColor} />

        <TextInput
          {...rest}
          ref={inputRef}
          style={styles.input}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.dawn}
          secureTextEntry={isPassword && hidden}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />

        {isPassword ? (
          <Pressable
            onPress={() => setHidden((value) => !value)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Show password' : 'Hide password'}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.slate} />
          </Pressable>
        ) : null}
      </Animated.View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.ink,
    marginBottom: 8,
    marginLeft: 2,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 54,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  fieldFocused: {
    shadowColor: colors.dawn,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.ink,
    paddingVertical: 0,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.danger,
    marginTop: 6,
    marginLeft: 4,
  },
});
