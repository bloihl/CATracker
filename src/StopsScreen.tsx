import {
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

export default StopsScreen