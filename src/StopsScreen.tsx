import React,{useEffect, useState} from 'react';
import {useColorScheme, Text, View} from 'react-native';
import {openDatabase} from "@/db/Database";

import Section from '@/Section';
import CatScreen from '@/CatScreen';

// For now, using 'any' for flexibility, but should be replaced with actual type
interface StopItem {
  stop_name?: string;
  stop_code?: string;
  stop_id: string;
  // Add other relevant stop properties here
}

async function getStopItems():Promise<StopItem[]>{
    const db = await openDatabase({ name: 'app.db' });
    const stops = await db.execute("SELECT stop_id, stop_name, stop_code FROM stops");
    const stopItems: StopItem[] = []
    stops.rows.forEach(row => {
        const stopItem: StopItem = {
            stop_name: row.stop_name,
            stop_code: row.stop_code,
            stop_id: row.stop_id,
        }
        stopItems.push(stopItem);
    });
    await db.close();

    return stopItems;
}

const DEFAULT_STOPS: StopItem[] = [{ stop_id: '0', stop_name: 'Stop 0' }];

function StopsScreen({navigation}: any): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [stops, setStops] = useState(DEFAULT_STOPS);
  useEffect(() => {
      const loadData = async () => {
          const data = await getStopItems();
          setStops(data);
      }
      loadData();
  })

  if (!stops || stops.length === 0) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>No stops data available.</Text>
      </View>
    );
  }

  return (
    <CatScreen
      isDarkMode={isDarkMode}
      data={stops}
      renderDataItem={({item}: {item: StopItem}) => {
        const title = item.stop_name || `Stop ID: ${item.stop_id}`;
        return (
          <Section
            title={title}
            onPressHandler={() => {
              navigation.navigate('Stop', {stopId: `${item.stop_id}`, stopName: `${item.stop_name}`});
            }}
            isDarkMode={isDarkMode}
          />
        );
      }}
    />
  );
}

export default StopsScreen;