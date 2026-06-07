import React, {useState, useEffect} from 'react';
import {Database, openDatabase} from '@/db/Database';

import {Text, useColorScheme} from 'react-native';

import Section from '@/Section';
import CatScreen from '@/CatScreen';

const DEFAULT_ROUTES: {routeId: string, routeName: string}[] = [{routeId: '0', routeName: 'Route 0'}];

async function getRoutes(db: Database, stopId: string) {
    const routeItems: { routeId: string, routeName: string }[] = [];
    const routes = await db.execute(`SELECT rs.route_id, routes.route_long_name FROM route_stops rs JOIN routes ON rs.route_id = routes.route_id WHERE stop_id = ${stopId}`);
    routes.rows.forEach(row => {
        const routeItem: { routeId: string, routeName: string } = {
            routeId: row.route_id,
            routeName: row.route_long_name,
        };
        routeItems.push(routeItem);
    });
    return routeItems;
}

function StopScreen({navigation, route}: { navigation: any; route: any }): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const {stopId, stopName} = route.params;
  const [routes, setRoutes] = useState(DEFAULT_ROUTES);

  useEffect(() => {
      const loadData = async () => {
          const db = await openDatabase({ name: 'app.db' });
          const routeItems = await getRoutes(db, stopId);
          return routeItems;
      }
      loadData().then(data => setRoutes(data));
  },[]);
  return (
    <CatScreen
      isDarkMode={isDarkMode}
      data={routes}
      renderDataItem={({item}) => {
        const titleString = `${item.routeName}`;
        return (
          <Section
            title={titleString}
            onPressHandler={() => {navigation.navigate('Route', {routeId: `${ item.routeId }`, routeName: `${ item.routeName }`}) }}
            isDarkMode={isDarkMode}
          />
        );
      }}>
      <Text>Stop Id: {stopId}</Text>
      <Text>Stop Name: {stopName}</Text>
    </CatScreen>
  );
}

export default StopScreen;
