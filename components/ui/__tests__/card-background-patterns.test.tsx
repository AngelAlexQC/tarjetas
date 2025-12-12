import { render } from '@testing-library/react-native';
import React from 'react';
import { CardBackgroundPattern } from '../card-background-patterns';

describe('CardBackgroundPattern', () => {
  it('should render Visa pattern', () => {
    const { root } = render(
      <CardBackgroundPattern brand="visa" width={300} height={190} />
    );
    expect(root).toBeTruthy();
  });

  it('should render Mastercard pattern', () => {
    const { root } = render(
      <CardBackgroundPattern brand="mastercard" width={300} height={190} />
    );
    expect(root).toBeTruthy();
  });

  it('should render American Express pattern', () => {
    const { root } = render(
      <CardBackgroundPattern brand="amex" width={300} height={190} />
    );
    expect(root).toBeTruthy();
  });

  it('should render Discover pattern', () => {
    const { root } = render(
      <CardBackgroundPattern brand="discover" width={300} height={190} />
    );
    expect(root).toBeTruthy();
  });

  it('should render Diners pattern', () => {
    const { root } = render(
      <CardBackgroundPattern brand="diners" width={300} height={190} />
    );
    expect(root).toBeTruthy();
  });

  it('should render JCB pattern', () => {
    const { root } = render(
      <CardBackgroundPattern brand="jcb" width={300} height={190} />
    );
    expect(root).toBeTruthy();
  });

  it('should render Maestro pattern', () => {
    const { root } = render(
      <CardBackgroundPattern brand="maestro" width={300} height={190} />
    );
    expect(root).toBeTruthy();
  });

  it('should render with custom dimensions', () => {
    const { root } = render(
      <CardBackgroundPattern brand="visa" width={400} height={250} />
    );
    expect(root).toBeTruthy();
  });

  it('should return null for unknown brand', () => {
    const { toJSON } = render(
      <CardBackgroundPattern brand={"unknown" as any} width={300} height={190} />
    );
    expect(toJSON()).toBeNull();
  });
});
