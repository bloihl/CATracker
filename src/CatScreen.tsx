import type {PropsWithChildren} from 'react';
import {
    FlatList,
    SafeAreaView,
    Text,
    View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';

import styles from 'AppStyle.tsx';
import CatHeader from 'CatHeader.tsx';
import Section from 'Section.tsx';

type CatScreenProps = PropsWithChildren<{
    data: ArrayLike
    renderDataItem: {}
    isDarkMode: boolean;
}>;

function CatScreen({children, data, renderDataItem, isDarkMode}: CatScreenProps): JSX.Element {
   const backgroundStyle = {
     backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
   };

  return (
    <SafeAreaView style={backgroundStyle}>
        <FlatList
            ListHeaderComponent={<CatHeader>{children}</CatHeader>}
            data={data}
            renderItem={renderDataItem}
            ListFooterComponent={
                <View style={styles.logoView}>
                    <Text>Data current as of Jan 1, 2024</Text>
                </View>}
            />
    </SafeAreaView>
  );
}
export default CatScreen