import React from 'react';
import {useColorScheme} from 'react-native';

import Section from 'Section';
import CatScreen from 'CatScreen';

function RoutesScreen({navigation}): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <CatScreen
      isDarkMode={isDarkMode}
      data={[
        {title: 'Route 1', id: 1},
        {title: 'Route 2', id: 2},
        {title: 'Route 3', id: 3},
        {title: 'Route 4', id: 4},
      ]}
      renderDataItem={({item}) => {
        return (
          <Section
            title={item.title}
            onPressHandler={() => {navigation.navigate('Route', {busRouteId: `${ item.id }`}) }}
            isDarkMode={isDarkMode}
          />
        );
      }}
    />
  );
}

export default RoutesScreen;
