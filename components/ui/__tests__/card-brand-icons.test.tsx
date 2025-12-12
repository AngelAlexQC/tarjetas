import React from 'react';
import { render } from '@testing-library/react-native';
import { CardBrandIcon } from '../card-brand-icons';

describe('CardBrandIcon', () => {
  it('should render Visa icon', () => {
    const { root } = render(<CardBrandIcon brand="visa" size={32} />);
    expect(root).toBeTruthy();
  });

  it('should render Mastercard icon', () => {
    const { root } = render(<CardBrandIcon brand="mastercard" size={32} />);
    expect(root).toBeTruthy();
  });

  it('should render Amex icon', () => {
    const { root } = render(<CardBrandIcon brand="amex" size={32} />);
    expect(root).toBeTruthy();
  });

  it('should render Discover icon', () => {
    const { root } = render(<CardBrandIcon brand="discover" size={32} />);
    expect(root).toBeTruthy();
  });

  it('should render Diners icon', () => {
    const { root } = render(<CardBrandIcon brand="diners" size={32} />);
    expect(root).toBeTruthy();
  });

  it('should render JCB icon', () => {
    const { root } = render(<CardBrandIcon brand="jcb" size={32} />);
    expect(root).toBeTruthy();
  });

  it('should render Maestro icon', () => {
    const { root} = render(<CardBrandIcon brand="maestro" size={32} />);
    expect(root).toBeTruthy();
  });

  it('should render UnionPay icon', () => {
    const { root } = render(<CardBrandIcon brand="unionpay" size={32} />);
    expect(root).toBeTruthy();
  });

  it('should render with custom size', () => {
    const { root } = render(<CardBrandIcon brand="visa" size={48} />);
    expect(root).toBeTruthy();
  });

  it('should render with default size', () => {
    const { root } = render(<CardBrandIcon brand="visa" />);
    expect(root).toBeTruthy();
  });
});
