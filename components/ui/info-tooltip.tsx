/**
 * InfoTooltip - Tooltip accesible con glassmorphism
 * Diseño 2025: Clean, animated, con soporte para dark mode
 */

import { ThemedText } from '@/components/themed-text';
import { CalendarIcon } from '@/components/ui/icons';
import { useTour } from '@/contexts/tour-context';
import { useAppTheme } from '@/hooks/use-app-theme';
import { BlurView } from 'expo-blur';
import * as Calendar from 'expo-calendar';
import React, { useState } from 'react';
import { Alert, Dimensions, Linking, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';

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
  extraContent?: React.ReactNode | ((props: { close: () => void }) => React.ReactNode);
  /** Elemento hijo que activa el tooltip */
  children: React.ReactNode;
  /** Posición del tooltip relativo al hijo */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  /** Modo de activación del tooltip */
  triggerMode?: 'press' | 'longPress';
  /** Identificador único para el tour (opcional) */
  tourKey?: string;
  /** Orden en el tour (opcional) */
  tourOrder?: number;
  /** Duración del tooltip en ms cuando es parte de un tour (default: 5000ms) */
  tourDuration?: number;
  /** Acción a ejecutar al presionar (si triggerMode es longPress o si se quiere encadenar) */
  onPress?: () => void;
  /** Radio del borde del elemento resaltado (default: 12) */
  targetBorderRadius?: number;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  title,
  calendarEvent,
  extraContent,
  children,
  placement = 'top',
  triggerMode = 'press',
  tourKey,
  tourOrder = 0,
  tourDuration = 5000,
  onPress,
  targetBorderRadius,
}) => {
  const theme = useAppTheme();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const { register, unregister, onTooltipClosed } = useTour();
  const [isVisible, setIsVisible] = useState(false);
  const [openedByTour, setOpenedByTour] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const triggerRef = React.useRef<View>(null);

  // Default radius based on platform if not provided
  const defaultRadius = Platform.OS === 'ios' ? 12 : 16;
  const finalBorderRadius = targetBorderRadius ?? defaultRadius;

  // Registrar en el tour si hay tourKey
  React.useEffect(() => {
    if (tourKey) {
      register(tourKey, () => {
        // Auto-open logic
        if (triggerRef.current) {
          triggerRef.current.measure((x, y, width, height, pageX, pageY) => {
            setTriggerLayout({ x: pageX, y: pageY, width, height });
            setOpenedByTour(true);
            setIsVisible(true);
          });
        }
      }, tourOrder);
      return () => unregister(tourKey);
    }
  }, [tourKey, tourOrder, register, unregister]);

  const handlePress = (event: any) => {
    if (triggerMode === 'press') {
      event.target.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setTriggerLayout({ x: pageX, y: pageY, width, height });
        setOpenedByTour(false);
        setIsVisible(true);
      });
    } else if (onPress) {
      onPress();
    }
  };

  const handleLongPress = (event: any) => {
    if (triggerMode === 'longPress') {
      event.target.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
        setTriggerLayout({ x: pageX, y: pageY, width, height });
        setOpenedByTour(false);
        setIsVisible(true);
      });
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    if (tourKey) {
      onTooltipClosed(tourKey);
    }
  };

  return (
    <>
      <Pressable
        ref={triggerRef}
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={500}
        accessibilityRole="button"
        accessibilityLabel={title || 'Información'}
        accessibilityHint="Toca para ver más detalles"
        collapsable={false} // Importante para measure en Android
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
        <SpotlightOverlay 
          layout={triggerLayout} 
          onClose={handleClose} 
          borderRadius={finalBorderRadius}
        />
        
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[
            styles.tooltipContainer,
            getTooltipPosition(triggerLayout, placement, insets),
          ]}
        >
          {Platform.OS === 'ios' ? (
            <BlurView
              intensity={80}
              tint="systemMaterial"
              style={[styles.tooltipContent, { borderColor: theme.colors.borderSubtle }]}
            >
              <TooltipContent 
                title={title} 
                content={content} 
                calendarEvent={calendarEvent} 
                extraContent={extraContent}
                onClose={handleClose}
                isTour={openedByTour}
                duration={tourDuration}
              />
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
              <TooltipContent 
                title={title} 
                content={content} 
                calendarEvent={calendarEvent} 
                extraContent={extraContent}
                onClose={handleClose}
                isTour={openedByTour}
                duration={tourDuration}
              />
            </View>
          )}
        </Animated.View>
      </Modal>
    </>
  );
};

