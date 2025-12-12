import React from 'react';
import { render } from '@testing-library/react-native';
import { CardBrandIcons } from '../card-brand-icons';

describe('CardBrandIcons', () => {
  it('should have Visa icon component', () => {
    const VisaIcon = CardBrandIcons.visa;
    const { root } = render(<VisaIcon width={32} height={32} />);
    expect(root).toBeTruthy();
  });

  it('should have Mastercard icon component', () => {
    const MastercardIcon = CardBrandIcons.mastercard;
    expect(MastercardIcon).toBeDefined();
  });

  it('should have Amex icon component', () => {
    const AmexIcon = CardBrandIcons.amex;
    expect(AmexIcon).toBeDefined();
  });

  it('should have Discover icon component', () => {
    const DiscoverIcon = CardBrandIcons.discover;
    expect(DiscoverIcon).toBeDefined();
  });

  it('should have Diners icon component', () => {
    const DinersIcon = CardBrandIcons.diners;
    expect(DinersIcon).toBeDefined();
  });

  it('should have JCB icon component', () => {
    const JcbIcon = CardBrandIcons.jcb;
    expect(JcbIcon).toBeDefined();
  });

  it('should have Maestro icon component', () => {
    const MaestroIcon = CardBrandIcons.maestro;
    expect(MaestroIcon).toBeDefined();
  });

  it('should have UnionPay icon component', () => {
    const UnionpayIcon = CardBrandIcons.unionpay;
    expect(UnionpayIcon).toBeDefined();
  });

  it('should have Generic icon component', () => {
    const GenericIcon = CardBrandIcons.generic;
    expect(GenericIcon).toBeDefined();
  });
});
