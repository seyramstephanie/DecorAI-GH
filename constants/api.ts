const BASE_URL = "http://10.132.233.206:8080";

export const API = {
  // Auth
  register: `${BASE_URL}/api/auth/register`,
  verifyOtp: `${BASE_URL}/api/auth/verify-otp`,
  resendOtp: `${BASE_URL}/api/auth/resend-otp`,
  login: `${BASE_URL}/api/auth/login`,

  // Shops
  shops: `${BASE_URL}/api/shops`,
  shopsByLocation: (location: string) =>
    `${BASE_URL}/api/shops/location/${location}`,
  shopsByCategory: (category: string) =>
    `${BASE_URL}/api/shops/category/${category}`,
  searchShops: (location: string, category: string) =>
    `${BASE_URL}/api/shops/search?location=${location}&category=${category}`,

  // Decorators
  decorators: `${BASE_URL}/api/decorators`,
  decoratorsByLocation: (location: string) =>
    `${BASE_URL}/api/decorators/location/${location}`,

  // Bookings
  bookings: `${BASE_URL}/api/bookings`,
  bookingsByClient: (clientId: number) =>
    `${BASE_URL}/api/bookings/client/${clientId}`,
  updateBookingStatus: (id: number) => `${BASE_URL}/api/bookings/${id}/status`,

  // Messages
  sendMessage: `${BASE_URL}/api/messages`,
  messagesByBooking: (bookingId: number) =>
    `${BASE_URL}/api/messages/booking/${bookingId}`,

  // AI
  generateDesign: `${BASE_URL}/api/ai/generate`,
  getAiResult: (predictionId: string) =>
    `${BASE_URL}/api/ai/result/${predictionId}`,
};

// Token storage helper
let authToken: string | null = null;

export const setToken = (token: string) => {
  authToken = token;
};

export const getToken = () => authToken;

export const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${authToken}`,
});
