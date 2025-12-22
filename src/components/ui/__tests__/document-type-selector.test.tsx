/**
 * Tests para DocumentTypeSelector Component
 */

import { useAppTheme } from '@/ui/theming';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { DocumentTypeSelector } from '../document-type-selector';

// Mock dependencies
jest.mock('@/ui/theming');

describe('DocumentTypeSelector', () => {
  const mockOnSelect = jest.fn();
  const mockTheme = {
    colors: {
      surface: '#FFFFFF',
      border: '#E0E0E0',
      text: '#000000',
      textSecondary: '#666666',
      grey100: '#E5E5EA',
      grey600: '#8E8E93',
      white: '#FFFFFF',
    },
    tenant: {
      mainColor: '#007AFF',
      textOnPrimary: '#FFFFFF',
    },
    helpers: {
      getText: jest.fn(() => '#000000'),
      getBackground: jest.fn(() => '#FFFFFF'),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAppTheme as jest.Mock).mockReturnValue(mockTheme);
  });

  it('should render nothing when there is only one document type', () => {
    const { queryByText } = render(
      <DocumentTypeSelector
        documentTypes={['CC']}
        selectedType="CC"
        onSelect={mockOnSelect}
      />
    );

    expect(queryByText('Tipo de Documento')).toBeNull();
  });

  it('should render buttons for multiple document types', () => {
    const { getByText } = render(
      <DocumentTypeSelector
        documentTypes={['CC', 'CE', 'NIT', 'PAS']}
        selectedType="CC"
        onSelect={mockOnSelect}
      />
    );

    expect(getByText('Tipo de Documento')).toBeTruthy();
    expect(getByText('CC')).toBeTruthy();
    expect(getByText('CE')).toBeTruthy();
    expect(getByText('NIT')).toBeTruthy();
    expect(getByText('PAS')).toBeTruthy();
  });

  it('should show descriptive names when documentTypeDetails is provided', () => {
    const documentTypeDetails = [
      { code: 'CC', name: 'Cédula de Ciudadanía' },
      { code: 'CE', name: 'Cédula de Extranjería' },
      { code: 'NIT', name: 'NIT' },
      { code: 'PAS', name: 'Pasaporte' },
    ];

    const { getByText } = render(
      <DocumentTypeSelector
        documentTypes={['CC', 'CE', 'NIT', 'PAS']}
        documentTypeDetails={documentTypeDetails}
        selectedType="CC"
        onSelect={mockOnSelect}
      />
    );

    expect(getByText('Cédula de Ciudadanía')).toBeTruthy();
    expect(getByText('Cédula de Extranjería')).toBeTruthy();
    expect(getByText('NIT')).toBeTruthy();
    expect(getByText('Pasaporte')).toBeTruthy();
  });

  it('should call onSelect when a button is pressed', () => {
    const { getByText } = render(
      <DocumentTypeSelector
        documentTypes={['CC', 'CE', 'NIT']}
        selectedType="CC"
        onSelect={mockOnSelect}
      />
    );

    fireEvent.press(getByText('CE'));

    expect(mockOnSelect).toHaveBeenCalledWith('CE');
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
  });

  it('should not call onSelect when disabled', () => {
    const { getByText } = render(
      <DocumentTypeSelector
        documentTypes={['CC', 'CE', 'NIT']}
        selectedType="CC"
        onSelect={mockOnSelect}
        disabled={true}
      />
    );

    fireEvent.press(getByText('CE'));

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('should handle empty documentTypeDetails array', () => {
    const { getByText } = render(
      <DocumentTypeSelector
        documentTypes={['CC', 'CE']}
        documentTypeDetails={[]}
        selectedType="CC"
        onSelect={mockOnSelect}
      />
    );

    // Should fall back to showing codes
    expect(getByText('CC')).toBeTruthy();
    expect(getByText('CE')).toBeTruthy();
  });

  it('should fall back to code when detail not found', () => {
    const documentTypeDetails = [
      { code: 'CC', name: 'Cédula de Ciudadanía' },
    ];

    const { getByText } = render(
      <DocumentTypeSelector
        documentTypes={['CC', 'CE', 'NIT']}
        documentTypeDetails={documentTypeDetails}
        selectedType="CC"
        onSelect={mockOnSelect}
      />
    );

    expect(getByText('Cédula de Ciudadanía')).toBeTruthy();
    expect(getByText('CE')).toBeTruthy(); // Falls back to code
    expect(getByText('NIT')).toBeTruthy(); // Falls back to code
  });
});
