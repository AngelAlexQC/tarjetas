import React from 'react';
import { render } from '@testing-library/react-native';
import { DragonflyLoading } from '../dragonfly-loading';

// react-native-reanimated está mockeado globalmente en jest.setup.ts

describe('DragonflyLoading', () => {
  it('should render correctly with default props', () => {
    const { root } = render(<DragonflyLoading />);
    expect(root).toBeTruthy();
  });

  it('should render with custom width', () => {
    const { root } = render(<DragonflyLoading width={150} />);
    expect(root).toBeTruthy();
  });

  it('should render with custom height', () => {
    const { root } = render(<DragonflyLoading height={150} />);
    expect(root).toBeTruthy();
  });

  it('should render with custom color', () => {
    const { root } = render(<DragonflyLoading color="#FF0000" />);
    expect(root).toBeTruthy();
  });

  it('should render with custom style', () => {
    const customStyle = { marginTop: 20 };
    const { root } = render(<DragonflyLoading style={customStyle} />);
    expect(root).toBeTruthy();
  });

  it('should render with all custom props', () => {
    const { root } = render(
      <DragonflyLoading 
        width={200}
        height={200}
        color="#00FF00"
        style={{ marginTop: 10 }}
      />
    );
    expect(root).toBeTruthy();
  });
});
