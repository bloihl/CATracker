import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from 'HomeScreen';
import RoutesScreen from 'RoutesScreen';
import RouteScreen from 'RouteScreen';
import StopsScreen from 'StopsScreen';
import StopScreen from 'StopScreen';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'Welcome'}}
        />
        <Stack.Screen name="Routes" component={RoutesScreen} />
        <Stack.Screen name="Route" component={RouteScreen} />
        <Stack.Screen name="Stops" component={StopsScreen} />
        <Stack.Screen name="Stop" component={StopScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
