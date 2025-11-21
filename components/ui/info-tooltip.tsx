/**
 * InfoTooltip - Tooltip accesible con glassmorphism
 * Diseño 2025: Clean, animated, con soporte para dark mode
 */

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/hooks/use-app-theme';
import * as Calendar from 'expo-calendar';
import { BlurView } from 'expo-blur';
import React, { useState } from 'react';
import { Alert, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export interface CalendarEventConfig {
  title: string;
  startDate: Date;
  endDate?: Date;
  notes?: string;
}

export interface InfoTooltipProps {
  /** Contenido del tooltip */
  content: string;
  /** Título opcional del tooltip */
  title?: string;
  /** Configuración para añadir evento al calendario */
  calendarEvent?: CalendarEventConfig;
  /** Elemento hijo que activa el tooltip */
  children: React.ReactNode;
  /** Posición del tooltip relativo al hijo */
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  title,
  calendarEvent,
  children,
  placement = 'top',
}) => {
  const theme = useAppTheme();
  const styles = useStyles();
  const [isVisible, setIsVisible] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const handlePress = (event: any) => {
    event.target.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
      setTriggerLayout({ x: pageX, y: pageY, width, height });
      setIsVisible(true);
    });
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={title || 'Información'}
        accessibilityHint="Toca para ver más detalles"
      >
        {children}
      </Pressable>

      <Modal
        visible={isVisible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
        statusBarTranslucent
      >
        <Pressable 
          style={styles.overlay} 
          onPress={handleClose}
          accessibilityLabel="Cerrar información"
          accessibilityRole="button"
        >
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={[
              styles.tooltipContainer,
              getTooltipPosition(triggerLayout, placement),
            ]}
          >
            {Platform.OS === 'ios' ? (
              <BlurView
                intensity={theme.isDark ? 40 : 25}
                tint={theme.isDark ? 'dark' : 'light'}
                style={[styles.tooltipContent, { borderColor: theme.colors.borderSubtle }]}
              >
                <TooltipContent title={title} content={content} calendarEvent={calendarEvent} />
              </BlurView>
            ) : (
              <View
                style={[
                  styles.tooltipContent,
                  styles.androidTooltip,
                  {
                    backgroundColor: theme.isDark
                      ? 'rgba(28, 28, 30, 0.95)'
                      : 'rgba(255, 255, 255, 0.98)',
                    borderColor: theme.colors.borderSubtle,
                  },
                ]}
              >
                <TooltipContent title={title} content={content} calendarEvent={calendarEvent} />
              </View>
            )}
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
};

interface TooltipContentProps {
  title?: string;
  content: string;
  calendarEvent?: CalendarEventConfig;
}

const TooltipContent: React.FC<TooltipContentProps> = ({ title, content, calendarEvent }) => {
  const styles = useStyles();
  const theme = useAppTheme();

  const handleAddToCalendar = async () => {
    if (!calendarEvent) return;

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendarSource =
          Platform.OS === 'ios'
            ? await Calendar.getDefaultCalendarSourceAsync()
            : { isLocalAccount: true, name: 'Expo Calendar' };
            
        let defaultCalendarId;
        
        if (Platform.OS === 'ios') {
           const defaultCalendar = calendars.find(c => c.source.id === defaultCalendarSource.id);
           defaultCalendarId = defaultCalendar?.id;
        } else {
           // En Android, buscamos un calendario editable
           const editableCalendar = calendars.find(c => c.accessLevel === Calendar.CalendarAccessLevel.OWNER || c.accessLevel === Calendar.CalendarAccessLevel.EDITOR);
           defaultCalendarId = editableCalendar?.id;
        }

        if (!defaultCalendarId) {
            Alert.alert('Error', 'No se encontró un calendario disponible');
            return;
        }

        const endDate = calendarEvent.endDate || new Date(calendarEvent.startDate.getTime() + 60 * 60 * 1000); // 1 hora por defecto

        await Calendar.createEventAsync(defaultCalendarId, {
          title: calendarEvent.title,
          startDate: calendarEvent.startDate,
          endDate: endDate,
          notes: calendarEvent.notes,
          timeZone: 'GMT',
        });
        
        Alert.alert('Éxito', 'Evento añadido al calendario');
      } else {
        Alert.alert('Permiso denegado', 'Se necesitan permisos de calendario para añadir el evento.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo añadir el evento al calendario');
    }
  };

  return (
    <View style={styles.contentWrapper}>
      {title && (
        <ThemedText style={styles.tooltipTitle}>{title}</ThemedText>
      )}
      <ThemedText style={styles.tooltipText}>{content}</ThemedText>
      
      {calendarEvent && (
        <Pressable 
          style={({ pressed }) => [
            styles.calendarButton,
            { opacity: pressed ? 0.7 : 1, backgroundColor: theme.colors.primary }
          ]}
          onPress={handleAddToCalendar}
        >
          <ThemedText style={styles.calendarButtonText}>Añadir al calendario</ThemedText>
        </Pressable>
      )}

      <View style={styles.dismissHint}>
        <ThemedText style={styles.dismissText}>Toca para cerrar</ThemedText>
      </View>
    </View>
  );
};

// Calcular posición del tooltip basado en el trigger
function getTooltipPosition(
  layout: { x: number; y: number; width: number; height: number },
  placement: 'top' | 'bottom' | 'left' | 'right'
) {
  const offset = 8;
  const tooltipWidth = 280;
  const tooltipHeight = 120;

  switch (placement) {
    case 'top':
      return {
        left: layout.x + layout.width / 2 - tooltipWidth / 2,
        top: layout.y - tooltipHeight - offset,
      };
    case 'bottom':
      return {
        left: layout.x + layout.width / 2 - tooltipWidth / 2,
        top: layout.y + layout.height + offset,
      };
    case 'left':
      return {
        left: layout.x - tooltipWidth - offset,
        top: layout.y + layout.height / 2 - tooltipHeight / 2,
      };
    case 'right':
      return {
        left: layout.x + layout.width + offset,
        top: layout.y + layout.height / 2 - tooltipHeight / 2,
      };
  }
}

const createStyles = (theme: ReturnType<typeof useAppTheme>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    tooltipContainer: {
      position: 'absolute',
      maxWidth: 280,
      minWidth: 200,
    },
    tooltipContent: {
      borderRadius: 12,
      borderWidth: 0.5,
      overflow: 'hidden',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    androidTooltip: {
      backgroundColor: theme.isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    },
    contentWrapper: {
      padding: 16,
      gap: 8,
    },
    tooltipTitle: {
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: -0.2,
      color: theme.colors.text,
      marginBottom: 4,
    },
    tooltipText: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.colors.textSecondary,
      fontWeight: '400',
    },
    dismissHint: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 0.5,
      borderTopColor: theme.colors.borderSubtle,
    },
    dismissText: {
      fontSize: 11,
      opacity: 0.5,
      textAlign: 'center',
      color: theme.colors.textSecondary,
    },
    calendarButton: {
      marginTop: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    calendarButtonText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
    },
  });

function useStyles() {
  const theme = useAppTheme();
  return React.useMemo(() => createStyles(theme), [theme]);
}
