import React from 'react';
import { render } from '@testing-library/react-native';
import { InfoIcon } from '../info-icon';

describe('InfoIcon', () => {
  it('should render with default props', () => {
    const { root } = render(<InfoIcon />);
    expect(root).toBeTruthy();
  });

  it('should render with custom size', () => {
    const { root } = render(<InfoIcon size={24} />);
    expect(root).toBeTruthy();
  });

  it('should render with custom color', () => {
    const { root } = render(<InfoIcon color="#FF0000" />);
    expect(root).toBeTruthy();
  });

  it('should render with both custom size and color', () => {
    const { root } = render(<InfoIcon size={32} color="#00FF00" />);
    expect(root).toBeTruthy();
  });

  it('should be an SVG component', () => {
    const { UNSAFE_getByType } = render(<InfoIcon />);
    expect(UNSAFE_getByType('RNSVGSvg')).toBeTruthy();
  });
});
