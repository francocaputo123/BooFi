import { modalProps } from "@/types/modal.types"
import { View, StyleSheet, Pressable, Text, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';

//components
import Card from "@/components/Card"
import { COLORS } from "@/constants/theme"

/**
- Modal con overlay incorporado para superponerse encima de los elementos. 
- 
- 
- @param outsideStyle Estilos externos del modal
- 
- @param innerStyle Estilos para internos del modal
- 
- @param setOpen Funcion para cerrar el modal
- 
- @param isOpen Estado para verificar si abierto es o no falso
- 
@param children
*/


const Modal = (props : modalProps) => {

    const {
        outsideStyle = null,
        innerStyle = null,
        isOpen,
        setOpen,
        children = null
    } = props

    const [renderModal, setRenderModal] = useState(isOpen)
    const animValue = useRef(new Animated.Value(0)).current

    useEffect(() => {
        if(isOpen) {
            setRenderModal(true)
            Animated.timing(animValue, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start()
        } else {
            Animated.timing(animValue, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start(() => {
                setRenderModal(false)
            })
        }
    }, [isOpen])

    if(!renderModal) return null

    const scale = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.85, 1],
    })

    return(
        <Animated.View
        style={[styles.modalOverlay, { opacity: animValue }]}
        >
            <Animated.View
            style={[
                styles.modalContainer, 
                outsideStyle,
                { transform: [{ scale }] }
            ]}
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
            </Animated.View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    modalOverlay : {
        position : 'absolute',
        width : '100%',
        height : '100%',
        backgroundColor : 'rgba(0, 0, 0, 0.7)'
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
        borderRadius : 100
    },

})

export default Modal