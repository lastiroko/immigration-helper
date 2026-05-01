import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../src/store/auth';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 13, color: '#64748b' }}>Signed in as</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#0f172a' }}>{user?.name}</Text>
        <Text style={{ color: '#475569' }}>{user?.email}</Text>
        <Text style={{ marginTop: 4, color: '#94a3b8', fontSize: 12 }}>Tier: {user?.subscriptionTier}</Text>
      </View>

      <TouchableOpacity onPress={logout}
        style={{ marginHorizontal: 16, padding: 14, backgroundColor: '#fff', borderRadius: 8, alignItems: 'center' }}>
        <Text style={{ color: '#dc2626', fontWeight: '600' }}>Log out</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 32, paddingHorizontal: 20 }}>
        <Text style={{ color: '#94a3b8', fontSize: 11 }}>
          Helfa v0.1.0 · Imprint, Privacy, Terms available at helfa.app/imprint etc.
        </Text>
      </View>
    </ScrollView>
  );
}
