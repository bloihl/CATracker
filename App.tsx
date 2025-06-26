import React, {useEffect} from 'react';
import {ActivityIndicator, View, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from './src/HomeScreen';
import RoutesScreen from './src/RoutesScreen';
import RouteScreen from './src/RouteScreen';
import StopsScreen from './src/StopsScreen';
import StopScreen from './src/StopScreen';
import useGTFSData from './src/hooks/useGTFSData'; // Import the hook

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  const { data, loading, error } = useGTFSData();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading GTFS data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error loading GTFS data:</Text>
        <Text>{error.message}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
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
        {/* We'll add TripsScreen later if needed */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
