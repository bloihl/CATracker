import React from 'react';
import {Text, useColorScheme} from 'react-native';

import Section from 'Section';
import CatScreen from 'CatScreen';

function RouteScreen({navigation, route}): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const {busRouteId} = route.params;

  return (
    <CatScreen
      isDarkMode={isDarkMode}
      data={[
        {stopId: '1', key: 'item1'},
        {stopId: '2', key: 'item2'},
      ]}
      renderDataItem={({item}) => {
        const titleString = `Stop ${item.stopId}`;
        return (
          <Section
            title={titleString}
            onPressHandler={() => {
              navigation.navigate('Stop', {stopId: `${item.stopId}`});
            }}
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
