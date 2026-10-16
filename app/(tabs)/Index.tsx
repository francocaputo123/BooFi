import { Text, View,  StyleSheet } from 'react-native';
import { Link } from 'expo-router';

//constans
import { COLORS } from "@/constants/theme"

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Home screen,a</Text>
      <Link href="/Maps" style={styles.button}>
        Ir a mapa
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
  },
  button: {
    fontSize: 20,
    textDecorationLine: 'underline',
    color: COLORS.text,
  }
});
