import axios, { AxiosResponse, AxiosError } from 'axios';
import {
  CountdownOverview,
  PublicCountdownDay,
  CountdownDay,
  CountdownDayUpdate,
  AdminLoginRequest,
  AdminLoginResponse,
  ValidationResponse,
  MediaUploadResponse,
  APIError,
  API_ENDPOINTS,
  STORAGE_KEYS
} from '../types';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<APIError>) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      // Optionally redirect to login or emit event
    }
    return Promise.reject(error);
  }
);

// Utility function to handle API errors
const handleApiError = (error: AxiosError<APIError>): string => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.response?.status === 500) {
    return 'Internal server error. Please try again later.';
  }
  if (error.code === 'ECONNABORTED') {
    return 'Request timeout. Please check your connection.';
  }
  return error.message || 'An unexpected error occurred.';
};

// Public API endpoints (no auth required)
export const publicApi = {
  // Get countdown overview
  getCountdownOverview: async (): Promise<CountdownOverview> => {
    try {
      const response: AxiosResponse<CountdownOverview> = await api.get(
        API_ENDPOINTS.COUNTDOWN_OVERVIEW
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError<APIError>));
    }
  },

  // Get specific countdown day
  getCountdownDay: async (
    dayNumber: number,
    previewToken?: string
  ): Promise<PublicCountdownDay> => {
    try {
      const params = previewToken ? { preview_token: previewToken } : {};
      const response: AxiosResponse<PublicCountdownDay> = await api.get(
        API_ENDPOINTS.COUNTDOWN_DAY(dayNumber),
        { params }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError<APIError>));
    }
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; timestamp: string }> => {
    try {
      const response = await api.get(API_ENDPOINTS.HEALTH);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError<APIError>));
    }
  },
};

// Admin API endpoints (auth required)
export const adminApi = {
  // Login
  login: async (credentials: AdminLoginRequest): Promise<AdminLoginResponse> => {
    try {
      const response: AxiosResponse<AdminLoginResponse> = await api.post(
        API_ENDPOINTS.ADMIN_LOGIN,
        credentials
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError<APIError>));
    }
  },

  // Validate token
  validateToken: async (): Promise<ValidationResponse> => {
    try {
      const response: AxiosResponse<ValidationResponse> = await api.post(
        API_ENDPOINTS.ADMIN_VALIDATE
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError<APIError>));
    }
  },

  // Get all countdown days (admin view)
  getCountdownDays: async (): Promise<CountdownDay[]> => {
    try {
      const response: AxiosResponse<CountdownDay[]> = await api.get(
        API_ENDPOINTS.ADMIN_COUNTDOWN
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError<APIError>));
    }
  },

  // Get specific countdown day (admin view)
  getCountdownDay: async (dayNumber: number): Promise<CountdownDay> => {
    try {
      const response: AxiosResponse<CountdownDay> = await api.get(
        API_ENDPOINTS.ADMIN_COUNTDOWN_DAY(dayNumber)
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError<APIError>));
    }
  },

  // Update countdown day
  updateCountdownDay: async (
    dayNumber: number,
    data: CountdownDayUpdate
  ): Promise<CountdownDay> => {
    try {
      const response: AxiosResponse<CountdownDay> = await api.put(
        API_ENDPOINTS.ADMIN_COUNTDOWN_DAY(dayNumber),
        data
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError<APIError>));
    }
  },

  // Section management
  getDaySections: async (dayNumber: number): Promise<any> => {
    try {
      const response = await api.get(`/api/admin/countdown/${dayNumber}/sections`);
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError<APIError>));
    }
  },

  updateDaySections: async (dayNumber: number, sections: any[]): Promise<any> => {
    try {
      const response = await api.put(`/api/admin/countdown/${dayNumber}/sections`, {
        sections
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError<APIError>));
    }
  },

  // Upload media file with configuration
  uploadMedia: async (
    file: File,
    dayNumber?: number,
    mediaConfig?: any
  ): Promise<MediaUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (dayNumber !== undefined) {
        formData.append('day_number', dayNumber.toString());
      }
      if (mediaConfig) {
        formData.append('media_config', JSON.stringify(mediaConfig));
      }

      const response: AxiosResponse<MediaUploadResponse> = await api.post(
        API_ENDPOINTS.ADMIN_UPLOAD,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError<APIError>));
    }
  },

  // Update media configuration
  updateMediaConfig: async (mediaId: string, config: any): Promise<MediaUploadResponse> => {
    try {
      const response: AxiosResponse<MediaUploadResponse> = await api.put(
        `/api/admin/media/${mediaId}`,
        { media_config: config }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError<APIError>));
    }
  },
};

// Export the main api instance for custom requests
export default api; 