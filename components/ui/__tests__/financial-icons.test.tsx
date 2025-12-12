import React from 'react';
import { render } from '@testing-library/react-native';
import {
  LockIcon,
  CalendarIcon,
  ChartIcon,
  MoneyIcon,
  BarChartIcon,
  PinIcon,
  BellIcon,
} from '../financial-icons';

describe('FinancialIcons', () => {
  describe('LockIcon', () => {
    it('should render correctly with default props', () => {
      const { root } = render(<LockIcon />);
      expect(root).toBeTruthy();
    });

    it('should render with custom size and color', () => {
      const { root } = render(<LockIcon size={32} color="#FF0000" />);
      expect(root).toBeTruthy();
    });
  });

  describe('CalendarIcon', () => {
    it('should render correctly with default props', () => {
      const { root } = render(<CalendarIcon />);
      expect(root).toBeTruthy();
    });

    it('should render with custom size and color', () => {
      const { root } = render(<CalendarIcon size={32} color="#00FF00" />);
      expect(root).toBeTruthy();
    });
  });

  describe('ChartIcon', () => {
    it('should render correctly with default props', () => {
      const { root } = render(<ChartIcon />);
      expect(root).toBeTruthy();
    });

    it('should render with custom size and color', () => {
      const { root } = render(<ChartIcon size={32} color="#0000FF" />);
      expect(root).toBeTruthy();
    });
  });

  describe('MoneyIcon', () => {
    it('should render correctly with default props', () => {
      const { root } = render(<MoneyIcon />);
      expect(root).toBeTruthy();
    });

    it('should render with custom size and color', () => {
      const { root } = render(<MoneyIcon size={32} color="#FFFF00" />);
      expect(root).toBeTruthy();
    });
  });

  describe('BarChartIcon', () => {
    it('should render correctly with default props', () => {
      const { root } = render(<BarChartIcon />);
      expect(root).toBeTruthy();
    });

    it('should render with custom size and color', () => {
      const { root } = render(<BarChartIcon size={32} color="#FF00FF" />);
      expect(root).toBeTruthy();
    });
  });

  describe('PinIcon', () => {
    it('should render correctly with default props', () => {
      const { root } = render(<PinIcon />);
      expect(root).toBeTruthy();
    });

    it('should render with custom size and color', () => {
      const { root } = render(<PinIcon size={32} color="#00FFFF" />);
      expect(root).toBeTruthy();
    });
  });

  describe('BellIcon', () => {
    it('should render correctly with default props', () => {
      const { root } = render(<BellIcon />);
      expect(root).toBeTruthy();
    });

    it('should render with custom size and color', () => {
      const { root } = render(<BellIcon size={32} color="#FFA500" />);
      expect(root).toBeTruthy();
    });
  });
});
