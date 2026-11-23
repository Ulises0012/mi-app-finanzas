import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { colors, spacing, fonts } from '@/constants/theme';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Completa ambos campos');
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (e: any) {
      setError(traducirError(e.code));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.eyebrow}>Bienvenido de nuevo</Text>
        <Text style={styles.title}>Inicia sesión</Text>
      </View>

      <View style={styles.form}>
        <Input placeholder="Correo electrónico" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Input placeholder="Contraseña" isPassword value={password} onChangeText={setPassword} />

        <Link href="/recuperar" style={styles.forgotLink}>
          <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
        </Link>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Entrar" onPress={handleLogin} loading={submitting} />
      </View>

      <Link href="/register" style={styles.link}>
        <Text style={styles.linkText}>¿No tienes cuenta? <Text style={styles.linkAccent}>Regístrate</Text></Text>
      </Link>
    </View>
  );
}

function traducirError(code: string) {
  switch (code) {
    case 'auth/invalid-email':
      return 'Correo inválido';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Correo o contraseña incorrectos';
    case 'auth/too-many-requests':
      return 'Demasiados intentos, espera un momento';
    default:
      return 'Algo falló, intenta de nuevo';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink, justifyContent: 'center', padding: spacing.lg, gap: spacing.xl },
  eyebrow: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.coral, marginBottom: 4 },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.textPrimary },
  form: { gap: spacing.md },
  forgotLink: { alignSelf: 'flex-end' },
  forgotText: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.textSecondary },
  error: { fontFamily: fonts.body, color: colors.coral, textAlign: 'center' },
  link: { alignSelf: 'center' },
  linkText: { fontFamily: fonts.body, color: colors.textSecondary, fontSize: 14 },
  linkAccent: { fontFamily: fonts.bodySemi, color: colors.coral },
});