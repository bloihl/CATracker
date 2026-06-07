import React, { useEffect, useState } from 'react';
import {useColorScheme, Text, View} from 'react-native';

import Section from '@/Section';
import CatScreen from '@/CatScreen';
import {openDatabase} from "@/db/Database";

// For now, using 'any' for flexibility, but should be replaced with actual type
interface RouteItem {
  route_short_name?: string;
  route_long_name?: string;
  route_id: string;
  // Add other relevant route properties here
}

interface RoutesScreenProps {
  navigation: any;
  routes: RouteItem[];
}

async function getRouteItems():Promise<RouteItem[]>{
    const db = await openDatabase({ name: 'app.db' });
    const routes = await db.execute("SELECT route_id, route_short_name, route_long_name FROM routes");
    const routeItems: RouteItem[] = []
    routes.rows.forEach(row => {
        const routeItem: RouteItem = {
            route_short_name: row.route_short_name,
            route_long_name: row.route_long_name,
            route_id: row.route_id,
        }
        routeItems.push(routeItem);
    });
    await db.close();

    return routeItems;
}
const DEFAULT_ROUTE_ITEM: RouteItem = { route_id: '0', route_short_name: 'White', route_long_name: 'White Line' };

function RoutesScreen({navigation}: any): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [routeData, setRouteData] = useState([DEFAULT_ROUTE_ITEM]);
  useEffect(() => {
    const loadData = async () => {
      const data = await getRouteItems();
      setRouteData(data);
    }
    loadData();
  },[])

  if (!routeData || routeData.length === 0) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>No routes data available.</Text>
      </View>
    );
  }

  return (
    <CatScreen
      isDarkMode={isDarkMode}
      data={routeData}
      renderDataItem={({item}: {item: RouteItem}) => {
        const title = item.route_long_name || item.route_short_name || `Route ID: ${item.route_id}`;
        return (
          <Section
            title={title}
            onPressHandler={() =>
              navigation.navigate('Route', {routeId: `${item.route_id}`, routeName: `${item.route_long_name}`})
            }
            isDarkMode={isDarkMode}
          />
        );
      }}
    />
  );
}

export default RoutesScreen;