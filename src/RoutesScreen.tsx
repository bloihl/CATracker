import React from 'react';
import {useColorScheme, Text, View} from 'react-native';

import Section from '@/Section';
import CatScreen from '@/CatScreen';

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

function RoutesScreen({navigation, routes}: RoutesScreenProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  if (!routes || routes.length === 0) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>No routes data available.</Text>
      </View>
    );
  }

  return (
    <CatScreen
      isDarkMode={isDarkMode}
      data={routes}
      renderDataItem={({item}: {item: RouteItem}) => {
        const title = item.route_short_name || item.route_long_name || `Route ID: ${item.route_id}`;
        return (
          <Section
            title={title}
            onPressHandler={() =>
              navigation.navigate('Route', {busRouteId: `${item.route_id}`})
            }
            isDarkMode={isDarkMode}
          />
        );
      }}
    />
  );
}

export default RoutesScreen;