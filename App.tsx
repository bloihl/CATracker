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


import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

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

const HomeScreen = ({navigation}) => {
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
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
            <Section title="ROUTES" onPressHandler={() => {navigation.navigate('Routes') }} isDarkMode={isDarkMode}/>
            <Section title="STOPS" onPressHandler={() => {navigation.navigate('Stops') }} isDarkMode={isDarkMode}/>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const RoutesScreen = ({navigation}) => {
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
            <Text style={[styles.sectionTitle]}>Columbia Area Transit Tracker</Text>
        </View>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
            <Section title="Route 1" onPressHandler={() => {navigation.navigate('Route', {busRouteId: 1}) }} isDarkMode={isDarkMode}/>
            <Section title="Route 2" onPressHandler={() => {navigation.navigate('Route', {busRouteId: 2}) }} isDarkMode={isDarkMode}/>
            <Section title="Route 3" onPressHandler={() => {navigation.navigate('Route', {busRouteId: 3}) }} isDarkMode={isDarkMode}/>
            <Section title="Route 4" onPressHandler={() => {navigation.navigate('Route', {busRouteId: 4}) }} isDarkMode={isDarkMode}/>
            <Section title="Route 5" onPressHandler={() => {navigation.navigate('Route', {busRouteId: 5}) }} isDarkMode={isDarkMode}/>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const StopsScreen = ({navigation}) => {
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
            <Text style={[styles.sectionTitle]}>Columbia Area Transit Tracker</Text>
        </View>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
            <Section title="Stop 1" onPressHandler={() => {navigation.navigate('Stop', {stopId: 1}) }} isDarkMode={isDarkMode}/>
            <Section title="Stop 2" onPressHandler={() => {navigation.navigate('Stop', {stopId: 2}) }} isDarkMode={isDarkMode}/>
            <Section title="Stop 3" onPressHandler={() => {navigation.navigate('Stop', {stopId: 3}) }} isDarkMode={isDarkMode}/>
            <Section title="Stop 4" onPressHandler={() => {navigation.navigate('Stop', {stopId: 4}) }} isDarkMode={isDarkMode}/>
            <Section title="Stop 5" onPressHandler={() => {navigation.navigate('Stop', {stopId: 5}) }} isDarkMode={isDarkMode}/>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const RouteScreen = ({navigation, route}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const { busRouteId } = route.params;
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
            <Text style={[styles.sectionTitle]}>Columbia Area Transit Tracker</Text>
        </View>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Text>Route Id: {JSON.stringify(busRouteId)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const StopScreen = ({navigation, route}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const { stopId } = route.params

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
            <Text style={[styles.sectionTitle]}>Columbia Area Transit Tracker</Text>
        </View>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Text>Stop Id: {JSON.stringify(stopId)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
    return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name='Home'
          component={HomeScreen}
          options={{title: 'Welcome'}}/>
        <Stack.Screen name="Routes" component={RoutesScreen} />
        <Stack.Screen name="Route" component={RouteScreen} />
        <Stack.Screen name="Stops" component={StopsScreen} />
        <Stack.Screen name="Stop" component={StopScreen} />
      </Stack.Navigator>
    </NavigationContainer>
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
