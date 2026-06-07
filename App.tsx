import React, { useEffect } from 'react';
import { useColorScheme, Button } from 'react-native';
import {NavigationContainer, DefaultTheme, DarkTheme} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from '@/HomeScreen';
import RoutesScreen from '@/RoutesScreen';
import RouteScreen from '@/RouteScreen';
import StopsScreen from '@/StopsScreen';
import StopScreen from '@/StopScreen';
import SettingsScreen from '@/SettingsScreen';
import { runMigrations } from '@/db/migrations';
import Bootstrap from '@/Bootstrap';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  useEffect(() => {
    // Run schema migrations on app startup (non-blocking)
    (async () => {
      try {
        await runMigrations();
      } catch (e) {
        console.warn('[db] migrations error:', e);
      }
    })();
  }, []);

  const scheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Bootstrap>
          <Stack.Navigator>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={({ navigation }) => ({
                title: 'Welcome',
                headerRight: () => (
                  <Button title="Settings" onPress={() => navigation.navigate('Settings')} />
                ),
              })}
            />
            <Stack.Screen name="Routes" component={RoutesScreen}/>
            <Stack.Screen name="Route" component={RouteScreen} />
            <Stack.Screen name="Stops" component={StopsScreen}/>
            <Stack.Screen name="Stop" component={StopScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </Stack.Navigator>
        </Bootstrap>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;