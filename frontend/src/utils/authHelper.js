/**
 * Helper functions for authentication
 */

// ============== ADMIN AUTH ==============

export const hasValidToken = () => {
  const token = localStorage.getItem("admin_token");
  return !!token; // Return true if token exists
};

export const getToken = () => {
  return localStorage.getItem("admin_token");
};

export const clearAuth = () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("role");
  localStorage.removeItem("userEmail");
  // Don't remove saved email for remember me
};

export const isAdmin = () => {
  const role = localStorage.getItem("role");
  return role === "admin";
};

export const getUserEmail = () => {
  return localStorage.getItem("userEmail");
};

export const getSavedEmail = () => {
  return localStorage.getItem("admin_saved_email");
};

export const clearSavedEmail = () => {
  localStorage.removeItem("admin_saved_email");
};

// ============== CUSTOMER AUTH ==============

export const hasValidCustomerToken = () => {
  const token = localStorage.getItem("customerToken");
  return !!token;
};

export const getCustomerToken = () => {
  return localStorage.getItem("customerToken");
};

export const getCustomerInfo = () => {
  const info = localStorage.getItem("customerInfo");
  return info ? JSON.parse(info) : null;
};

export const clearCustomerAuth = () => {
  localStorage.removeItem("customerToken");
  localStorage.removeItem("customerInfo");
  // Don't remove saved contact for remember me
};

export const getSavedContact = () => {
  return localStorage.getItem("guest_saved_contact");
};

export const clearSavedContact = () => {
  localStorage.removeItem("guest_saved_contact");
};

// ============== GENERAL ==============

export const clearAllAuth = () => {
  clearAuth();
  clearCustomerAuth();
  clearSavedEmail();
  clearSavedContact();
};

export const isLoggedIn = () => {
  return hasValidToken() || hasValidCustomerToken();
};

export const getActiveUserType = () => {
  if (hasValidToken()) return "admin";
  if (hasValidCustomerToken()) return "customer";
  return null;
};