const SpotlightOverlay = ({ 
  layout, 
  onClose, 
  borderRadius 
}: { 
  layout: { x: number, y: number, width: number, height: number }, 
  onClose: () => void,
  borderRadius: number
}) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const overlayColor = 'rgba(0, 0, 0, 0.7)'; 
  const padding = 4;

  // Ajustar layout con padding
  const x = layout.x - padding;
  const y = layout.y - padding;
  const w = layout.width + (padding * 2);
  const h = layout.height + (padding * 2);

  // Componente para las esquinas invertidas (Spandrels)
  // Crea un relleno del color del overlay con un recorte circular transparente
  const InvertedCorner = ({ style, position }: { style: any, position: 'TL' | 'TR' | 'BL' | 'BR' }) => {
    const R = borderRadius;
    // Parámetros para crear el círculo hueco
    // Usamos un borde grueso para crear el relleno exterior
    const size = 4 * R;
    const radius = 2 * R;
    const border = R;
    
    let top = 0, left = 0;
    // Ajustar posición del círculo hueco según la esquina
    switch (position) {
      case 'TL': top = -R; left = -R; break;
      case 'TR': top = -R; left = -2 * R; break;
      case 'BL': top = -2 * R; left = -R; break;
      case 'BR': top = -2 * R; left = -2 * R; break;
    }

    return (
      <View style={[style, { width: R, height: R, overflow: 'hidden' }]}>
        <View style={{
          position: 'absolute',
          top,
          left,
          width: size,
          height: size,
          borderRadius: radius,
          borderWidth: border,
          borderColor: overlayColor,
          backgroundColor: 'transparent',
        }} />
      </View>
    );
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Top */}
      <Pressable 
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: Math.max(0, y), backgroundColor: overlayColor }} 
        onPress={onClose} 
      />
      {/* Bottom */}
      <Pressable 
        style={{ position: 'absolute', top: y + h, left: 0, right: 0, bottom: 0, backgroundColor: overlayColor }} 
        onPress={onClose} 
      />
      {/* Left */}
      <Pressable 
        style={{ position: 'absolute', top: y, left: 0, width: Math.max(0, x), height: h, backgroundColor: overlayColor }} 
        onPress={onClose} 
      />
      {/* Right */}
      <Pressable 
        style={{ position: 'absolute', top: y, left: x + w, right: 0, height: h, backgroundColor: overlayColor }} 
        onPress={onClose} 
      />

      {/* Esquinas Invertidas para redondear el hueco */}
      <InvertedCorner style={{ position: 'absolute', top: y, left: x }} position="TL" />
      <InvertedCorner style={{ position: 'absolute', top: y, left: x + w - borderRadius }} position="TR" />
      <InvertedCorner style={{ position: 'absolute', top: y + h - borderRadius, left: x + w - borderRadius }} position="BR" />
      <InvertedCorner style={{ position: 'absolute', top: y + h - borderRadius, left: x }} position="BL" />
      
      {/* Highlight Border */}
      <Animated.View 
        entering={FadeIn.duration(300)}
        style={{
          position: 'absolute',
          top: y,
          left: x,
          width: w,
          height: h,
          borderRadius: borderRadius,
          borderWidth: 2,
          borderColor: 'rgba(255, 255, 255, 0.5)',
          backgroundColor: 'transparent',
          shadowColor: "#FFF",
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 10,
        }} 
        pointerEvents="none"
      />
    </View>
  );
};

interface TooltipContentProps {
  title?: string;
  content: string;
  calendarEvent?: CalendarEventConfig;
  extraContent?: React.ReactNode | ((props: { close: () => void }) => React.ReactNode);
  onClose: () => void;
  isTour?: boolean;
  duration?: number;
}

