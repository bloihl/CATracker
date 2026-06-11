import React, {useEffect, useState} from 'react';
import {openDatabase} from '@/db/Database';

import {Text, useColorScheme, View} from 'react-native';

import Section from '@/Section';
import CatScreen from '@/CatScreen';
import { getArrivalDate } from '@/gtfs/utils/time';
import styles from '@/AppStyle';

const DEFAULT_ROUTES: {routeId: string, routeName: string, routeTimes: string[]}[] = [{routeId: '0', routeName: 'Route 0', routeTimes: ['']}];

async function getRoutes(stopId: string) {
    const db = await openDatabase({ name: 'app.db' });
    const routeItems: { routeId: string, routeName: string, routeTimes: string[] }[] = [];
    // Combined query to get routes and their arrival times for this stop
    const sql = `
        SELECT
            r.route_id,
            r.route_long_name,
            st.arrival_time
        FROM routes r
        JOIN trips t ON r.route_id = t.route_id
        JOIN stop_times st ON t.trip_id = st.trip_id
        WHERE st.stop_id = ?
        ORDER BY r.route_id, st.arrival_time ASC
    `;
    const res = await db.execute(sql, [stopId]);

    const now = new Date();
    const groupedByRoute: Record<string, {name: string, times: string[]}> = {};

    res.rows.forEach(row => {
        if (!groupedByRoute[row.route_id]) {
            groupedByRoute[row.route_id] = { name: row.route_long_name, times: [] };
        }
        groupedByRoute[row.route_id].times.push(row.arrival_time);
    });

    for (const routeId in groupedByRoute) {
        const { name, times } = groupedByRoute[routeId];
        const routeTimes: string[] = [];

        for (const arrivalTime of times) {
            const date = getArrivalDate(arrivalTime);
            if (date > now) {
                routeTimes.push(date.toLocaleTimeString());
            }
        }

        if (routeTimes.length === 0 && times.length > 0) { //next trip is tomorrow
            const earliestArrivalTime = times[0];
            const earliestArrivalTimeTomorrow = getArrivalDate(earliestArrivalTime);
            earliestArrivalTimeTomorrow.setDate(earliestArrivalTimeTomorrow.getDate() + 1);
            routeTimes.push(earliestArrivalTimeTomorrow.toLocaleString());
        }

        routeItems.push({
            routeId,
            routeName: name,
            routeTimes
        });
    }

    return routeItems;
}

function StopScreen({navigation, route}: { navigation: any; route: any }): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const {stopId, stopName} = route.params;
  const [routes, setRoutes] = useState(DEFAULT_ROUTES);

  const textStyle = isDarkMode ? styles.sectionDescriptionDark : styles.sectionDescriptionLight;

  useEffect(() => {
      const loadData = async () => {
          setRoutes( await getRoutes(stopId));
      }
      loadData();
  },[]);
  return (
    <CatScreen
      isDarkMode={isDarkMode}
      data={routes}
      renderDataItem={({item}) => {
        return (
          <Section
            title={item.routeName}
            onPressHandler={() => {navigation.navigate('Route', {routeId: `${ item.routeId }`, routeName: `${ item.routeName }`}) }}
            isDarkMode={isDarkMode}
          >
              <View style={styles.sectionDescription}>
                  <Text style={textStyle}>Next Arrival Time: {item.routeTimes[0]}</Text>
              </View>
          </Section>
        );
      }}>
      <Text>{stopName}</Text>
      <Text>Stop Id: {stopId}</Text>
    </CatScreen>
  );
}

export default StopScreen;
