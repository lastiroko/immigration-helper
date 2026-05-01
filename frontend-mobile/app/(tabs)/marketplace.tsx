import { useQuery } from '@tanstack/react-query';
import { FlatList, Text, View, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useState } from 'react';
import { marketplaceApi } from '../../src/api/client';
import type { PartnerCard, PartnerCategory } from '../../src/api/types';

const CATEGORIES: (PartnerCategory | 'ALL')[] = ['ALL', 'BANK', 'INSURANCE', 'HOUSING', 'TRANSLATION', 'LANGUAGE', 'LEGAL', 'TAX'];

export default function MarketplaceScreen() {
  const [filter, setFilter] = useState<PartnerCategory | 'ALL'>('ALL');

  const q = useQuery({
    queryKey: ['partners', filter],
    queryFn: async () => (await marketplaceApi.list(filter === 'ALL' ? undefined : filter)).data,
  });

  const click = async (slug: string) => {
    try {
      const r = await marketplaceApi.click(slug);
      await Linking.openURL(r.data.redirectUrl);
    } catch { /* swallow — user can hit the partner directly */ }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: 12, backgroundColor: '#fff' }}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c} onPress={() => setFilter(c)}
            style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14,
                     backgroundColor: filter === c ? '#2563eb' : '#f1f5f9' }}>
            <Text style={{ color: filter === c ? '#fff' : '#475569', fontSize: 12, fontWeight: '500' }}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={q.data ?? []}
        keyExtractor={(p) => p.id}
        ListEmptyComponent={q.isLoading ? <ActivityIndicator style={{ marginTop: 40 }} /> : null}
        renderItem={({ item }) => <PartnerRow p={item} onPress={() => click(item.slug)} />}
      />
    </View>
  );
}

function PartnerRow({ p, onPress }: { p: PartnerCard; onPress: () => void }) {
  return (
    <View style={{ backgroundColor: '#fff', padding: 14, marginHorizontal: 12, marginTop: 10, borderRadius: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#0f172a' }}>{p.name}</Text>
          <Text style={{ color: '#94a3b8', fontSize: 11 }}>{p.category}</Text>
        </View>
        {p.rating != null && <Text style={{ color: '#ca8a04', fontSize: 13 }}>★ {Number(p.rating).toFixed(1)}</Text>}
      </View>
      <Text style={{ color: '#64748b', fontSize: 11, fontStyle: 'italic', marginTop: 8 }}>{p.commissionDisclosure}</Text>
      <TouchableOpacity onPress={onPress}
        style={{ backgroundColor: '#2563eb', padding: 10, borderRadius: 8, marginTop: 12, alignItems: 'center' }}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>Visit {p.name} →</Text>
      </TouchableOpacity>
    </View>
  );
}
