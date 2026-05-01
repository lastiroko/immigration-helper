import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { profileApi } from '../src/api/client';

/**
 * Smart-router landing screen: send the user to onboarding if they have no
 * profile yet, otherwise drop them on the task list.
 */
export default function Index() {
  const router = useRouter();
  useEffect(() => {
    profileApi.get()
      .then(() => router.replace('/(tabs)/tasks'))
      .catch((e) => {
        if (e.response?.status === 404) router.replace('/onboarding');
        else router.replace('/(tabs)/tasks');
      });
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
