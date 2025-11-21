import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { OperationResult } from '@/features/cards/types/card-operations';
import { useAppTheme } from '@/hooks/use-app-theme';
import { CheckCircle2, Share2, XCircle } from 'lucide-react-native';
import React from 'react';
import { Share, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

interface OperationResultScreenProps {
  result: OperationResult;
  onClose: () => void;
}

export function OperationResultScreen({ result, onClose }: OperationResultScreenProps) {
  const theme = useAppTheme();

  const isSuccess = result.success;
  const Icon = isSuccess ? CheckCircle2 : XCircle;
  const color = isSuccess ? '#4CAF50' : '#F44336'; // Success Green / Error Red

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${result.title}\n\n${result.message}\n\nComprobante: ${result.receiptId || 'N/A'}`,
        title: result.title,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ThemedView style={styles.container} surface="level1">
      <View style={styles.content}>
        <Animated.View entering={ZoomIn.duration(500).springify().damping(15)}>
          <Icon size={80} color={color} strokeWidth={1.5} />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)} style={styles.textContainer}>
          <ThemedText type="title" style={{ color: theme.colors.text, textAlign: 'center' }}>
            {result.title}
          </ThemedText>
          <ThemedText style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
            {result.message}
          </ThemedText>
          
          {result.receiptId && (
            <ThemedView style={styles.receiptContainer} surface="level2">
              <ThemedText type="defaultSemiBold">Comprobante:</ThemedText>
              <ThemedText style={{ fontFamily: 'monospace' }}>{result.receiptId}</ThemedText>
            </ThemedView>
          )}
        </Animated.View>
      </View>

      <View style={styles.footer}>
        {isSuccess && (
          <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.surfaceHigher }]} onPress={handleShare}>
            <Share2 size={20} color={theme.colors.text} />
            <ThemedText>Compartir</ThemedText>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.tenant.mainColor }]} 
          onPress={onClose}
        >
          <ThemedText style={{ color: theme.colors.textInverse, fontWeight: 'bold' }}>
            {isSuccess ? 'Finalizar' : 'Intentar de nuevo'}
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  receiptContainer: {
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  footer: {
    gap: 12,
    paddingBottom: 24,
  },
  button: {
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  }
});
