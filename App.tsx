import React from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from '@/HomeScreen';
import RoutesScreen from '@/RoutesScreen';
import RouteScreen from '@/RouteScreen';
import StopsScreen from '@/StopsScreen';
import StopScreen from '@/StopScreen';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  // GTFS dynamic lookup removed; providing sample data placeholders for now
  const data = {
    routes: [
      { route_id: '1', route_short_name: 'Blue', route_long_name: 'Blue Line' },
      { route_id: '2', route_short_name: 'Green', route_long_name: 'Green Line' },
    ],
    stops: [
      { stop_id: '100', stop_name: 'Main & 1st', stop_code: 'M1' },
      { stop_id: '200', stop_name: 'Central Station', stop_code: 'CEN' },
    ],
  };
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