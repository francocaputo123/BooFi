import { ReactNode } from "react";
import { ViewStyle } from "react-native";

export interface componentProps {
    children : ReactNode,
    style? : ViewStyle | null
}

export interface textProps {
    children : ReactNode,
    style : ViewStyle | null
}