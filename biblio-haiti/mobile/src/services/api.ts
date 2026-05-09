import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_ENDPOINTS, STORAGE_KEYS } from '../constants';

class ApiService {
  private api: AxiosInstance;
  private static instance: ApiService;

  private constructor() {
    this.api = axios.create({
      baseURL: process.env.API_URL || 'http://localhost:8000',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors and token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
            if (refreshToken) {
              const response = await axios.post(`${this.api.defaults.baseURL}${API_ENDPOINTS.REFRESH_TOKEN}`, {
                refresh_token: refreshToken,
              });

              const { access_token } = response.data;
              await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, access_token);

              originalRequest.headers.Authorization = `Bearer ${access_token}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            await this.logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.api.post(API_ENDPOINTS.LOGIN, { email, password });
    const { access_token, refresh_token, user } = response.data;
    
    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, access_token);
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refresh_token);
    
    return { user, access_token, refresh_token };
  }

  async register(userData: any) {
    const response = await this.api.post(API_ENDPOINTS.REGISTER, userData);
    return response.data;
  }

  async logout() {
    try {
      await this.api.post(API_ENDPOINTS.LOGOUT);
    } catch (error) {
      // Ignore errors on logout
    } finally {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    }
  }

  async getCurrentUser() {
    const response = await this.api.get(API_ENDPOINTS.ME);
    return response.data;
  }

  // Books methods
  async getBooks(params?: any) {
    const response = await this.api.get(API_ENDPOINTS.BOOKS, { params });
    return response.data;
  }

  async getBookById(id: string) {
    const response = await this.api.get(API_ENDPOINTS.BOOK_BY_ID(id));
    return response.data;
  }

  async searchBooks(query: string, filters?: any) {
    const response = await this.api.get(API_ENDPOINTS.BOOK_SEARCH, {
      params: { q: query, ...filters },
    });
    return response.data;
  }

  async getCategories() {
    const response = await this.api.get(API_ENDPOINTS.BOOK_CATEGORIES);
    return response.data;
  }

  // Book Access methods
  async getBookAccess(bookId: string) {
    const response = await this.api.get(`${API_ENDPOINTS.BOOK_ACCESS}/${bookId}`);
    return response.data;
  }

  async purchaseAccess(bookId: string, paymentMethod: string, accessType: string) {
    const response = await this.api.post(API_ENDPOINTS.PURCHASE_ACCESS, {
      book_id: bookId,
      payment_method: paymentMethod,
      access_type: accessType,
    });
    return response.data;
  }

  // Stars methods
  async getStarsBalance() {
    const response = await this.api.get(API_ENDPOINTS.STARS_BALANCE);
    return response.data;
  }

  async getStarsHistory() {
    const response = await this.api.get(API_ENDPOINTS.STARS_HISTORY);
    return response.data;
  }

  // Quiz methods
  async getQuizByBook(bookId: string) {
    const response = await this.api.get(API_ENDPOINTS.QUIZ_BY_BOOK(bookId));
    return response.data;
  }

  async submitQuiz(bookId: string, answers: number[]) {
    const response = await this.api.post(API_ENDPOINTS.QUIZ_SUBMIT, {
      book_id: bookId,
      answers,
    });
    return response.data;
  }

  // Reviews methods
  async getReviews(bookId: string) {
    const response = await this.api.get(API_ENDPOINTS.REVIEWS, { params: { book_id: bookId } });
    return response.data;
  }

  async createReview(bookId: string, rating: number, comment?: string) {
    const response = await this.api.post(API_ENDPOINTS.REVIEWS, {
      book_id: bookId,
      rating,
      comment,
    });
    return response.data;
  }

  // Author methods
  async getAuthorBooks() {
    const response = await this.api.get(API_ENDPOINTS.AUTHOR_BOOKS);
    return response.data;
  }

  async getAuthorStats() {
    const response = await this.api.get(API_ENDPOINTS.AUTHOR_STATS);
    return response.data;
  }

  async uploadBook(bookData: FormData) {
    const response = await this.api.post(API_ENDPOINTS.BOOK_UPLOAD, bookData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // Payment methods
  async initiateMoncashPayment(amount: number, bookId: string) {
    const response = await this.api.post(API_ENDPOINTS.PAYMENT_MONCASH, {
      amount,
      book_id: bookId,
    });
    return response.data;
  }

  async initiateStripePayment(amount: number, bookId: string) {
    const response = await this.api.post(API_ENDPOINTS.PAYMENT_STRIPE, {
      amount,
      book_id: bookId,
    });
    return response.data;
  }

  // Admin methods (if user is admin)
  async getPendingBooks() {
    const response = await this.api.get(API_ENDPOINTS.ADMIN_PENDING_BOOKS);
    return response.data;
  }

  async validateBook(bookId: string, approved: boolean, reason?: string) {
    const response = await this.api.post(`${API_ENDPOINTS.ADMIN_PENDING_BOOKS}/${bookId}/validate`, {
      approved,
      reason,
    });
    return response.data;
  }

  async getUsers() {
    const response = await this.api.get(API_ENDPOINTS.ADMIN_USERS);
    return response.data;
  }

  async getAdminStats() {
    const response = await this.api.get(API_ENDPOINTS.ADMIN_STATS);
    return response.data;
  }
}

export const apiService = ApiService.getInstance();
export default apiService;
