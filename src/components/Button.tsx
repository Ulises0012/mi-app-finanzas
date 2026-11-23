import { Pressable, Text, StyleSheet, ActivityIndicator, PressableProps } from 'react-native';
import { colors, radius, fonts } from '@/constants/theme';

type ButtonProps = PressableProps & {
  label: string;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
};

export function Button({ label, loading, variant = 'primary', disabled, style, ...rest }: ButtonProps) {
  const isGhost = variant === 'ghost';
  return (
    <Pressable
      style={[styles.base, isGhost ? styles.ghost : styles.primary, disabled && styles.disabled, style as any]}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={isGhost ? colors.coral : colors.ink} />
      ) : (
        <Text style={[styles.label, isGhost && styles.labelGhost]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  primary: { backgroundColor: colors.coral },
  ghost: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.line },
  disabled: { opacity: 0.5 },
  label: { fontFamily: fonts.bodySemi, fontSize: 16, color: colors.ink },
  labelGhost: { color: colors.textPrimary },
});