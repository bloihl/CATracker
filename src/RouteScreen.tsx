import React, {useEffect, useState} from 'react';
import {Text, useColorScheme, View} from 'react-native';

import Section from '@/Section';
import CatScreen from '@/CatScreen';
import {openDatabase} from "@/db/Database";
import {getArrivalDate} from "@/gtfs/utils/time.ts";
import styles from '@/AppStyle';

interface StopItem {
    stopId: string;
    stopName: string;
    nextTripId: string;
    nextArrivalTime: string;
}

const DEFAULT_STOPS: StopItem[] = [{
    stopId: '0',
    stopName: 'Stop 0',
    nextTripId: 'N/A',
    nextArrivalTime: '08:00:00'
}];

async function loadStops(busRouteId: string) {
    const db = await openDatabase({ name: 'app.db' });
    const sql  = `
        SELECT s.stop_id, s.stop_name, st.arrival_time, st.trip_id, st.stop_sequence
        FROM trips t 
            JOIN stop_times st ON t.trip_id = st.trip_id
            JOIN stops s ON st.stop_id = s.stop_id
        WHERE t.route_id = ?
        ORDER BY st.stop_sequence, st.arrival_time ASC
    `;
    const res = await db.execute(sql, [busRouteId]);

    const now = new Date();
    const groupedByStop: Record<string, {
        name: string,
        sequence: number,
        entries: {tripId: string, arrivalTime: string}[]
    }> = {};

    res.rows.forEach(row => {
        if (!groupedByStop[row.stop_id]) {
            groupedByStop[row.stop_id] = {
                name: row.stop_name,
                sequence: row.stop_sequence,
                entries: []
            };
        }
        groupedByStop[row.stop_id].entries.push({
            tripId: row.trip_id,
            arrivalTime: row.arrival_time
        });
    });

    const stopItems: StopItem[] = [];

    // Sort unique stops by their sequence
    const sortedStopIds = Object.keys(groupedByStop).sort((a, b) => groupedByStop[a].sequence - groupedByStop[b].sequence);

    for (const stopId of sortedStopIds) {
        const { name, entries } = groupedByStop[stopId];
        let nextTripId = '';
        let nextArrivalTime = '';

        for (const entry of entries) {
            const date = getArrivalDate(entry.arrivalTime);
            if (date > now) {
                nextTripId = entry.tripId;
                nextArrivalTime = date.toLocaleTimeString();
                break;
            }
        }

        if (!nextArrivalTime && entries.length > 0) { // next trip is tomorrow
            const entry = entries[0];
            const date = getArrivalDate(entry.arrivalTime);
            date.setDate(date.getDate() + 1);
            nextTripId = entry.tripId;
            nextArrivalTime = date.toLocaleString();
        }

        stopItems.push({
            stopId,
            stopName: name,
            nextTripId,
            nextArrivalTime
        });
    }
    return stopItems;
}

function RouteScreen({navigation, route}: { navigation: any; route: any }): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [stops, setStops] = useState(DEFAULT_STOPS);
  const {routeId} = route.params;
  const {routeName} = route.params;

  const textStyle = isDarkMode ? styles.sectionDescriptionDark : styles.sectionDescriptionLight;

  useEffect(() => {
      const loadData = async () => {
          setStops(await loadStops(routeId));
      }
      loadData();
  }, [routeId]);

  return (
    <CatScreen
      isDarkMode={isDarkMode}
      data= {stops}
      renderDataItem={({item}) => {
        return (
          <Section
            title={item.stopName}
            onPressHandler={() =>
              navigation.navigate('Stop', {stopId: `${item.stopId}`, stopName: `${item.stopName}`})
            }
            isDarkMode={isDarkMode}
          >
              <View style={styles.sectionDescription}>
                  <Text style={textStyle}>Next Arrival: {item.nextArrivalTime}</Text>
                  <Text style={textStyle}>Trip ID: {item.nextTripId}</Text>
              </View>
          </Section>
        );
      }}>
      <Text>Route Name: {routeName}</Text>
      <Text>Route Id: {routeId}</Text>
    </CatScreen>
  );
}
export default RouteScreen;