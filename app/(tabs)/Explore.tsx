import { Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from "expo-router"

//components
import BookSearch from "@/components/BookSearch"

//constans
import { COLORS } from "@/constants/theme"

export default function ExploreScreen() {
  const { genreFromIndex } = useLocalSearchParams()
  
  return (
    <View style={styles.container}>
      <BookSearch genreFromIndex={genreFromIndex ? genreFromIndex : null}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  text: {
    color: '#fff',
  },
});
