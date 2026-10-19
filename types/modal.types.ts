import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";

export interface modalProps {
    outsideStyle? :  StyleProp<ViewStyle> 
    innerStyle? : StyleProp<ViewStyle> 
    isOpen : boolean,
    setOpen : (isOpen : boolean) => void
    children : ReactNode
}