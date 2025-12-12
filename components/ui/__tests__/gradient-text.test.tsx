import React from 'react';
import { render } from '@testing-library/react-native';
import { GradientText } from '../gradient-text';

describe('GradientText', () => {
  it('should render with default props', () => {
    const { root } = render(<GradientText text="Hello" />);
    expect(root).toBeTruthy();
  });

  it('should render with custom colors', () => {
    const { root } = render(
      <GradientText text="Hello" colors={['#FF0000', '#00FF00']} />
    );
    expect(root).toBeTruthy();
  });

  it('should render with custom font size', () => {
    const { root } = render(<GradientText text="Hello" fontSize={32} />);
    expect(root).toBeTruthy();
  });

  it('should render with custom dimensions', () => {
    const { root } = render(
      <GradientText text="Hello" width={300} height={50} />
    );
    expect(root).toBeTruthy();
  });

  it('should accept custom style', () => {
    const customStyle = { marginTop: 10 };
    const { root } = render(<GradientText text="Hello" style={customStyle} />);
    expect(root).toBeTruthy();
  });

  it('should render text content', () => {
    const { root } = render(<GradientText text="Test Text" />);
    expect(root).toBeTruthy();
  });

  it('should be an SVG component', () => {
    const { UNSAFE_getByType } = render(<GradientText text="Hello" />);
    expect(UNSAFE_getByType('RNSVGSvg')).toBeTruthy();
  });
});
