import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../src/store/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();

  const submit = async () => {
    setError(''); setBusy(true);
    try { await login(email, password); }
    catch (e: any) { setError(e.response?.data?.message ?? 'Login failed'); }
    finally { setBusy(false); }
  };

  return (
    <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f8fafc' }}>
      <Text style={{ fontSize: 32, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>Helfa</Text>
      <Text style={{ textAlign: 'center', color: '#64748b', marginBottom: 32 }}>Welcome back</Text>

      {error ? <Text style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: 12, borderRadius: 8, marginBottom: 12 }}>{error}</Text> : null}

      <Text style={{ marginBottom: 4, color: '#334155', fontSize: 13 }}>Email</Text>
      <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"
        style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 12 }} />

      <Text style={{ marginBottom: 4, color: '#334155', fontSize: 13 }}>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry
        style={{ backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#cbd5e1', marginBottom: 16 }} />

      <TouchableOpacity onPress={submit} disabled={busy}
        style={{ backgroundColor: busy ? '#94a3b8' : '#2563eb', padding: 14, borderRadius: 8, alignItems: 'center' }}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '600' }}>Log in</Text>}
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
        <Text style={{ color: '#64748b' }}>No account? </Text>
        <Link href="/(auth)/register" style={{ color: '#2563eb', fontWeight: '600' }}>Register</Link>
      </View>
    </ScrollView>
  );
}
