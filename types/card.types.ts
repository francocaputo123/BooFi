import { ReactNode } from "react";
import { StyleProp, ViewStyle } from "react-native";

export interface componentProps {
    children : ReactNode,
    style? : StyleProp<ViewStyle> | null
}

export interface textProps {
    children : ReactNode,
    style : ViewStyle | null
}