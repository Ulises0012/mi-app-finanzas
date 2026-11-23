import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { colors, spacing, fonts } from '@/constants/theme';

export default function Recuperar() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleEnviar = async () => {
    setError('');
    if (!email.trim()) {
      setError('Ingresa tu correo');
      return;
    }
    setSubmitting(true);
    try {
      await resetPassword(email.trim());
      setEnviado(true);
    } catch (e: any) {
      setError(traducirError(e.code));
    } finally {
      setSubmitting(false);
    }
  };

  if (enviado) {
    return (
      <View style={styles.container}>
        <View style={styles.successBox}>
          <Ionicons name="mail-outline" size={48} color={colors.mint} />
          <Text style={styles.successTitle}>Revisa tu correo</Text>
          <Text style={styles.successBody}>Te enviamos un enlace a {email} para crear una nueva contraseña.</Text>
        </View>
        <Button label="Volver a iniciar sesión" variant="ghost" onPress={() => router.replace('/login')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.eyebrow}>¿Se te olvidó?</Text>
        <Text style={styles.title}>Recupera tu contraseña</Text>
        <Text style={styles.subtitle}>Te mandamos un enlace a tu correo para crear una nueva.</Text>
      </View>

      <View style={styles.form}>
        <Input placeholder="Correo electrónico" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Enviar enlace" onPress={handleEnviar} loading={submitting} />
      </View>

      <Link href="/login" style={styles.link}>
        <Text style={styles.linkText}>Volver a <Text style={styles.linkAccent}>iniciar sesión</Text></Text>
      </Link>
    </View>
  );
}

function traducirError(code: string) {
  switch (code) {
    case 'auth/invalid-email':
      return 'Correo inválido';
    case 'auth/user-not-found':
      return 'No hay ninguna cuenta con ese correo';
    case 'auth/too-many-requests':
      return 'Demasiados intentos, espera un momento';
    default:
      return 'Algo falló, intenta de nuevo';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink, justifyContent: 'center', padding: spacing.lg, gap: spacing.xl },
  eyebrow: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.mint, marginBottom: 4 },
  title: { fontFamily: fonts.display, fontSize: 28, color: colors.textPrimary },
  subtitle: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, marginTop: 8, lineHeight: 20 },
  form: { gap: spacing.md },
  error: { fontFamily: fonts.body, color: colors.coral, textAlign: 'center' },
  link: { alignSelf: 'center' },
  linkText: { fontFamily: fonts.body, color: colors.textSecondary, fontSize: 14 },
  linkAccent: { fontFamily: fonts.bodySemi, color: colors.mint },
  successBox: { alignItems: 'center', gap: 12, marginBottom: spacing.md },
  successTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.textPrimary },
  successBody: { fontFamily: fonts.body, fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
});