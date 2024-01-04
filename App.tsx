/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Section from 'Section.tsx';
import HomeScreen from 'HomeScreen.tsx';
import RoutesScreen from 'RoutesScreen.tsx';
import RouteScreen from 'RouteScreen.tsx';
import StopsScreen from 'StopsScreen.tsx';
import StopScreen from 'StopScreen.tsx'

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

export default App;
