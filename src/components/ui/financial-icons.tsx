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

// Ícono de Avión (Viajes)
export const PlaneIcon = ({ size = 24, color = "#FFFFFF" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 2L15 22L11 13L2 9L22 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Ícono de Ajustes (Canales)
export const SettingsIcon = ({ size = 24, color = "#FFFFFF" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path
      d="M19.4 15C19.6 14.3 19.7 13.7 19.7 13C19.7 12.3 19.6 11.7 19.4 11L21.4 9.3C21.6 9.1 21.7 8.8 21.6 8.6L19.7 5.3C19.6 5.1 19.3 5 19.1 5.1L16.7 6C16.2 5.6 15.7 5.3 15.1 5L14.7 2.5C14.7 2.2 14.5 2 14.2 2H10.4C10.1 2 9.9 2.2 9.9 2.5L9.5 5C8.9 5.3 8.4 5.6 7.9 6L5.5 5.1C5.3 5 5 5.1 4.9 5.3L3 8.6C2.9 8.8 3 9.1 3.2 9.3L5.2 11C5 11.7 4.9 12.3 4.9 13C4.9 13.7 5 14.3 5.2 15L3.2 16.7C3 16.9 2.9 17.2 3 17.4L4.9 20.7C5 20.9 5.3 21 5.5 20.9L7.9 20C8.4 20.4 8.9 20.7 9.5 21L9.9 23.5C9.9 23.8 10.1 24 10.4 24H14.2C14.5 24 14.7 23.8 14.7 23.5L15.1 21C15.7 20.7 16.2 20.4 16.7 20L19.1 20.9C19.3 21 19.6 20.9 19.7 20.7L21.6 17.4C21.7 17.2 21.6 16.9 21.4 16.7L19.4 15Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Ícono de Ojo (CVV)
export const EyeIcon = ({ size = 24, color = "#FFFFFF" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Ícono de Refrescar (Reposición)
export const RefreshIcon = ({ size = 24, color = "#FFFFFF" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M23 4V10H17"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 20V14H7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.51 9C4.01717 7.56678 4.87913 6.2854 6.00929 5.28204C7.13946 4.27869 8.49842 3.58907 9.95088 3.28129C11.4033 2.97352 12.8993 3.05813 14.2905 3.52681C15.6817 3.99549 16.9198 4.83199 17.88 5.95L23 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20.49 15C19.9828 16.4332 19.1209 17.7146 17.9907 18.718C16.8605 19.7213 15.5016 20.4109 14.0491 20.7187C12.5967 21.0265 11.1007 20.9419 9.70952 20.4732C8.31835 20.0045 7.08022 19.168 6.12 18.05L1 14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Ícono de Regalo (Recompensas)
export const GiftIcon = ({ size = 24, color = "#FFFFFF" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 12V22H4V12"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect x="2" y="7" width="20" height="5" rx="1" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="12" y1="22" x2="12" y2="7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path
      d="M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Ícono de QR (Retiro sin tarjeta)
export const QrCodeIcon = ({ size = 24, color = "#FFFFFF" }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 3H9V9H3V3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 3H21V9H15V3Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M3 15H9V21H3V15Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M15 15H21V21H15V15Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 12H12.01" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
  plane: PlaneIcon,
  settings: SettingsIcon,
  eye: EyeIcon,
  refresh: RefreshIcon,
  gift: GiftIcon,
  qr: QrCodeIcon,
};

export type FinancialIconType = keyof typeof FinancialIcons;
