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


const StopScreen = ({navigation, route}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const { stopId } = route.params

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <CatScreen isDarkMode={isDarkMode}>
      <Text>Stop Id: {stopId}</Text>
      <Text>Stop Name: Stop {stopId}</Text>
      <Text>Stop Location: Nw Corner of Here and There parking lot</Text>
      <FlatList
        data={[{routeId: 1, key: 'item1'}, {routeId: 2, key: 'item2'}]}
        renderItem={({item}) => {
            const titleString = `Route ${item.routeId}`;
            return <Section title={titleString}
                onPressHandler={() => {navigation.navigate('Route', {busRouteId: `${ item.routeId }`}) }}
                isDarkMode={isDarkMode}/>;
            }
        }/>
    </CatScreen>
  );
}

export default StopScreen