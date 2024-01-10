import {
    Text,
    useColorScheme,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import Section from 'Section.tsx';
import CatScreen from 'CatScreen.tsx';

const RouteScreen = ({navigation, route}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const { busRouteId } = route.params;
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };


  return (
      <CatScreen isDarkMode={isDarkMode}
            data={[{stopId: '1', key: 'item1'}, {stopId: '2', key: 'item2'}]}
            renderDataItem={({item}) => {
                const titleString = `Stop ${item.stopId}`;
                return <Section title={titleString}
                    onPressHandler={() => {navigation.navigate('Stop', {stopId: `${ item.stopId }`}) }}
                    isDarkMode={isDarkMode} />;
            } }
          >
            <Text>Route Id: {busRouteId}</Text>
            <Text>Route Name: Route {busRouteId}</Text>
      </CatScreen>
  );
}
export default RouteScreen