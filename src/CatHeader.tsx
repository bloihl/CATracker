import React from 'react';
import type {PropsWithChildren} from 'react';
import {Image, StatusBar, Text, View} from 'react-native';
import {useTheme} from '@react-navigation/native';

import styles from '@/AppStyle';

type CatHeaderProps = PropsWithChildren<{
  isDarkMode: boolean;
}>;

function CatHeader({children, isDarkMode}: CatHeaderProps): React.JSX.Element {
  const { colors } = useTheme();
  const backgroundStyle = {
    backgroundColor: colors.background,
  };

  return (
    <View style={styles.logoView}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <Image source={require('./cat-logo.png')} />
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Columbia Area Transit Tracker</Text>
      {children}
    </View>
  );
}

export default CatHeader;