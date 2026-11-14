import { useState } from 'react'
import { Modal as NativeModal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { COLORS, FONTSIZE, SPACING } from '@/constants/theme'
import { LEGAL_DOCUMENTS, LEGAL_LABELS } from '@/data/legalTexts'
import { LegalDocumentKey } from '@/types/legal.types'

type LegalConsentProps = {
    acceptedTerms: boolean
    acceptedPrivacy: boolean
    onToggleTerms: () => void
    onTogglePrivacy: () => void
}

type ConsentRowProps = {
    checked: boolean
    prefix: string
    linkText: string
    onToggle: () => void
    onPressLink: () => void
}

// Una casilla con su texto. Solo el nombre del documento es un link (celeste):
// tocarlo abre el texto, y la casilla se marca tocando el cuadradito.
const ConsentRow = ({ checked, prefix, linkText, onToggle, onPressLink }: ConsentRowProps) => (
    <View style={styles.row}>
        <Pressable
            onPress={onToggle}
            hitSlop={10}
            accessibilityRole="checkbox"
            accessibilityState={{ checked }}
            accessibilityLabel={`${prefix}${linkText}`}
            style={[styles.checkbox, checked && styles.checkboxChecked]}
        >
            {checked && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </Pressable>
        <Text style={styles.label}>
            {prefix}
            <Text style={styles.link} onPress={onPressLink} accessibilityRole="link">
                {linkText}
            </Text>
        </Text>
    </View>
)

/**
 * Casillas para aceptar los Términos y Condiciones y la Política de Privacidad.
 * Al tocar el nombre de cada documento se abre una ventana dentro de la app con su texto completo.
 */
const LegalConsent = ({ acceptedTerms, acceptedPrivacy, onToggleTerms, onTogglePrivacy }: LegalConsentProps) => {
    const [isModalVisible, setIsModalVisible] = useState(false)
    // Se guarda aparte de "visible" para que el texto no desaparezca mientras la ventana se cierra
    const [documentKey, setDocumentKey] = useState<LegalDocumentKey>('terms')

    const legalDocument = LEGAL_DOCUMENTS[documentKey]

    const openDocument = (key: LegalDocumentKey) => {
        setDocumentKey(key)
        setIsModalVisible(true)
    }

    return (
        <View style={styles.container}>
            <ConsentRow
                checked={acceptedTerms}
                prefix={LEGAL_LABELS.ACCEPT_TERMS_PREFIX}
                linkText={LEGAL_LABELS.ACCEPT_TERMS_LINK}
                onToggle={onToggleTerms}
                onPressLink={() => openDocument('terms')}
            />
            <ConsentRow
                checked={acceptedPrivacy}
                prefix={LEGAL_LABELS.ACCEPT_PRIVACY_PREFIX}
                linkText={LEGAL_LABELS.ACCEPT_PRIVACY_LINK}
                onToggle={onTogglePrivacy}
                onPressLink={() => openDocument('privacy')}
            />

            {/* onRequestClose: en Android cierra la ventana con el botón "atrás" */}
            <NativeModal
                visible={isModalVisible}
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <SafeAreaView style={styles.modalScreen} edges={['top', 'bottom']}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{legalDocument.title}</Text>
                        <Pressable onPress={() => setIsModalVisible(false)} hitSlop={10} accessibilityLabel={LEGAL_LABELS.CLOSE}>
                            <Ionicons name="close" size={26} color={COLORS.text} />
                        </Pressable>
                    </View>

                    <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator>
                        <Text style={styles.updated}>{legalDocument.lastUpdated}</Text>

                        {legalDocument.intro.map((paragraph, index) => (
                            <Text key={`intro-${index}`} style={styles.paragraph}>{paragraph}</Text>
                        ))}

                        {legalDocument.sections.map((section) => (
                            <View key={section.heading}>
                                <Text style={styles.heading}>{section.heading}</Text>
                                {section.blocks.map((block, index) =>
                                    typeof block === 'string' ? (
                                        <Text key={index} style={styles.paragraph}>{block}</Text>
                                    ) : (
                                        <View key={index} style={styles.bulletList}>
                                            {block.map((item, itemIndex) => (
                                                <View key={itemIndex} style={styles.bulletRow}>
                                                    <Text style={styles.bullet}>•</Text>
                                                    <Text style={styles.bulletText}>{item}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    )
                                )}
                            </View>
                        ))}
                    </ScrollView>

                    <View style={styles.modalFooter}>
                        <Pressable style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                            <Text style={styles.closeButtonText}>{LEGAL_LABELS.CLOSE}</Text>
                        </Pressable>
                    </View>
                </SafeAreaView>
            </NativeModal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: SPACING.s,
        paddingVertical: SPACING.s,
        gap: SPACING.s + SPACING.xs,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.s + SPACING.xs,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 1.5,
        borderColor: COLORS.textSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.accent,
        borderColor: COLORS.accent,
    },
    label: {
        flex: 1,
        color: COLORS.text,
        fontSize: FONTSIZE.s,
    },
    link: {
        color: COLORS.link,
        fontWeight: '600',
        textDecorationLine: 'underline',
    },

    modalScreen: { flex: 1, backgroundColor: COLORS.background },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: SPACING.m,
        paddingHorizontal: SPACING.m,
        paddingVertical: SPACING.m,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    modalTitle: { flex: 1, color: COLORS.text, fontSize: FONTSIZE.l, fontWeight: 'bold' },
    modalContent: { padding: SPACING.m, paddingBottom: SPACING.xl },
    updated: { color: COLORS.textSecondary, fontSize: FONTSIZE.xs, marginBottom: SPACING.s },
    heading: {
        color: COLORS.text,
        fontSize: FONTSIZE.m,
        fontWeight: 'bold',
        marginTop: SPACING.l,
        marginBottom: SPACING.xs,
    },
    paragraph: { color: COLORS.text, fontSize: FONTSIZE.s, lineHeight: 21, marginTop: SPACING.s },
    bulletList: { marginTop: SPACING.s, gap: SPACING.xs },
    bulletRow: { flexDirection: 'row', gap: SPACING.s, paddingLeft: SPACING.s },
    bullet: { color: COLORS.text, fontSize: FONTSIZE.s, lineHeight: 21 },
    bulletText: { flex: 1, color: COLORS.text, fontSize: FONTSIZE.s, lineHeight: 21 },
    modalFooter: {
        padding: SPACING.m,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    closeButton: {
        alignItems: 'center',
        padding: SPACING.m,
        borderRadius: 12,
        backgroundColor: COLORS.accent,
    },
    closeButtonText: { color: '#FFFFFF', fontWeight: 'bold' },
})

export default LegalConsent
