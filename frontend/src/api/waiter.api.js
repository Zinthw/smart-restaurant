import axiosClient from './axiosClient';

// Get all orders with optional status filter
export const getOrders = async (status = null) => {
  try {
    const params = status ? { status } : {};
    const response = await axiosClient.get('/api/waiter/orders', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Accept an order and send to kitchen
export const acceptOrder = async (orderId) => {
  try {
    const response = await axiosClient.patch(`/api/waiter/orders/${orderId}/accept`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reject an order with reason
export const rejectOrder = async (orderId, reason) => {
  try {
    const response = await axiosClient.patch(`/api/waiter/orders/${orderId}/reject`, {
      reason
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mark order as served
export const markOrderServed = async (orderId) => {
  try {
    const response = await axiosClient.patch(`/api/waiter/orders/${orderId}/served`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get order statistics
export const getOrderStats = async () => {
  try {
    const response = await axiosClient.get('/api/waiter/orders/stats');
    return response.data;
  } catch (error) {
    throw error;
  }
};
