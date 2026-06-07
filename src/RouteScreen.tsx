import React, {useEffect, useState} from 'react';
import {Text, useColorScheme} from 'react-native';

import Section from '@/Section';
import CatScreen from '@/CatScreen';
import {Database, openDatabase} from "@/db/Database";

interface StopItem {stopId: string, stopName: string};

const DEFAULT_STOPS: StopItem[] = [{stopId: '0', stopName: 'Stop 0'}];

async function loadStops(busRouteId: string) {
    const db = await openDatabase({ name: 'app.db' });
    try {
        const stopItems: StopItem[] = [];
        const stops = await db.execute('SELECT rs.stop_id, stops.stop_name FROM route_stops rs JOIN stops ON rs.stop_id = stops.stop_id WHERE route_id = ?', [busRouteId]);
        stops.rows.forEach(row => {
            const stopItem: StopItem = {
                stopId: row.stop_id,
                stopName: row.stop_name,
            };
            stopItems.push(stopItem);
        });
        return stopItems;
    } finally {
        await db.close();
    }
}

function RouteScreen({navigation, route}: { navigation: any; route: any }): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [stops, setStops] = useState(DEFAULT_STOPS);
  const {routeId} = route.params;
  const {routeName} = route.params;
  useEffect(() => {
      const loadData = async () => {
          setStops(await loadStops(routeId));
      }
      loadData();
  }, []);

  return (
    <CatScreen
      isDarkMode={isDarkMode}
      data= {stops}
      renderDataItem={({item}) => {
        const titleString = `${item.stopName}`;
        return (
          <Section
            title={titleString}
            onPressHandler={() =>
              navigation.navigate('Stop', {stopId: `${item.stopId}`, stopName: `${item.stopName}`})
            }
            isDarkMode={isDarkMode}
          />
        );
      }}>
      <Text>Route Name: {routeName}</Text>
      <Text>Route Id: {routeId}</Text>
    </CatScreen>
  );
}
export default RouteScreen;