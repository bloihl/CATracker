import React, {useEffect, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {FlatList, Text, View, ListRenderItem} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {useTheme} from '@react-navigation/native';

import styles from '@/AppStyle';
import CatHeader from '@/CatHeader';
import {openDatabase} from "@/db/Database.ts";

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

  const [freshnessDate, setFreshnessDate] = useState<Date>(new Date(0));
  useEffect(() => {
    const loadFreshnessDate = async () => {
      const db = await openDatabase({ name: 'app.db' });
      const data = await db.execute("SELECT MAX(last_updated) freshnessDate FROM feed_meta");
      if(data.rows.length != 1) {
        console.error("Unexpected number of rows in feed_meta table: ", data.rows.length);
      } else {
        setFreshnessDate(new Date(data.rows[0].freshnessDate));
      }
    }
    loadFreshnessDate();
  }, [])

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
            <Text style={{ color: colors.text }}>Data current as of {freshnessDate.toDateString()}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

export default CatScreen;
