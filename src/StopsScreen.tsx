import {
    useColorScheme,
} from 'react-native';

import Section from 'Section.tsx';
import CatScreen from 'CatScreen.tsx';

function StopsScreen({navigation}): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
      <CatScreen isDarkMode={isDarkMode}
            data={[{title: 'Stop 1', id: 1}, {title: 'Stop 2', id: 2}, {title: 'Stop 3', id: 3}, {title: 'Stop 4', id: 4}]}
            renderDataItem={({item}) => {
                return <Section title={item.title}
                    onPressHandler={() => {navigation.navigate('Stop',{stopId: `${ item.id }`}) }}
                    isDarkMode={isDarkMode} />;
            } }
          />
  );
}

export default StopsScreen