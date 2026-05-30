import React from 'react';
import {useColorScheme, Text, View} from 'react-native';

import Section from '@/Section';
import CatScreen from '@/CatScreen';

// For now, using 'any' for flexibility, but should be replaced with actual type
interface StopItem {
  stop_name?: string;
  stop_code?: string;
  stop_id: string;
  // Add other relevant stop properties here
}

interface StopsScreenProps {
  navigation: any;
  stops: StopItem[];
}

function StopsScreen({navigation, stops}: StopsScreenProps): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  if (!stops || stops.length === 0) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>No stops data available.</Text>
      </View>
    );
  }

  return (
    <CatScreen
      isDarkMode={isDarkMode}
      data={stops}
      renderDataItem={({item}: {item: StopItem}) => {
        const title = item.stop_name || `Stop ID: ${item.stop_id}`;
        return (
          <Section
            title={title}
            onPressHandler={() => {
              navigation.navigate('Stop', {stopId: `${item.stop_id}`});
            }}
            isDarkMode={isDarkMode}
          />
        );
      }}
    />
  );
}

export default StopsScreen;
