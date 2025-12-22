import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/ui/primitives/themed-text';
import { useAppTheme } from '@/ui/theming';

export interface DocumentTypeInfo {
  code: string;
  name: string;
}

interface DocumentTypeSelectorProps {
  documentTypes: string[];
  documentTypeDetails?: DocumentTypeInfo[];
  selectedType: string;
  onSelect: (type: string) => void;
  disabled?: boolean;
}

export function DocumentTypeSelector({
  documentTypes,
  documentTypeDetails = [],
  selectedType,
  onSelect,
  disabled = false,
}: DocumentTypeSelectorProps) {
  const theme = useAppTheme();

  if (documentTypes.length <= 1) {
    return null;
  }

  const getDisplayName = (code: string) => {
    const detail = documentTypeDetails.find(d => d.code === code);
    return detail ? detail.name : code;
  };

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.label, { color: theme.colors.textSecondary }]}>
        Tipo de Documento
      </ThemedText>
      <View style={styles.buttonsContainer}>
        {documentTypes.map((type) => (
          <Pressable
            key={type}
            onPress={() => !disabled && onSelect(type)}
            disabled={disabled}
            style={[
              styles.button,
              {
                backgroundColor: selectedType === type 
                  ? theme.tenant.mainColor 
                  : theme.colors.surface,
                borderColor: selectedType === type
                  ? theme.tenant.mainColor
                  : theme.colors.border,
                opacity: disabled ? 0.5 : 1,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.buttonText,
                {
                  color: selectedType === type
                    ? theme.tenant.textOnPrimary
                    : theme.colors.text,
                },
              ]}
            >
              {getDisplayName(type)}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
