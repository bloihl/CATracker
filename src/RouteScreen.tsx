import {
    FlatList,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import styles from 'AppStyle.tsx';
import Section from 'Section.tsx';
import CatScreen from 'CatScreen.tsx';

const RouteScreen = ({navigation, route}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const { busRouteId } = route.params;
  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
      <CatScreen isDarkMode={isDarkMode}>
          <Text>Route Id: {busRouteId}</Text>
          <Text>Route Name: Route {busRouteId}</Text>
          <FlatList
            data={[{stopId: '1', key: 'item1'}, {stopId: '2', key: 'item2'}]}
            renderItem={({item}) => {
                const titleString = `Stop ${item.stopId}`;
                return <Section title={titleString}
                    onPressHandler={() => {navigation.navigate('Stop', {stopId: `${ item.stopId }`}) }}
                    isDarkMode={isDarkMode} />;
            } }
          />
      </CatScreen>
  );
}
export default RouteScreen