import { Text, View, StyleSheet } from 'react-native';

//components
import BookSearch from "@/components/BookSearch"

//constans
import { COLORS } from "@/constants/theme"

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <BookSearch />
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
