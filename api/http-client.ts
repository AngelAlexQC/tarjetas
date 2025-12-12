/**
 * HTTP Client
 * 
 * Cliente HTTP centralizado para todas las llamadas al backend.
 * Maneja autenticación, errores, y configuración común.
 * 
 * SEGURIDAD: Integrado con SSL Pinning para prevenir ataques MitM.
 */

import { authStorage } from '@/utils/auth-storage';
import { loggers } from '@/utils/logger';
import { API_CONFIG } from './config';
import { shouldUsePinning, getPinningConfig } from './ssl-pinning.config';

const log = loggers.api;

// Tipos para las respuestas de la API
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode?: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Opciones para las peticiones
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  skipAuth?: boolean;
}

// Tipo para el método HTTP
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

class HttpClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.BASE_URL;
    this.defaultHeaders = API_CONFIG.DEFAULT_HEADERS;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Obtiene el token de autenticación almacenado
   * Delega a authStorage para manejo centralizado
   */
  private async getAuthToken(): Promise<string | null> {
    return await authStorage.getToken();
  }

  /**
   * Construye los headers para la petición
   */
  private async buildHeaders(options?: RequestOptions): Promise<Record<string, string>> {
    const headers = { ...this.defaultHeaders, ...options?.headers };

    if (!options?.skipAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Valida si la URL debe usar SSL Pinning
   */
  private validateSSLPinning(url: string): void {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname;
      
      // Verificar si debe usar pinning
      if (shouldUsePinning(hostname)) {
        const config = getPinningConfig(hostname);
        
        if (config && !__DEV__) {
          // En producción con dev build, la validación ocurre a nivel nativo
          // Este es solo un check adicional de que la configuración existe
          log.info(`SSL Pinning enabled for ${hostname}`);
        } else if (__DEV__) {
          log.warn(`SSL Pinning configured for ${hostname} but disabled in development`);
        }
      }
    } catch (error) {
      log.error('Error validating SSL Pinning:', error);
    }
  }

  /**
   * Ejecuta una petición HTTP con timeout
   */
  private async fetchWithTimeout(
    url: string,
    config: RequestInit,
    timeout: number
  ): Promise<Response> {
    // Validar SSL Pinning antes de la petición
    this.validateSSLPinning(url);

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });
      return response;
    } finally {
      clearTimeout(id);
    }
  }

  /**
   * Procesa la respuesta de la API
   */
  private async processResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const statusCode = response.status;

    // Manejar respuestas sin contenido
    if (statusCode === 204) {
      return { success: true, statusCode };
    }

    try {
      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data.data ?? data,
          message: data.message,
          statusCode,
        };
      }

      // Error del servidor
      return {
        success: false,
        error: data.message || data.error || 'Error del servidor',
        statusCode,
      };
    } catch {
      // Error al parsear JSON
      return {
        success: false,
        error: response.ok ? 'Error al procesar respuesta' : 'Error del servidor',
        statusCode,
      };
    }
  }

  /**
   * Método base para realizar peticiones HTTP
   */
  private async request<T, B = unknown>(
    method: HttpMethod,
    endpoint: string,
    body?: B,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = await this.buildHeaders(options);
    const timeout = options?.timeout ?? this.timeout;

    const config: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await this.fetchWithTimeout(url, config, timeout);
      return this.processResponse<T>(response);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'La solicitud ha excedido el tiempo de espera',
            statusCode: 408,
          };
        }
        return {
          success: false,
          error: error.message || 'Error de conexión',
          statusCode: 0,
        };
      }
      return {
        success: false,
        error: 'Error desconocido',
        statusCode: 0,
      };
    }
  }

  // Métodos públicos para cada tipo de petición

  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  async post<T, B = unknown>(endpoint: string, body?: B, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T, B>('POST', endpoint, body, options);
  }

  async put<T, B = unknown>(endpoint: string, body?: B, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T, B>('PUT', endpoint, body, options);
  }

  async patch<T, B = unknown>(endpoint: string, body?: B, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T, B>('PATCH', endpoint, body, options);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  /**
   * Configura la URL base (útil para cambiar entre ambientes)
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Agrega headers por defecto
   */
  addDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  /**
   * Remueve un header por defecto
   */
  removeDefaultHeader(key: string): void {
    delete this.defaultHeaders[key];
  }
}

// Exportar instancia singleton
export const httpClient = new HttpClient();

// Exportar la clase para testing o instancias personalizadas
export { HttpClient };

