import { View, Text, Pressable, StyleSheet } from "react-native"
import { COLORS, SPACING, FONTSIZE } from "@/constants/theme"

export interface StoryTab<Key extends string> {
  key: Key
  label: string
  count: number
}

interface StoryTabsProps<Key extends string> {
  tabs: StoryTab<Key>[]
  activeKey: Key
  onChange: (key: Key) => void
}

/** Pestañas con la cantidad de historias de cada grupo; la activa lleva una línea abajo */
const StoryTabs = <Key extends string>({ tabs, activeKey, onChange }: StoryTabsProps<Key>) => (
  <View style={styles.container}>
    {tabs.map((tab) => {
      const isActive = tab.key === activeKey
      return (
        <Pressable
          key={tab.key}
          style={[styles.tab, isActive && styles.tabActive]}
          onPress={() => onChange(tab.key)}
        >
          <Text style={[styles.label, isActive && styles.labelActive]}>
            {tab.label} <Text style={styles.count}>{tab.count}</Text>
          </Text>
        </Pressable>
      )
    })}
  </View>
)

const styles = StyleSheet.create({
  container: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tab: {
    flex: 1, alignItems: "center", paddingVertical: SPACING.m,
    borderBottomWidth: 2, borderBottomColor: "transparent",
  },
  tabActive: { borderBottomColor: COLORS.primary },
  label: { fontSize: FONTSIZE.s, color: COLORS.textSecondary },
  labelActive: { color: COLORS.text, fontWeight: "600" },
  count: { fontSize: FONTSIZE.xs },
})

export default StoryTabs