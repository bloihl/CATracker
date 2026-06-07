import React from 'react';

import {Text, useColorScheme} from 'react-native';

import Section from '@/Section';
import CatScreen from '@/CatScreen';

function StopScreen({navigation, route}: { navigation: any; route: any }): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const {stopId} = route.params;

  return (
    <CatScreen
      isDarkMode={isDarkMode}
      data={[
        {routeId: 1, key: 'route1'},
        {routeId: 2, key: 'route2'},
      ]}
      renderDataItem={({item}) => {
        const titleString = `Route ${item.routeId}`;
        return (
          <Section
            title={titleString}
            onPressHandler={() => {navigation.navigate('Route', {routeId: `${ item.routeId }`, routeName: `${ item.key }`}) }}
            isDarkMode={isDarkMode}
          />
        );
      }}>
      <Text>Stop Id: {stopId}</Text>
      <Text>Stop Name: Stop {stopId}</Text>
      <Text>Stop Location: Nw Corner of Here and There parking lot</Text>
    </CatScreen>
  );
}

export default StopScreen;
