import {
    Alert,
    Button,
    GestureResponderEvent,
    Image,
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

import styles from 'AppStyle.tsx';
import Section from 'Section.tsx';


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

export default RoutesScreen