const TooltipContent: React.FC<TooltipContentProps> = ({ 
  title, 
  content, 
  calendarEvent, 
  extraContent, 
  onClose,
  isTour,
  duration = 5000
}) => {
  const styles = useStyles();
  const theme = useAppTheme();
  const progress = useSharedValue(0);

  React.useEffect(() => {
    if (isTour) {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: duration,
        easing: Easing.linear,
      }, (finished) => {
        if (finished) {
          runOnJS(onClose)();
        }
      });
    }
  }, [isTour, duration, onClose, progress]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

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
      
      {/* Botón de calendario */}
      {calendarEvent && (
        <Pressable 
          onPress={handleAddToCalendar}
          style={({ pressed }) => [
            styles.calendarButton,
            { opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <CalendarIcon size={16} color={theme.tenant.mainColor} />
          <ThemedText style={[styles.calendarButtonText, { color: theme.tenant.mainColor }]}>
            Añadir al calendario
          </ThemedText>
        </Pressable>
      )}

      {/* Contenido extra */}
      {extraContent && (
        <View style={styles.extraContent}>
          {typeof extraContent === 'function' 
            ? extraContent({ close: onClose })
            : extraContent
          }
        </View>
      )}

      {/* Barra de progreso para tours */}
      {isTour && (
        <View style={styles.progressBarContainer}>
          <Animated.View 
            style={[
              styles.progressBar, 
              { backgroundColor: theme.tenant.mainColor },
              progressStyle
            ]} 
          />
        </View>
      )}

      {/* Hint de cierre para modo manual */}
      {!isTour && (
        <View style={styles.dismissHint}>
          <ThemedText style={styles.dismissText}>
            Toca fuera para cerrar
          </ThemedText>
        </View>
      )}
    </View>
  );
};

// Calcular posición del tooltip basado en el trigger
function getTooltipPosition(
  layout: { x: number; y: number; width: number; height: number },
  placement: 'top' | 'bottom' | 'left' | 'right',
  insets: EdgeInsets
) {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const offset = 8;
  const tooltipWidth = 280; // Ancho máximo estimado
  const padding = 16; // Margen de seguridad con los bordes

  let style: any = {};

  // Lógica horizontal común para top/bottom
  if (placement === 'top' || placement === 'bottom') {
    // Intentar centrar respecto al elemento
    let left = layout.x + (layout.width / 2) - (tooltipWidth / 2);

    // Clamping (ajuste a bordes)
    const minLeft = insets.left + padding;
    const maxLeft = screenWidth - insets.right - tooltipWidth - padding;

    if (left < minLeft) {
      left = minLeft;
    } else if (left > maxLeft) {
      left = maxLeft;
    }
    style.left = left;
  }

  switch (placement) {
    case 'top':
      // Usamos bottom para posicionar desde abajo y que crezca hacia arriba
      style.bottom = screenHeight - layout.y + offset;
      // Restringir top para respetar safe area
      style.top = insets.top + padding;
      // Alinear contenido al fondo (cerca del trigger)
      style.justifyContent = 'flex-end';
      break;
    case 'bottom':
      style.top = layout.y + layout.height + offset;
      // Restringir bottom para respetar safe area
      style.bottom = insets.bottom + padding;
      // Alinear contenido al inicio (cerca del trigger)
      style.justifyContent = 'flex-start';
      break;
    case 'left':
      style.right = screenWidth - layout.x + offset;
      style.top = layout.y; // Alineación top simple para laterales
      style.maxWidth = layout.x - padding - offset - insets.left; // Limitar ancho disponible
      break;
    case 'right':
      style.left = layout.x + layout.width + offset;
      style.top = layout.y;
      style.maxWidth = screenWidth - style.left - padding - insets.right;
      break;
  }

  return style;
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
      color: theme.colors.text,
      fontWeight: '400',
    },
    extraContent: {
      marginTop: 12,
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
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
      borderRadius: 8,
    },
    calendarButtonText: {
      fontSize: 12,
      fontWeight: '600',
    },
    progressContainer: {
      height: 4,
      borderRadius: 2,
      overflow: 'hidden',
      marginTop: 8,
    },
    progressBar: {
      height: '100%',
      borderRadius: 1.5,
    },
    progressBarContainer: {
      height: 3,
      backgroundColor: 'rgba(0,0,0,0.05)',
      marginTop: 12,
      borderRadius: 1.5,
      overflow: 'hidden',
      width: '100%',
    },
  });

function useStyles() {
  const theme = useAppTheme();
  return React.useMemo(() => createStyles(theme), [theme]);
}
