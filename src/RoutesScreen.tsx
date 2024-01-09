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


const RoutesScreen = ({navigation}) => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
      <CatScreen isDarkMode={isDarkMode}>
        <FlatList
            data={[{title: 'Route 1', id: 1}, {title: 'Route 2', id: 2}, {title: 'Route 3', id: 3}, {title: 'Route 4', id: 4}]}
            renderItem={({item}) => {
                return <Section title={item.title}
                    onPressHandler={() => {navigation.navigate('Route', {busRouteId: `${ item.id }`}) }}
                    isDarkMode={isDarkMode} />;
            } }
          />
      </CatScreen>
  );
}

export default RoutesScreen