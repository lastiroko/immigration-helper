import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { taskApi } from '../../src/api/client';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ['task', id],
    queryFn: async () => (await taskApi.get(id!)).data,
    enabled: Boolean(id),
  });

  const complete = async () => {
    try {
      await taskApi.complete(id!);
      qc.invalidateQueries({ queryKey: ['tasks'] });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message ?? 'Failed to complete');
    }
  };

  const skip = async () => {
    try {
      await taskApi.skip(id!);
      qc.invalidateQueries({ queryKey: ['tasks'] });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message ?? 'Failed to skip');
    }
  };

  if (q.isLoading) return <ActivityIndicator style={{ flex: 1 }} />;
  if (q.isError || !q.data) return <Text style={{ padding: 24 }}>Task not found.</Text>;

  const { task, journey } = q.data as any;
  const terminal = task.status === 'COMPLETE' || task.status === 'SKIPPED';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fafc' }} contentContainerStyle={{ padding: 16 }}>
      <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16 }}>
        <Text style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>
          {task.status} · priority {task.priority}{journey ? ` · ${journey.type.replace(/_/g, ' ')}` : ''}
        </Text>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#0f172a', marginBottom: 8 }}>{task.title}</Text>
        {task.description ? <Text style={{ color: '#475569', lineHeight: 22 }}>{task.description}</Text> : null}
        <Text style={{ color: '#64748b', fontSize: 13, marginTop: 12 }}>
          {task.dueAt ? `Due ${new Date(task.dueAt).toLocaleDateString()}` : 'Blocked — waiting for upstream task'}
        </Text>
      </View>

      {!terminal && (
        <View style={{ gap: 10 }}>
          <TouchableOpacity onPress={complete}
            style={{ backgroundColor: '#16a34a', padding: 14, borderRadius: 8, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>✓ Mark complete</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={skip}
            style={{ backgroundColor: '#fff', borderWidth: 1, borderColor: '#cbd5e1', padding: 14, borderRadius: 8, alignItems: 'center' }}>
            <Text style={{ color: '#475569', fontWeight: '600' }}>Skip</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
