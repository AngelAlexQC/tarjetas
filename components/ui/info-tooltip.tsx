/**
 * InfoTooltip - Tooltip accesible con glassmorphism
 * Diseño 2025: Clean, animated, con soporte para dark mode
 */

import { ThemedText } from '@/components/themed-text';
import { CalendarIcon } from '@/components/ui/icons';
import { useAppTheme } from '@/hooks/use-app-theme';
import { BlurView } from 'expo-blur';
import * as Calendar from 'expo-calendar';
import React, { useState } from 'react';
import { Alert, Linking, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
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
  /** Contenido extra opcional (ej. controles interactivos) */
  extraContent?: React.ReactNode;
  /** Elemento hijo que activa el tooltip */
  children: React.ReactNode;
  /** Posición del tooltip relativo al hijo */
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  title,
  calendarEvent,
  extraContent,
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
                <TooltipContent title={title} content={content} calendarEvent={calendarEvent} extraContent={extraContent} />
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
                <TooltipContent title={title} content={content} calendarEvent={calendarEvent} extraContent={extraContent} />
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
  extraContent?: React.ReactNode;
}

const TooltipContent: React.FC<TooltipContentProps> = ({ title, content, calendarEvent, extraContent }) => {
  const styles = useStyles();
  const theme = useAppTheme();

  const handleAddToCalendar = async () => {
    if (!calendarEvent) return;

    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesitan permisos de calendario para añadir el evento.');
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
      let defaultCalendarId;

      if (Platform.OS === 'ios') {
        try {
          const defaultCalendar = await Calendar.getDefaultCalendarAsync();
          defaultCalendarId = defaultCalendar.id;
        } catch {
          // Fallback para iOS si falla getDefaultCalendarAsync
          defaultCalendarId = calendars[0]?.id;
        }
      } else {
        // Lógica específica para Android
        // 1. Buscar calendario primario editable
        const primaryCalendar = calendars.find(c => c.isPrimary && (c.accessLevel === Calendar.CalendarAccessLevel.OWNER || c.accessLevel === Calendar.CalendarAccessLevel.EDITOR));
        
        if (primaryCalendar) {
          defaultCalendarId = primaryCalendar.id;
        } else {
          // 2. Buscar cualquier calendario editable (Google Calendar, etc.)
          const editableCalendar = calendars.find(c => c.accessLevel === Calendar.CalendarAccessLevel.OWNER || c.accessLevel === Calendar.CalendarAccessLevel.EDITOR);
          defaultCalendarId = editableCalendar?.id;
        }
      }

      if (!defaultCalendarId) {
        Alert.alert('Error', 'No se encontró un calendario disponible para guardar el evento.');
        return;
      }

      const endDate = calendarEvent.endDate || new Date(calendarEvent.startDate.getTime() + 60 * 60 * 1000); // 1 hora por defecto
      
      // Obtener la zona horaria del dispositivo para Android
      const timeZone = Platform.OS === 'android' 
        ? (Intl.DateTimeFormat().resolvedOptions().timeZone || 'GMT')
        : undefined;

      const eventId = await Calendar.createEventAsync(defaultCalendarId, {
        title: calendarEvent.title,
        startDate: calendarEvent.startDate,
        endDate: endDate,
        notes: calendarEvent.notes,
        timeZone,
      });
      
      Alert.alert(
        'Éxito',
        'Evento añadido al calendario correctamente',
        [
          { text: 'OK' },
          { 
            text: 'Ver evento', 
            onPress: async () => {
              if (Platform.OS === 'android') {
                // Android: Abrir calendario en la fecha del evento (más confiable que por ID)
                try {
                  const timeUri = `content://com.android.calendar/time/${calendarEvent.startDate.getTime()}`;
                  const canOpen = await Linking.canOpenURL(timeUri);
                  if (canOpen) {
                    await Linking.openURL(timeUri);
                    return;
                  }
                } catch (e) {
                  console.warn('Error trying to open Android calendar by time', e);
                }
                // Fallback si falla la apertura por tiempo
                Calendar.openEventInCalendar(eventId);
              } else {
                // iOS: Abrir calendario en la fecha del evento
                // calshow: espera segundos desde 2001-01-01
                const referenceDate = new Date('2001-01-01T00:00:00Z').getTime();
                const secondsSinceRef = (calendarEvent.startDate.getTime() - referenceDate) / 1000;
                const url = `calshow:${secondsSinceRef}`;
                Linking.openURL(url);
              }
            } 
          }
        ]
      );
      
    } catch (error) {
      console.error('Error adding to calendar:', error);
      Alert.alert('Error', 'Ocurrió un problema al intentar guardar el evento.');
    }
  };

  return (
    <View style={styles.contentWrapper}>
      {title && (
        <ThemedText style={styles.tooltipTitle}>{title}</ThemedText>
      )}
      <ThemedText style={styles.tooltipText}>{content}</ThemedText>
      
      {extraContent && (
        <View style={styles.extraContent}>
          {extraContent}
        </View>
      )}

      {calendarEvent && (
        <Pressable 
          style={({ pressed }) => [
            styles.calendarButton,
            { 
              backgroundColor: theme.tenant.mainColor,
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }]
            }
          ]}
          onPress={handleAddToCalendar}
        >
          <CalendarIcon size={16} color="#FFFFFF" />
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
    extraContent: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 0.5,
      borderTopColor: theme.colors.borderSubtle,
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
      marginTop: 16,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      ...Platform.select({
        ios: {
          shadowColor: theme.tenant.mainColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
          shadowColor: theme.tenant.mainColor,
        },
      }),
    },
    calendarButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
  });

function useStyles() {
  const theme = useAppTheme();
  return React.useMemo(() => createStyles(theme), [theme]);
}
