import React from 'react';
import { useColorScheme } from 'react-native';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from '@/HomeScreen';
import RoutesScreen from '@/RoutesScreen';
import RouteScreen from '@/RouteScreen';
import StopsScreen from '@/StopsScreen';
import StopScreen from '@/StopScreen';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  // GTFS dynamic lookup removed; providing empty data placeholders for now
  const data = { routes: [], stops: [] };
  const scheme = useColorScheme();

  return (
    <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'Welcome'}}
        />
        <Stack.Screen name="Routes">
          {(props) => <RoutesScreen {...props} routes={data.routes} />}
        </Stack.Screen>
        <Stack.Screen name="Route" component={RouteScreen} />
        <Stack.Screen name="Stops">
          {(props) => <StopsScreen {...props} stops={data.stops} />}
        </Stack.Screen>
        <Stack.Screen name="Stop" component={StopScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
