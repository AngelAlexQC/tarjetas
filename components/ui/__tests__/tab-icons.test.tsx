import React from 'react';
import { render } from '@testing-library/react-native';
import { HomeIcon, CardsIcon, SettingsIcon } from '../tab-icons';

// react-native-reanimated está mockeado globalmente en jest.setup.ts

describe('TabIcons', () => {
  describe('HomeIcon', () => {
    it('should render correctly with default props', () => {
      const { root } = render(<HomeIcon />);
      expect(root).toBeTruthy();
    });

    it('should render with custom size and color', () => {
      const { root } = render(<HomeIcon size={32} color="#FF0000" />);
      expect(root).toBeTruthy();
    });

    it('should render in focused state', () => {
      const { root } = render(<HomeIcon focused={true} />);
      expect(root).toBeTruthy();
    });

    it('should render in unfocused state', () => {
      const { root } = render(<HomeIcon focused={false} />);
      expect(root).toBeTruthy();
    });
  });

  describe('CardsIcon', () => {
    it('should render correctly with default props', () => {
      const { root } = render(<CardsIcon />);
      expect(root).toBeTruthy();
    });

    it('should render with custom size and color', () => {
      const { root } = render(<CardsIcon size={32} color="#00FF00" />);
      expect(root).toBeTruthy();
    });

    it('should render in focused state', () => {
      const { root } = render(<CardsIcon focused={true} />);
      expect(root).toBeTruthy();
    });

    it('should render in unfocused state', () => {
      const { root } = render(<CardsIcon focused={false} />);
      expect(root).toBeTruthy();
    });
  });

  describe('SettingsIcon', () => {
    it('should render correctly with default props', () => {
      const { root } = render(<SettingsIcon />);
      expect(root).toBeTruthy();
    });

    it('should render with custom size and color', () => {
      const { root } = render(<SettingsIcon size={32} color="#0000FF" />);
      expect(root).toBeTruthy();
    });

    it('should render in focused state', () => {
      const { root } = render(<SettingsIcon focused={true} />);
      expect(root).toBeTruthy();
    });

    it('should render in unfocused state', () => {
      const { root } = render(<SettingsIcon focused={false} />);
      expect(root).toBeTruthy();
    });
  });
});
