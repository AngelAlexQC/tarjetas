import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import { Check } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';

interface OptionCardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  rightElement?: React.ReactNode;
  iconColor?: string;
}

export function OptionCard({ 
  title, 
  description, 
  icon, 
  selected, 
  onPress, 
  style,
  rightElement,
  iconColor
}: OptionCardProps) {
  const theme = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: selected ? theme.colors.surfaceHigher : theme.colors.surface,
          borderColor: selected ? theme.tenant.mainColor : theme.colors.border,
          opacity: pressed ? 0.8 : 1,
        },
        style
      ]}
    >
      <View style={styles.content}>
        {icon && (
          <View style={[
            styles.iconContainer, 
            { backgroundColor: selected ? theme.tenant.mainColor : theme.colors.surfaceHigher }
          ]}>
            {/* We clone the icon to inject color if needed, or just render it */}
            {React.isValidElement(icon) ? React.cloneElement(icon as any, { 
              color: selected ? '#FFF' : (iconColor || theme.colors.textSecondary),
              size: 24
            }) : icon}
          </View>
        )}
        
        <View style={styles.textContainer}>
          <ThemedText type="defaultSemiBold" style={selected && { color: theme.tenant.mainColor }}>
            {title}
          </ThemedText>
          {description && (
            <ThemedText style={styles.description}>{description}</ThemedText>
          )}
        </View>

        {rightElement || (selected && (
          <View style={[styles.checkContainer, { backgroundColor: theme.tenant.mainColor }]}>
            <Check size={12} color="#FFF" />
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  description: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  checkContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
