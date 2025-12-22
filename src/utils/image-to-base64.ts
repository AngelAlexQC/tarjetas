/**
 * Utility to convert image URLs to base64 strings for use in PDFs
 * This is necessary because expo-print has limitations with external image URLs on iOS
 */

import { loggers } from '@/core/logging';

const log = loggers.ui;

export async function convertImageToBase64(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error: any) {
    log.error('Error converting image to base64:', error);
    return null;
  }
}

export async function getLogoHtmlForPdf(
  logoUrl: string | undefined, 
  institutionName: string, 
  mainColor: string,
  height: number = 40
): Promise<string> {
  if (logoUrl) {
    try {
      const base64Image = await convertImageToBase64(logoUrl);
      if (base64Image) {
        return `<img src="${base64Image}" style="height: ${height}px; object-fit: contain;" />`;
      }
    } catch (error: any) {
      log.error('Failed to load logo image:', error);
    }
  }
  
  // Fallback to text logo if image fails or doesn't exist
  return `<div class="brand-logo" style="font-size: ${height * 0.6}px; font-weight: 800; color: ${mainColor}; text-transform: uppercase; letter-spacing: -0.5px;">${institutionName}</div>`;
}
