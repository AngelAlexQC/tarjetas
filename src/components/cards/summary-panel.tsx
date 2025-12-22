import { ThemedText } from '@/ui/primitives/themed-text';
import { ThemedView } from '@/ui/primitives/themed-view';
import { useAppTheme } from '@/ui/theming';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface SummaryItem {
  label: string;
  value: string;
  isTotal?: boolean;
  isHighlight?: boolean;
}

interface SummaryPanelProps {
  items: SummaryItem[];
  title?: string;
  style?: ViewStyle;
}

export function SummaryPanel({ items, title, style }: SummaryPanelProps) {
  const theme = useAppTheme();

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.colors.surface }, style]} surface={2}>
      {title && (
        <ThemedText type="subtitle" style={styles.title}>{title}</ThemedText>
      )}
      
      <View style={styles.content}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <View style={styles.row}>
              <ThemedText style={styles.label}>{item.label}</ThemedText>
              <ThemedText 
                type={item.isTotal ? 'title' : 'defaultSemiBold'} 
                style={[
                  styles.value,
                  item.isTotal && { color: theme.tenant.mainColor },
                  item.isHighlight && { color: theme.tenant.accentColor }
                ]}
              >
                {item.value}
              </ThemedText>
            </View>
            {index < items.length - 1 && !item.isTotal && (
              <View style={[styles.divider, { backgroundColor: theme.colors.borderSubtle }]} />
            )}
          </React.Fragment>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    width: '100%',
  },
  title: {
    marginBottom: 16,
    fontSize: 14,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    opacity: 0.6,
  },
  value: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    width: '100%',
    opacity: 0.5,
  },
});
