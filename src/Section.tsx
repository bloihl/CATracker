import type {PropsWithChildren} from 'react';
import {
    Alert,
    Button,
    GestureResponderEvent, Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import styles from 'AppStyle.tsx';

type SectionProps = PropsWithChildren<{
    onPressHandler: GestureResponderEvent;
    title: string;
    isDarkMode: boolean;
}>;

function Section({children, title, onPressHandler, isDarkMode}: SectionProps): JSX.Element {
  return (
    <View style={styles.sectionContainer}>
      <Button
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}
        onPress={onPressHandler}
        title={title}>
      </Button>
    </View>
  );
}
export default Section