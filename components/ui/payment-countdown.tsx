import { useAppTheme } from '@/hooks/use-app-theme';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ThemedText } from '../themed-text';

interface PaymentCountdownProps {
  dueDate: Date;
  totalDays?: number;
  size?: number;
}

export const PaymentCountdown: React.FC<PaymentCountdownProps> = ({
  dueDate,
  totalDays = 30,
  size = 60,
}) => {
  const theme = useAppTheme();
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    const calculateDays = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(dueDate);
      due.setHours(0, 0, 0, 0);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(Math.max(0, diffDays));
    };

    calculateDays();
    const interval = setInterval(calculateDays, 1000 * 60 * 60); // Actualizar cada hora
    return () => clearInterval(interval);
  }, [dueDate]);

  const progress = Math.min(1, Math.max(0, daysRemaining / totalDays));
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);
  const center = size / 2;

  // Colores según urgencia
  const getUrgencyColor = () => {
    return theme.tenant.mainColor; // Color del tenant - normal
  };

  const urgencyColor = getUrgencyColor();

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { width: size, height: size }]}>
        <View style={styles.svgContainer}>
          <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Círculo de fondo */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* Círculo de progreso */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke={urgencyColor}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${center} ${center})`}
            />
          </Svg>
        </View>
        <View style={styles.content}>
          <ThemedText style={[styles.days, { color: urgencyColor }]}>
            {daysRemaining}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={styles.label}>
        {daysRemaining === 1 ? 'día' : 'días'}
      </ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  days: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 18,
  },
  label: {
    fontSize: 7,
    fontWeight: '600',
    opacity: 0.5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1,
  },
});
