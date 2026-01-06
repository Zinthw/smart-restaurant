import axiosClient from "./axiosClient";

const authApi = {
  // Admin login
  login: (data) => {
    // data = { email, password }
    const url = "/auth/login";
    return axiosClient.post(url, data);
  },

  // Admin OTP-based password reset - Step 1: Send OTP
  sendAdminResetOTP: (data) => {
    // data = { email }
    // Backend will check if email exists and send OTP
    const url = "/auth/admin/send-reset-otp";
    return axiosClient.post(url, data);
  },

  // Admin OTP-based password reset - Step 2: Verify OTP and reset password
  resetAdminPasswordWithOTP: (data) => {
    // data = { email, otp, newPassword }
    const url = "/auth/admin/reset-password-otp";
    return axiosClient.post(url, data);
  },

  // Customer login
  customerLogin: (data) => {
    // data = { phoneOrEmail, password }
    const url = "/auth/customer/login";
    return axiosClient.post(url, data);
  },

  // Customer registration
  customerRegister: (data) => {
    // data = { fullName, phone, email?, password }
    const url = "/auth/customer/register";
    return axiosClient.post(url, data);
  },

  // Customer OTP-based password reset - Step 1: Send OTP
  sendCustomerResetOTP: (data) => {
    // data = { contact } (phone or email)
    // Backend will check if contact exists and send OTP
    const url = "/auth/customer/send-reset-otp";
    return axiosClient.post(url, data);
  },

  // Customer OTP-based password reset - Step 2: Verify OTP and reset password
  resetCustomerPasswordWithOTP: (data) => {
    // data = { contact, otp, newPassword }
    const url = "/auth/customer/reset-password-otp";
    return axiosClient.post(url, data);
  },
  
  // Get profile (admin)
  getProfile: () => {
    const url = "/auth/profile";
    return axiosClient.get(url);
  },

  // Get customer profile
  getCustomerProfile: () => {
    const url = "/auth/customer/profile";
    return axiosClient.get(url);
  },

  // Logout
  logout: () => {
    const url = "/auth/logout";
    return axiosClient.post(url);
  }
};

export default authApi;