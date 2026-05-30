import React from 'react';
import type {PropsWithChildren} from 'react';
import {FlatList, SafeAreaView, Text, View, ListRenderItem} from 'react-native';

import {useTheme} from '@react-navigation/native';

import styles from '@/AppStyle';
import CatHeader from '@/CatHeader';

type CatScreenProps<T> = PropsWithChildren<{
  data: ReadonlyArray<T>;
  renderDataItem: ListRenderItem<T>;
  isDarkMode: boolean;
}>;

function CatScreen<T>({children, data, renderDataItem, isDarkMode}: CatScreenProps<T>): React.JSX.Element {
  const { colors } = useTheme();
  const backgroundStyle = {
    backgroundColor: colors.background,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <FlatList<T>
        ListHeaderComponent={
          <CatHeader isDarkMode={isDarkMode}>{children}</CatHeader>
        }
        data={data}
        renderItem={renderDataItem}
        ListFooterComponent={
          <View style={styles.logoView}>
            <Text style={{ color: colors.text }}>Data current as of Jan 1, 2024</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

export default CatScreen;
