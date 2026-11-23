import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { colors, spacing, fonts, radius } from '@/constants/theme';

export default function Register() {
  const { signUp } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tieneNegocio, setTieneNegocio] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!nombre.trim()) {
      setError('Ingresa tu nombre');
      return;
    }
    if (!email || !password) {
      setError('Completa correo y contraseña');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email.trim(), password, nombre.trim(), tieneNegocio);
    } catch (e: any) {
      setError(traducirError(e.code));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.eyebrow}>Empecemos</Text>
        <Text style={styles.title}>Crea tu cuenta</Text>
      </View>

      <View style={styles.form}>
        <Input placeholder="Nombre" value={nombre} onChangeText={setNombre} />
        <Input placeholder="Correo electrónico" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
        <Input placeholder="Contraseña (mín. 6 caracteres)" isPassword value={password} onChangeText={setPassword} />

        <Text style={styles.label}>¿Usarás la app también para un negocio?</Text>
        <View style={styles.toggleRow}>
          <Pressable style={[styles.toggleBtn, !tieneNegocio && { backgroundColor: colors.surfaceHigh }]} onPress={() => setTieneNegocio(false)}>
            <Text style={[styles.toggleText, !tieneNegocio && { color: colors.textPrimary }]}>Solo personal</Text>
          </Pressable>
          <Pressable style={[styles.toggleBtn, tieneNegocio && { backgroundColor: colors.mint }]} onPress={() => setTieneNegocio(true)}>
            <Text style={[styles.toggleText, tieneNegocio && { color: colors.ink }]}>Personal + negocio</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label="Crear cuenta" onPress={handleRegister} loading={submitting} />
      </View>

      <Link href="/login" style={styles.link}>
        <Text style={styles.linkText}>¿Ya tienes cuenta? <Text style={styles.linkAccent}>Inicia sesión</Text></Text>
      </Link>
    </View>
  );
}

function traducirError(code: string) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Ese correo ya está registrado';
    case 'auth/invalid-email':
      return 'Correo inválido';
    case 'auth/weak-password':
      return 'La contraseña es muy débil';
    default:
      return 'Algo falló, intenta de nuevo';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.ink, justifyContent: 'center', padding: spacing.lg, gap: spacing.xl },
  eyebrow: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.mint, marginBottom: 4 },
  title: { fontFamily: fonts.display, fontSize: 32, color: colors.textPrimary },
  form: { gap: spacing.md },
  label: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs },
  toggleRow: { flexDirection: 'row', gap: 8, backgroundColor: colors.surface, padding: 4, borderRadius: radius.md },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.sm, alignItems: 'center' },
  toggleText: { fontFamily: fonts.bodySemi, color: colors.textSecondary, fontSize: 13 },
  error: { fontFamily: fonts.body, color: colors.coral, textAlign: 'center' },
  link: { alignSelf: 'center' },
  linkText: { fontFamily: fonts.body, color: colors.textSecondary, fontSize: 14 },
  linkAccent: { fontFamily: fonts.bodySemi, color: colors.mint },
});