import React, {useEffect, useState} from 'react';
import {Text, useColorScheme} from 'react-native';

import Section from '@/Section';
import CatScreen from '@/CatScreen';
import {openDatabase} from "@/db/Database";
import {getArrivalDate} from "@/gtfs/utils/time.ts";

interface StopItem {stopId: string, stopName: string, stopTimes: string[]}

const DEFAULT_STOPS: StopItem[] = [{stopId: '0', stopName: 'Stop 0', stopTimes: ['08:00:00']}];

async function loadStops(busRouteId: string) {
    const db = await openDatabase({ name: 'app.db' });
    const stopItems: StopItem[] = [];
    const sql  = `
        SELECT s.stop_id, s.stop_name, st.arrival_time 
        FROM trips t 
            LEFT JOIN stop_times st ON t.trip_id = st.trip_id
            LEFT JOIN stops s ON st.stop_id = s.stop_id
        WHERE t.route_id = ?
        ORDER BY s.stop_id, st.arrival_time ASC
    `;
    const stops = await db.execute(sql, [busRouteId]);
    const groupedByStop: Record<string, {name: string, times: string[]}> = {};
    stops.rows.forEach(row => {
        if (!groupedByStop[row.stop_id]) {
            groupedByStop[row.stop_id] = { name: row.stop_name, times: [] };
        }
        groupedByStop[row.stop_id].times.push(row.arrival_time);
    });

    const now = new Date();
    for (const stopId in groupedByStop) {
        const { name, times } = groupedByStop[stopId];
        const stopTimes: string[] = [];

        for (const arrivalTime of times) {
            const date = getArrivalDate(arrivalTime);
            if (date > now) {
                stopTimes.push(date.toLocaleTimeString());
            }
        }

        if (stopTimes.length === 0 && times.length > 0) { //next trip is tomorrow
            const earliestArrivalTime = times[0];
            const earliestArrivalTimeTomorrow = getArrivalDate(earliestArrivalTime);
            earliestArrivalTimeTomorrow.setDate(earliestArrivalTimeTomorrow.getDate() + 1);
            stopTimes.push(earliestArrivalTimeTomorrow.toLocaleString());
        }

        stopItems.push({
            stopId,
            stopName: name,
            stopTimes
        });
    }
    return stopItems;
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
        const titleString = `${item.stopName}\nNext Arrival Time: ${item.stopTimes[0]}`;
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