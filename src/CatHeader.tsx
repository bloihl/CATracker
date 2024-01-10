import type {PropsWithChildren} from 'react';
import {
    Image,
    StatusBar,
    Text,
    View,
} from 'react-native';

import styles from 'AppStyle.tsx';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

type CatHeaderProps = PropsWithChildren<{
    isDarkMode: boolean;
}>;

function CatHeader({children, isDarkMode}: CatHeaderProps): JSX.Element {
   const backgroundStyle = {
     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
   };

  return (
        <View style={styles.logoView}>
            <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={backgroundStyle.backgroundColor}
                />
            <Image source={require('./cat-logo.png')} />
            <Text style={[styles.sectionTitle]}>Columbia Area Transit Tracker</Text>
            {children}
        </View>
  );
}
export default CatHeader