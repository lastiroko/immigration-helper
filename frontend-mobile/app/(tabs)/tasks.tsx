import { useQuery } from '@tanstack/react-query';
import { FlatList, Text, TouchableOpacity, View, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { taskApi } from '../../src/api/client';
import type { TaskDto, TaskStatus } from '../../src/api/types';

const FILTERS: (TaskStatus | 'ALL')[] = ['ALL', 'UPCOMING', 'DUE', 'OVERDUE', 'COMPLETE'];

const STATUS_COLOR: Record<TaskStatus, { bg: string; fg: string }> = {
  UPCOMING: { bg: '#f1f5f9', fg: '#475569' },
  DUE:      { bg: '#fef9c3', fg: '#854d0e' },
  OVERDUE:  { bg: '#fee2e2', fg: '#b91c1c' },
  COMPLETE: { bg: '#dcfce7', fg: '#166534' },
  SKIPPED:  { bg: '#f1f5f9', fg: '#94a3b8' },
};

export default function TasksScreen() {
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const router = useRouter();

  const q = useQuery({
    queryKey: ['tasks', filter],
    queryFn: async () => {
      const r = await taskApi.list(filter === 'ALL' ? { size: 100 } : { status: filter, size: 100 });
      return r.data.items;
    },
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 12, backgroundColor: '#fff' }}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)}
            style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
                     backgroundColor: filter === f ? '#2563eb' : '#f1f5f9' }}>
            <Text style={{ color: filter === f ? '#fff' : '#475569', fontSize: 13, fontWeight: '500' }}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={q.data ?? []}
        keyExtractor={(t) => t.id}
        refreshControl={<RefreshControl refreshing={q.isFetching} onRefresh={() => q.refetch()} />}
        ListEmptyComponent={
          q.isLoading
            ? <ActivityIndicator style={{ marginTop: 40 }} />
            : <Text style={{ textAlign: 'center', color: '#94a3b8', padding: 32 }}>No tasks in this filter.</Text>
        }
        renderItem={({ item }) => <TaskRow task={item} onPress={() => router.push(`/task/${item.id}`)} />}
      />
    </View>
  );
}

function TaskRow({ task, onPress }: { task: TaskDto; onPress: () => void }) {
  const c = STATUS_COLOR[task.status];
  return (
    <TouchableOpacity onPress={onPress}
      style={{ backgroundColor: '#fff', padding: 14, marginHorizontal: 12, marginTop: 10, borderRadius: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <View style={{ backgroundColor: c.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
          <Text style={{ color: c.fg, fontSize: 11, fontWeight: '600' }}>{task.status}</Text>
        </View>
        <Text style={{ color: '#94a3b8', fontSize: 11 }}>priority {task.priority}</Text>
      </View>
      <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172a' }}>{task.title}</Text>
      <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>
        {task.dueAt ? `Due ${new Date(task.dueAt).toLocaleDateString()}` : 'Blocked — waiting on a parent task'}
      </Text>
    </TouchableOpacity>
  );
}
