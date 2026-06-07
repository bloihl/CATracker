import React, {useEffect, useState} from 'react';
import {Database, openDatabase} from '@/db/Database';

import {Text, useColorScheme} from 'react-native';

import Section from '@/Section';
import CatScreen from '@/CatScreen';

const DEFAULT_ROUTES: {routeId: string, routeName: string, routeTimes: string[]}[] = [{routeId: '0', routeName: 'Route 0', routeTimes: ['']}];

async function getRoutes(db: Database, stopId: string) {
    const routeItems: { routeId: string, routeName: string, routeTimes: string[] }[] = [];
    const routes = await db.execute(`SELECT rs.route_id, routes.route_long_name FROM route_stops rs JOIN routes ON rs.route_id = routes.route_id WHERE stop_id = ${stopId}`);
    for( const row of routes.rows){
        const now = new Date();
        const times = await db.execute(`SELECT st.arrival_time FROM trips t JOIN stop_times st ON t.trip_id = st.trip_id WHERE t.route_id = ${row.route_id} AND st.stop_id = ${stopId} ORDER BY st.arrival_time ASC`);
        const routeTimes: string[] = [];
        times.rows.forEach(timeRow => {
            const date = new Date();
            date.setHours(timeRow.arrival_time.split(':')[0], timeRow.arrival_time.split(':')[1], timeRow.arrival_time.split(':')[2]);
            console.log(`db value: ${timeRow.arrival_time}`);
            console.log(`date value: ${date.toString()}`);
            console.log(`now value: ${now.toString()}`);
            if(date > now) {
                console.log(`adding time: ${timeRow.arrival_time}`);
                routeTimes.push(timeRow.arrival_time);
            }
        })
        if (routeTimes.length === 0) { //next trip is tomorrow
            const date = new Date();
            date.setHours(times.rows[0].arrival_time.split(':')[0], times.rows[0].arrival_time.split(':')[1], times.rows[0].arrival_time.split(':')[2]);
            routeTimes.push(date.toLocaleString());
        }
        const routeItem: { routeId: string, routeName: string, routeTimes: string[] } = {
            routeId: row.route_id,
            routeName: row.route_long_name,
            routeTimes,
        };
        routeItems.push(routeItem);
    }
    return routeItems;
}

function StopScreen({navigation, route}: { navigation: any; route: any }): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const {stopId, stopName} = route.params;
  const [routes, setRoutes] = useState(DEFAULT_ROUTES);

  useEffect(() => {
      const loadData = async () => {
          const db = await openDatabase({ name: 'app.db' });
          return await getRoutes(db, stopId);
      }
      loadData().then(data => setRoutes(data));
  },[]);
  return (
    <CatScreen
      isDarkMode={isDarkMode}
      data={routes}
      renderDataItem={({item}) => {
        const titleString = `${item.routeName} \nNext Arrival Time: ${item.routeTimes[0]}`;
        return (
          <Section
            title={titleString}
            onPressHandler={() => {navigation.navigate('Route', {routeId: `${ item.routeId }`, routeName: `${ item.routeName }`}) }}
            isDarkMode={isDarkMode}
          />
        );
      }}>
      <Text>{stopName}</Text>
      <Text>Stop Id: {stopId}</Text>
    </CatScreen>
  );
}

export default StopScreen;
