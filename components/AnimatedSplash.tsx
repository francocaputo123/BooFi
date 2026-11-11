import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, useWindowDimensions } from "react-native";

//constantes
import { COLORS, FONTSIZE, SPACING } from "@/constants/theme";

// ---------- Textos ----------
const WELCOME_TEXT = "Tu próxima historia empieza acá";

// ---------- Tiempos (en milisegundos) ----------
const WELCOME_MS = 2000;        // Paso 1: frase estática
const LOGO_FADE_IN_MS = 1200;   // Paso 2: el logo aparece...
const LOGO_HOLD_MS = 2000;      // ...se queda visible...
const LOGO_FADE_OUT_MS = 1300;  // ...y se desvanece (total del logo: 4,5 segundos)
const EXIT_MS = 250;            // Fundido corto al salir (se nota solo si el usuario saltea)

type Props = {
    // true cuando la app ya tiene lo necesario para arrancar (ej: la sesión ya se leyó)
    ready: boolean;
    // se llama una sola vez, cuando el splash terminó de salir
    onFinish: () => void;
};

const AnimatedSplash = ({ ready, onFinish }: Props) => {
    const { width } = useWindowDimensions();
    const logoSize = Math.min(width * 0.75, 340);

    const [phase, setPhase] = useState<"welcome" | "logo">("welcome");
    const [minTimeDone, setMinTimeDone] = useState(false); // terminó la animación completa
    const [skipped, setSkipped] = useState(false);         // el usuario tocó la pantalla

    const logoOpacity = useRef(new Animated.Value(0)).current;
    const containerOpacity = useRef(new Animated.Value(1)).current;
    const exiting = useRef(false);

    // Guardamos onFinish en una ref para que el efecto de salida no se vuelva a ejecutar
    // si el padre cambia la función
    const onFinishRef = useRef(onFinish);
    useEffect(() => {
        onFinishRef.current = onFinish;
    }, [onFinish]);

    // Paso 1: después de WELCOME_MS pasamos al logo
    useEffect(() => {
        const timer = setTimeout(() => setPhase("logo"), WELCOME_MS);
        return () => clearTimeout(timer); // limpieza: evita timers colgados si se desmonta
    }, []);

    // Paso 2: fade-in -> pausa -> fade-out
    useEffect(() => {
        if (phase !== "logo") return;

        const animation = Animated.sequence([
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: LOGO_FADE_IN_MS,
                useNativeDriver: true,
            }),
            Animated.delay(LOGO_HOLD_MS),
            Animated.timing(logoOpacity, {
                toValue: 0,
                duration: LOGO_FADE_OUT_MS,
                useNativeDriver: true,
            }),
        ]);

        animation.start(({ finished }) => {
            if (finished) setMinTimeDone(true);
        });

        return () => animation.stop();
    }, [phase, logoOpacity]);

    // Salida: se cumple el tiempo mínimo (o el usuario saltea) Y la app está lista
    const canExit = ready && (minTimeDone || skipped);

    useEffect(() => {
        if (!canExit || exiting.current) return;
        exiting.current = true;

        Animated.timing(containerOpacity, {
            toValue: 0,
            duration: EXIT_MS,
            useNativeDriver: true,
        }).start(() => onFinishRef.current());
    }, [canExit, containerOpacity]);

    return (
        <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
            <Pressable
                style={styles.pressable}
                onPress={() => setSkipped(true)}
                accessibilityRole="button"
                accessibilityLabel="Saltar pantalla de bienvenida"
            >
                {phase === "welcome" ? (
                    <Text style={styles.welcomeText}>{WELCOME_TEXT}</Text>
                ) : (
                    <Animated.Image
                        source={require("@/assets/images/logo.png")}
                        style={{ width: logoSize, height: logoSize, opacity: logoOpacity }}
                        resizeMode="contain"
                    />
                )}
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    pressable: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: SPACING.xl,
    },
    welcomeText: {
        color: COLORS.primary,
        fontSize: FONTSIZE.xxxl,
        fontWeight: "700",
        lineHeight: 40,
        textAlign: "center",
    },
});

export default AnimatedSplash;
