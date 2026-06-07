import React, {useEffect, useState} from 'react';
import {Text, useColorScheme} from 'react-native';

import Section from '@/Section';
import CatScreen from '@/CatScreen';
import {openDatabase} from "@/db/Database.ts";

interface StopItem {stopId: string, stopName: string};

const DEFAULT_STOPS: StopItem[] = [{stopId: '0', stopName: 'Stop 0'}];

function RouteScreen({navigation, route}: { navigation: any; route: any }): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [stops, setStops] = useState(DEFAULT_STOPS);
  const {busRouteId} = route.params;
  useEffect(() => {
      const loadData = async () => {
          const db = await openDatabase({ name: 'app.db' });
          const stops = await db.execute(`SELECT rs.stop_id, stops.stop_name FROM route_stops rs JOIN stops ON rs.stop_id = stops.stop_id WHERE route_id = ${busRouteId}`);
          const stopItems: StopItem[] = [];
          stops.rows.forEach(row => {
              const stopItem: {stopId: string, stopName: string} = {
                  stopId: row.stop_id,
                  stopName: row.stop_name,
              }
              stopItems.push(stopItem);
          });
          await db.close();
          return stopItems;
      }
      loadData().then(data => setStops(data));
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
              navigation.navigate('Stop', {stopId: `${item.stopId}`})
            }
            isDarkMode={isDarkMode}
          />
        );
      }}>
      <Text>Route Id: {busRouteId}</Text>
      <Text>Route Name: Route {busRouteId}</Text>
    </CatScreen>
  );
}
export default RouteScreen;