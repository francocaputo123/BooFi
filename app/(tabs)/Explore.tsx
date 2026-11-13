import { Text, View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from "expo-router"

//components
import BookSearch from "@/components/BookSearch"

//constans
import { COLORS } from "@/constants/theme"

export default function ExploreScreen() {
  // paidRequest cambia en cada toque de Tienda (lleva la hora): asi el filtro se vuelve a prender
  // aunque el usuario ya lo hubiera apagado antes
  const { genreFromIndex, paidRequest } = useLocalSearchParams()
  
  return (
    <View style={styles.container}>
      <BookSearch
        genreFromIndex={genreFromIndex ? genreFromIndex : null}
        paidRequest={paidRequest ? paidRequest : null}
      />
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
