import React from 'react';
import { render } from '@testing-library/react-native';
import { ChipIcon } from '../chip-icon';

describe('ChipIcon', () => {
  it('should render with default props', () => {
    const { root } = render(<ChipIcon />);
    expect(root).toBeTruthy();
  });

  it('should render with custom width and height', () => {
    const { root } = render(<ChipIcon width={60} height={50} />);
    expect(root).toBeTruthy();
  });

  it('should be an SVG component', () => {
    const { root } = render(<ChipIcon />);
    expect(root).toBeTruthy();
  });
});
