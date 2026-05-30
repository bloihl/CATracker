import React from 'react';
import type {PropsWithChildren} from 'react';
import {Button, GestureResponderEvent, View} from 'react-native';
import {useTheme} from '@react-navigation/native';

import styles from '@/AppStyle';

type SectionProps = PropsWithChildren<{
  onPressHandler: GestureResponderEvent;
  title: string;
  isDarkMode: boolean;
}>;

function Section({children, title, onPressHandler, isDarkMode}: SectionProps): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <View style={styles.sectionContainer}>
      <Button
        // RN Button ignores style for text color; use `color` prop instead
        color={colors.primary}
        onPress={onPressHandler}
        title={title}
      />
    </View>
  );
}
export default Section;
