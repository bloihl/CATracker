import React from 'react';
import { View, Text, useColorScheme, StyleSheet } from 'react-native';
import CatScreen from '@/CatScreen';

function SettingsScreen(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <CatScreen
      isDarkMode={isDarkMode}
      data={[{ key: 'placeholder', title: 'Settings coming soon…' }]}
      renderDataItem={({ item }) => (
        <View style={styles.itemContainer}>
          <Text style={[styles.itemText, isDarkMode && styles.itemTextDark]}>
            {item.title}
          </Text>
        </View>
      )}
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
  },
  itemTextDark: {
    color: '#ddd',
  },
});

export default SettingsScreen;
