import { modalProps } from "@/types/modal.types"
import { View, StyleSheet, Pressable, Text} from 'react-native';

//components
import Card from "@/components/Card"
import { COLORS } from "@/constants/theme"

/**
 * Modal con overlay incorporado para superponerse encima de los elementos. 
 * 
 * @param outsideStyle - Estilos externos del modal
 * @param innerStyle - Estilos para internos del modal
 * @param setOpen - Funcion para cerrar el modal
 * @param isOpen - Estado para verificar si abierto es o no falso
 * @param children
*/


const Modal = (props : modalProps) => {

    const {
        outsideStyle = null,
        innerStyle = null,
        isOpen,
        setOpen,
        children = null
    } = props

    if(!isOpen) return null

    return(
        <View
        style={styles.modalOverlay}
        >
            <View
            style={[styles.modalContainer, outsideStyle]}
            >
                <Card
                style={[styles.card, innerStyle]}
                >
                    {children}
                </Card>
                <Pressable
                style={styles.closeBtn}
                onPress={() => setOpen(false)}
                >
                    <Text> 
                        X 
                    </Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    modalOverlay : {
        position : 'absolute',
        width : '100%',
        height : '100%',
        backgroundColor : 'rgb(0, 0, 0, 0.7)'
    },

    modalContainer : {
        flex : 1,
        justifyContent : "center",
        alignItems : "center"
    },

    card : {
        width : '80%',
        backgroundColor : COLORS.surface,
        borderRadius : 5,
        padding : 10,
        margin : 10
    },

    closeBtn : {
        backgroundColor : COLORS.danger,
        paddingVertical : 10,
        paddingHorizontal : 15,
        borderRadius : '100%'
    },

})

export default Modal