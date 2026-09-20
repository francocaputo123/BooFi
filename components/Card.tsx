import { View, StyleSheet} from "react-native"


//types
import { componentProps, textProps } from "@/types/card.types"

const Card = ({children, style} : componentProps) => {
    return(
        <View
        style={style || styles.card}
        >
            {children}
        </View>
    )
}

const HeaderCard = ({children, style} : componentProps) => {
    return(
        <View
        style={style || styles.header}
        >
            {children}
        </View>
    )
}

const BodyCard = ({children, style} : componentProps) => {
    return(
        <View
        style={style || styles.header}
        >
            {children}
        </View>
    )
}

const FooterCard = ({children, style} : componentProps) => {
    return(
        <View
        style={style || styles.header}
        >
            {children}
        </View>
    )
}

//estilos por defecto

const styles = StyleSheet.create({
    card : {
        backgroundColor : "#FFFFFF",
        padding : 2,
        borderRadius : 12,
        borderWidth : 1,
        borderColor : "#000000",
        //sombra
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2
    },

    header : {
        marginBottom: 8,
    }
})

export default Object.assign(Card, {
  Header: HeaderCard,
  Body: BodyCard,
  Footer: FooterCard
});