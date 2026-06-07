import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, useColorScheme, StyleSheet, Button, ActivityIndicator } from 'react-native';
import CatScreen from '@/CatScreen';
import { DEFAULT_FEEDS } from '@/gtfs/feeds';
import { refreshFeed } from '@/gtfs/service';
import type { Progress } from '@/gtfs/types';

function SettingsScreen(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [loadingKey, setLoadingKey] = useState<string | null>(null);
  const [status, setStatus] = useState<Record<string, string>>({});

  const feeds = useMemo(() => DEFAULT_FEEDS, []);

  const handleReload = useCallback(async (key: string, url: string, name?: string) => {
    if (loadingKey) return;
    setLoadingKey(key);
    setStatus(s => ({ ...s, [key]: 'Starting…' }));
    try {
      await refreshFeed({
        feed: { key, url, name },
        onProgress: (p: Progress) => setStatus(s => ({ ...s, [key]: `${p.phase}${p.message ? `: ${p.message}` : ''}` })),
      });
      setStatus(s => ({ ...s, [key]: 'Done' }));
    } catch (e: any) {
      setStatus(s => ({ ...s, [key]: `Error: ${e?.message || e}` }));
    } finally {
      setLoadingKey(null);
    }
  }, [loadingKey]);

  return (
    <CatScreen
      isDarkMode={isDarkMode}
      data={feeds.map(f => ({ key: f.key, title: f.name || f.key }))}
      renderDataItem={({ item }: { item: { key: string; title: string } }) => {
        const feed = feeds.find(f => f.key === item.key)!;
        const isLoading = loadingKey === feed.key;
        const msg = status[feed.key];
        return (
          <View style={styles.itemContainer}>
            <Text style={[styles.itemText, isDarkMode && styles.itemTextDark]}>{item.title}</Text>
            <View style={styles.row}>
              <Button title={isLoading ? 'Reloading…' : 'Reload data'} onPress={() => handleReload(feed.key, feed.url, feed.name)} disabled={isLoading} />
              {isLoading && <ActivityIndicator style={{ marginLeft: 12 }} />}
            </View>
            {!!msg && (
              <Text style={[styles.statusText, isDarkMode && styles.itemTextDark]}>{msg}</Text>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  itemText: {
    fontSize: 16,
    color: '#222',
    marginBottom: 8,
  },
  itemTextDark: {
    color: '#ddd',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.8,
  },
});

export default SettingsScreen;
