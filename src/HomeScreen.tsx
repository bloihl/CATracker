import {
    FlatList,
    StatusBar,
    Text,
    useColorScheme,
    View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import styles from 'AppStyle.tsx';
import CatScreen from 'CatScreen.tsx';
import Section from 'Section.tsx';

function HomeScreen({navigation}): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <CatScreen isDarkMode={isDarkMode}>
      <FlatList
        data={[{title: 'ROUTES', key: 'Routes'}, {title: 'STOPS', key: 'Stops'}]}
        renderItem={({item}) => {
            return <Section title={item.title}
                onPressHandler={() => {navigation.navigate(`${ item.key }`) }}
                isDarkMode={isDarkMode} />;
        } }
      />
    </CatScreen>
  );
}

export default HomeScreen
