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
import CatHeader from 'CatHeader.tsx';

type CatScreenProps = PropsWithChildren<{
    isDarkMode: boolean;
}>;

function CatScreen({children, isDarkMode}: CatScreenProps): JSX.Element {
   const backgroundStyle = {
     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
   };

  return (
    <SafeAreaView style={backgroundStyle}>

        <CatHeader />

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