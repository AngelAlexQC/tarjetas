import { ViewStyle } from "react-native";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

// Ícono de Candado (Bloquear tarjeta)
export const LockIcon = ({ size = 24, color = "#FFFFFF" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="16" r="1.5" fill={color} />
  </Svg>
);

export const CalendarIcon = ({ size = 24, color = "#FFFFFF" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="16" y1="2" x2="16" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="8" y1="2" x2="8" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="3" y1="10" x2="21" y2="10" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Circle cx="8" cy="15" r="1" fill={color} />
    <Circle cx="12" cy="15" r="1" fill={color} />
    <Circle cx="16" cy="15" r="1" fill={color} />
  </Svg>
);

export const ChartIcon = ({ size = 24, color = "#FFFFFF" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3V21H21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 16L11 12L15 15L21 8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="7" cy="16" r="2" fill={color} />
    <Circle cx="11" cy="12" r="2" fill={color} />
    <Circle cx="15" cy="15" r="2" fill={color} />
    <Circle cx="21" cy="8" r="2" fill={color} />
  </Svg>
);

// Ícono de Dinero (Avances)
export const MoneyIcon = ({ size = 24, color = "#FFFFFF" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle
      cx="12"
      cy="12"
      r="9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14.5 8.5C14.5 8.5 13 7 11 7C9 7 8 8 8 9.5C8 11 9 11.5 11 12C13 12.5 14 13 14 14.5C14 16 13 17 11 17C9 17 7.5 15.5 7.5 15.5"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="12" y1="5" x2="12" y2="7" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="17" x2="12" y2="19" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Ícono de Gráfico de Barras (Cupos/Límites)
export const BarChartIcon = ({ size = 24, color = "#FFFFFF" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="13" width="4" height="8" rx="1" fill={color} />
    <Rect x="10" y="9" width="4" height="12" rx="1" fill={color} />
    <Rect x="17" y="5" width="4" height="16" rx="1" fill={color} />
  </Svg>
);

// Ícono de PIN (Cambiar PIN)
export const PinIcon = ({ size = 24, color = "#FFFFFF" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="8"
      width="18"
      height="13"
      rx="2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 8V6C7 4.67392 7.52678 3.40215 8.46447 2.46447C9.40215 1.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="8" cy="15" r="1.5" fill={color} />
    <Circle cx="12" cy="15" r="1.5" fill={color} />
    <Circle cx="16" cy="15" r="1.5" fill={color} />
  </Svg>
);

// Ícono de Campana (Notificaciones)
export const BellIcon = ({ size = 24, color = "#FFFFFF" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="18" cy="6" r="3" fill="#FF6B6B" />
  </Svg>
);

// Ícono de Tarjeta de Crédito
export const CreditCardIcon = ({ size = 24, color = "#FFFFFF" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="2"
      y="5"
      width="20"
      height="14"
      rx="2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="2" y1="10" x2="22" y2="10" stroke={color} strokeWidth="2" />
    <Rect x="6" y="14" width="4" height="2" rx="0.5" fill={color} />
    <Rect x="12" y="14" width="6" height="2" rx="0.5" fill={color} />
  </Svg>
);

// Ícono de Billetera
export const WalletIcon = ({ size = 24, color = "#FFFFFF" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 4H3C1.89543 4 1 4.89543 1 6V18C1 19.1046 1.89543 20 3 20H21C22.1046 20 23 19.1046 23 18V6C23 4.89543 22.1046 4 21 4Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 10H23"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="18" cy="14" r="2" fill={color} />
  </Svg>
);

// Ícono de Transferencia
export const TransferIcon = ({ size = 24, color = "#FFFFFF" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 16L3 12L7 8"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17 8L21 12L17 16"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="3" y1="12" x2="12" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="12" x2="21" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

// Ícono de Desbloquear
export const UnlockIcon = ({ size = 24, color = "#FFFFFF" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19 11H5C3.89543 11 3 11.8954 3 13V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V13C21 11.8954 20.1046 11 19 11Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="16" r="1.5" fill={color} />
  </Svg>
);

// Mapa de íconos por tipo de acción
export const FinancialIcons = {
  lock: LockIcon,
  unlock: UnlockIcon,
  calendar: CalendarIcon,
  chart: ChartIcon,
  money: MoneyIcon,
  barChart: BarChartIcon,
  pin: PinIcon,
  bell: BellIcon,
  creditCard: CreditCardIcon,
  wallet: WalletIcon,
  transfer: TransferIcon,
};

export type FinancialIconType = keyof typeof FinancialIcons;
