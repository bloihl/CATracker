import type {PropsWithChildren} from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    Text,
    useColorScheme,
    View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import styles from 'AppStyle.tsx';

type CatScreenProps = PropsWithChildren<{
    isDarkMode: boolean;
}>;

function CatScreen({children, isDarkMode}: SectionProps): JSX.Element {
   const backgroundStyle = {
     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
   };

  return (
    <SafeAreaView style={backgroundStyle}>
        <StatusBar
            barStyle={isDarkMode ? 'light-content' : 'dark-content'}
            backgroundColor={backgroundStyle.backgroundColor}
            />
        <View style={styles.logoView}>
            <Image source={require('./cat-logo.png')} />
            <Text style={[styles.sectionTitle]}>Columbia Area Transit Tracker</Text>
        </View>

        <View
          style={[{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }, styles.sectionDescription]}>
            { children }
        </View>
    </SafeAreaView>
  );
}
export default CatScreen