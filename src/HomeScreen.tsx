import {
    useColorScheme,
} from 'react-native';

import CatScreen from 'CatScreen.tsx';
import Section from 'Section.tsx';

function HomeScreen({navigation}): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <CatScreen isDarkMode={isDarkMode}
        data={[{title: 'ROUTES', key: 'Routes'}, {title: 'STOPS', key: 'Stops'}]}
        renderDataItem={({item}) => {
            return <Section title={item.title}
                onPressHandler={() => {navigation.navigate(`${ item.key }`) }}
                isDarkMode={isDarkMode} />;
        } }
      />
  );
}

export default HomeScreen
