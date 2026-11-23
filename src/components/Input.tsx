import { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, fonts } from '@/constants/theme';

type InputProps = TextInputProps & { isPassword?: boolean };

export function Input({ isPassword, style, ...props }: InputProps) {
  const [oculto, setOculto] = useState(true);

  if (isPassword) {
    return (
      <View style={styles.passwordWrap}>
        <TextInput
          placeholderTextColor={colors.textTertiary}
          {...props}
          secureTextEntry={oculto}
          style={[styles.input, styles.inputWithIcon, style]}
        />
        <Pressable onPress={() => setOculto(!oculto)} style={styles.eyeBtn} hitSlop={8}>
          <Ionicons name={oculto ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textSecondary} />
        </Pressable>
      </View>
    );
  }

  return <TextInput placeholderTextColor={colors.textTertiary} {...props} style={[styles.input, style]} />;
}

const styles = StyleSheet.create({
  input: {
    height: 56,
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.md,
    paddingHorizontal: 18,
    fontSize: 16,
    fontFamily: fonts.body,
    color: colors.textPrimary,
  },
  passwordWrap: { justifyContent: 'center' },
  inputWithIcon: { paddingRight: 48 },
  eyeBtn: { position: 'absolute', right: 16 },
});