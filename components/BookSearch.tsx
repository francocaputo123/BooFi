import { useState } from "react"
import { FlatList, StyleSheet, Text, TextInput, View,} from "react-native"
import BOOKS from "../data/books"

const BookSearch = () => {
    const [searchText, setSearchText] = useState("")

    // para que la busqueda no dependa de mayusculas ni espacios
    const search = searchText.toLowerCase().trim()

    const filteredBooks = BOOKS.filter((book) => {
        return (
            book.title.toLowerCase().includes(search) ||
            book.author.toLowerCase().includes(search)
        )
    })

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Buscar libros</Text>

            <TextInput
                style={styles.searchInput}
                placeholder="Buscar por título o autor"
                placeholderTextColor="#888"
                value={searchText}
                onChangeText={setSearchText}
            />

            {filteredBooks.length === 0 ? (
                <Text style={styles.emptyMessage}> No se encontraron resultados. </Text>
            ) : (
                <FlatList
                    data={filteredBooks}
                    keyExtractor={(book) => book.id}
                    renderItem={({ item }) => (
                        <View style={styles.bookCard}>
                            <Text style={styles.bookTitle}> {item.title} </Text>
                            <Text style={styles.bookAuthor}> {item.author} </Text>
                        </View>
                    )}
                />
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#25292e",
    },

    title: {
        marginBottom: 20,
        color: "#ffffff",
        fontSize: 28,
        fontWeight: "bold",
    },

    searchInput: {
        marginBottom: 20,
        padding: 12,
        borderRadius: 8,
        backgroundColor: "#ffffff",
        fontSize: 16,
    },

    bookCard: {
        marginBottom: 12,
        padding: 16,
        borderRadius: 8,
        backgroundColor: "#3a3f45",
    },

    bookTitle: {
        marginBottom: 5,
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "bold",
    },

    bookAuthor: {
        color: "#cccccc",
        fontSize: 14,
    },

    emptyMessage: {
        color: "#cccccc",
        fontSize: 16,
        textAlign: "center",
    },
})

export default BookSearch