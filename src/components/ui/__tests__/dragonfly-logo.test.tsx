import React from 'react';
import { render } from '@testing-library/react-native';
import { DragonflyLogo } from '../dragonfly-logo';

describe('DragonflyLogo', () => {
  it('should render with default props', () => {
    const { root } = render(<DragonflyLogo />);
    expect(root).toBeTruthy();
  });

  it('should render with custom width and height', () => {
    const { root } = render(<DragonflyLogo width={200} height={200} />);
    expect(root).toBeTruthy();
  });

  it('should render with custom color', () => {
    const { root } = render(<DragonflyLogo color="#FF0000" />);
    expect(root).toBeTruthy();
  });

  it('should accept custom style', () => {
    const customStyle = { marginTop: 10 };
    const { root } = render(<DragonflyLogo style={customStyle} />);
    expect(root).toBeTruthy();
  });

  it('should be an SVG component', () => {
    const { root } = render(<DragonflyLogo />);
    expect(root).toBeTruthy();
  });
});
