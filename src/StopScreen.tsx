import {
    Text,
    useColorScheme,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import Section from 'Section.tsx';
import CatScreen from 'CatScreen.tsx';

const StopScreen = ({navigation, route}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const { stopId } = route.params

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <CatScreen isDarkMode={isDarkMode}
        data={[{routeId: 1, key: 'item1'}, {routeId: 2, key: 'item2'}]}
        renderDataItem={({item}) => {
            const titleString = `Route ${item.routeId}`;
            return <Section title={titleString}
                onPressHandler={() => {navigation.navigate('Route', {busRouteId: `${ item.routeId }`}) }}
                isDarkMode={isDarkMode}/>;
            }
        }>
       <Text>Stop Id: {stopId}</Text>
       <Text>Stop Name: Stop {stopId}</Text>
       <Text>Stop Location: Nw Corner of Here and There parking lot</Text>
    </CatScreen>
  );
}

export default StopScreen