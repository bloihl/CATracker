/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
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

type PageProps = PropsWithChildren<{
    currentPage: string;
    setPage: GestureResponderEvent;
    isDarkMode: boolean;
}>;

function Page({children, currentPage, setPage, isDarkMode}): JSX.Element {
    return (
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
            <Section title="ROUTES" onPressHandler={() => {Alert.alert(currentPage) }} isDarkMode={isDarkMode}/>
            <Section title="STOPS" onPressHandler={() => {Alert.alert("bar")}} isDarkMode={isDarkMode}/>
        </View>
    );
}

function App(): JSX.Element {
  const [page, setPage] = useState("main");
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View style={styles.logoView}>
            <Image source={require('./cat-logo.png')} />
            <Text style={[styles.sectionTitle]}>Columbia Area Transit Tracker</Text>
        </View>
        <Page isDarkMode={isDarkMode} currentPage={page} setPage={setPage} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  logoView:  {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  },
});

export default App;
