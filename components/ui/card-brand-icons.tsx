import {
  VisaLogo,
  MastercardLogo,
  AmexLogo,
  DiscoverLogo,
  DinersLogo,
  JcbLogo,
  MaestroLogo,
  UnionpayLogo,
  GenericCardLogo,
} from "react-native-payment-card-icons";

export interface BrandIconProps {
  size?: number;
}

// Re-exportar los íconos con nombres consistentes (usando variante Logo - colores oficiales)
export const VisaIcon = VisaLogo;
export const MastercardIcon = MastercardLogo;
export const AmexIcon = AmexLogo;
export const DiscoverIcon = DiscoverLogo;
export const DinersIcon = DinersLogo;
export const JcbIcon = JcbLogo;
export const MaestroIcon = MaestroLogo;
export const UnionpayIcon = UnionpayLogo;
export const GenericCardIcon = GenericCardLogo;

// Exportar todos los íconos disponibles en un objeto
export const CardBrandIcons = {
  visa: VisaLogo,
  mastercard: MastercardLogo,
  amex: AmexLogo,
  discover: DiscoverLogo,
  diners: DinersLogo,
  jcb: JcbLogo,
  maestro: MaestroLogo,
  unionpay: UnionpayLogo,
  generic: GenericCardLogo,
};

export type CardBrandType = keyof typeof CardBrandIcons;
