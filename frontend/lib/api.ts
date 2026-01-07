// API Configuration for Smart Restaurant Frontend
// Connects to backend at localhost:4000

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  // Add auth token if available
  if (typeof window !== "undefined") {
    const adminToken = localStorage.getItem("admin_token");
    const customerToken = localStorage.getItem("customerToken");
    const token = adminToken || customerToken;

    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Network error" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ==================== AUTH API ====================

export const authAPI = {
  // Admin/Staff login
  login: (email: string, password: string) =>
    fetchAPI<{ token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Admin forgot password - send reset email
  forgotPassword: (email: string) =>
    fetchAPI<{ message: string }>("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  // Admin reset password with token
  resetPassword: (token: string, newPassword: string) =>
    fetchAPI<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }),

  // Verify token
  verifyToken: () => fetchAPI<{ valid: boolean; user: any }>("/auth/verify"),

  // Get current user profile
  getProfile: () => fetchAPI<{ user: any }>("/auth/me"),
};

// ==================== CUSTOMER AUTH API ====================

export const customerAuthAPI = {
  // Customer login with phone
  login: (phone: string, password: string) =>
    fetchAPI<{ token: string; customer: any }>("/customer-auth/login", {
      method: "POST",
      body: JSON.stringify({ phone, password }),
    }),

  // Customer register
  register: (data: { phone: string; password: string; name: string }) =>
    fetchAPI<{ token: string; customer: any }>("/customer-auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Send OTP for verification
  sendOTP: (phone: string) =>
    fetchAPI("/customer-auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ phone }),
    }),

  // Verify OTP
  verifyOTP: (phone: string, otp: string) =>
    fetchAPI("/customer-auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    }),
};

// ==================== MENU API ====================

export const menuAPI = {
  // Get all categories
  getCategories: () => fetchAPI<{ data: any[] }>("/public/categories"),

  // Get all menu items
  getItems: (categoryId?: string) => {
    const query = categoryId ? `?category=${categoryId}` : "";
    return fetchAPI<{ data: any[] }>(`/public/items${query}`);
  },

  // Get single item detail
  getItem: (id: string) => fetchAPI<{ data: any }>(`/public/items/${id}`),

  // Get item modifiers
  getItemModifiers: (itemId: string) =>
    fetchAPI<{ data: any[] }>(`/public/items/${itemId}/modifiers`),
};

// ==================== ORDER API ====================

export const orderAPI = {
  // Create new order (guest)
  createOrder: (data: {
    tableId: string;
    items: Array<{
      itemId: string;
      quantity: number;
      modifiers?: any[];
      notes?: string;
    }>;
    customerId?: string;
  }) =>
    fetchAPI<{ data: any }>("/orders", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Get orders for a table
  getTableOrders: (tableId: string) =>
    fetchAPI<{ data: any[] }>(`/orders/table/${tableId}/order`),

  // Get order by ID
  getOrder: (orderId: string) => fetchAPI<{ data: any }>(`/orders/${orderId}`),

  // Update order status (staff only)
  updateOrderStatus: (orderId: string, status: string) =>
    fetchAPI<{ data: any }>(`/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Cancel order
  cancelOrder: (orderId: string) =>
    fetchAPI<{ data: any }>(`/orders/${orderId}/cancel`, {
      method: "POST",
    }),
};

// ==================== KITCHEN API ====================

export const kitchenAPI = {
  // Get all orders for kitchen (accepted/preparing status)
  getOrders: () => fetchAPI<any[]>("/kitchen/orders"),

  // Update individual item status
  updateItemStatus: (itemId: string, status: string) =>
    fetchAPI<any>(`/kitchen/items/${itemId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Mark order as preparing
  markPreparing: (orderId: string) =>
    fetchAPI<any>(`/kitchen/orders/${orderId}/preparing`, {
      method: "PATCH",
    }),

  // Mark order as ready
  markReady: (orderId: string) =>
    fetchAPI<any>(`/kitchen/orders/${orderId}/ready`, {
      method: "PATCH",
    }),
};

// ==================== WAITER API ====================

export const waiterAPI = {
  // Get orders for waiter
  getOrders: (status?: string) => {
    const query = status ? `?status=${status}` : "";
    return fetchAPI<any[]>(`/waiter/orders${query}`);
  },

  // Accept order
  acceptOrder: (orderId: string) =>
    fetchAPI<any>(`/waiter/orders/${orderId}/accept`, {
      method: "PATCH",
    }),

  // Reject order
  rejectOrder: (orderId: string) =>
    fetchAPI<any>(`/waiter/orders/${orderId}/reject`, {
      method: "PATCH",
    }),

  // Mark order as served
  serveOrder: (orderId: string) =>
    fetchAPI<any>(`/waiter/orders/${orderId}/served`, {
      method: "PATCH",
    }),
};

// ==================== PAYMENT API ====================

export const paymentAPI = {
  // Process payment
  processPayment: (orderId: string, paymentMethod: string) =>
    fetchAPI<{ data: any }>(`/payment/orders/${orderId}/pay`, {
      method: "POST",
      body: JSON.stringify({ paymentMethod }),
    }),

  // Get payment status
  getPaymentStatus: (orderId: string) =>
    fetchAPI<{ data: any }>(`/payment/orders/${orderId}/status`),
};

// ==================== ADMIN API ====================

export const adminAPI = {
  // Tables management
  tables: {
    getAll: (params?: { status?: string; location?: string }) => {
      const query = new URLSearchParams();
      if (params?.status) query.append("status", params.status);
      if (params?.location) query.append("location", params.location);
      const queryStr = query.toString();
      return fetchAPI<any[]>(`/admin/tables${queryStr ? `?${queryStr}` : ""}`);
    },
    getById: (id: number) => fetchAPI<any>(`/admin/tables/${id}`),
    create: (data: {
      table_number: number;
      capacity: number;
      location: string;
      description?: string;
      status?: string;
    }) =>
      fetchAPI<any>("/admin/tables", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (
      id: number,
      data: {
        table_number: number;
        capacity: number;
        location: string;
        description?: string;
        status?: string;
      }
    ) =>
      fetchAPI<any>(`/admin/tables/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchAPI(`/admin/tables/${id}`, { method: "DELETE" }),
    updateStatus: (id: number, status: string) =>
      fetchAPI<any>(`/admin/tables/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    // QR Code management
    generateQR: (id: number) =>
      fetchAPI<{
        tableId: number;
        url: string;
        qrImageDataUrl: string;
        qrTokenCreatedAt: string;
      }>(`/admin/tables/${id}/qr/generate`, { method: "POST" }),
    downloadQR: (id: number, format: "png" | "pdf" = "png") =>
      `${API_BASE_URL}/admin/tables/${id}/qr/download?format=${format}`,
    downloadAllQR: (format: "png" | "pdf" = "png") =>
      `${API_BASE_URL}/admin/tables/qr/download-all?format=${format}`,
    regenerateAllQR: () =>
      fetchAPI<{ success: boolean; message: string; updatedCount: number }>(
        "/admin/tables/qr/regenerate-all",
        { method: "POST" }
      ),
  },

  // Categories management
  categories: {
    getAll: () => fetchAPI<any[]>("/admin/menu/categories"),
    create: (data: {
      name: string;
      description?: string;
      image_url?: string;
      status?: string;
      sort_order?: number;
    }) =>
      fetchAPI<any>("/admin/menu/categories", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (
      id: number,
      data: {
        name: string;
        description?: string;
        image_url?: string;
        status?: string;
        sort_order?: number;
      }
    ) =>
      fetchAPI<any>(`/admin/menu/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchAPI(`/admin/menu/categories/${id}`, { method: "DELETE" }),
    updateStatus: (id: number, status: string) =>
      fetchAPI<any>(`/admin/menu/categories/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
  },

  // Menu items management
  items: {
    getAll: (params?: {
      categoryId?: number;
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
    }) => {
      const query = new URLSearchParams();
      if (params?.categoryId)
        query.append("category_id", params.categoryId.toString());
      if (params?.search) query.append("search", params.search);
      if (params?.status) query.append("status", params.status);
      if (params?.page) query.append("page", params.page.toString());
      if (params?.limit) query.append("limit", params.limit.toString());
      const queryStr = query.toString();
      return fetchAPI<{
        data: any[];
        pagination: { total: number; page: number; limit: number };
      }>(`/admin/menu/items${queryStr ? `?${queryStr}` : ""}`);
    },
    getById: (id: number) => fetchAPI<any>(`/admin/menu/items/${id}`),
    create: (data: {
      category_id: number;
      name: string;
      description?: string;
      price: number;
      status?: string;
      prep_time_minutes?: number;
      is_chef_recommended?: boolean;
    }) =>
      fetchAPI<any>("/admin/menu/items", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (
      id: number,
      data: {
        category_id?: number;
        name?: string;
        description?: string;
        price?: number;
        status?: string;
        prep_time_minutes?: number;
        is_chef_recommended?: boolean;
      }
    ) =>
      fetchAPI<any>(`/admin/menu/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: number) =>
      fetchAPI(`/admin/menu/items/${id}`, { method: "DELETE" }),
    updateStatus: (id: number, status: string) =>
      fetchAPI<any>(`/admin/menu/items/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    // Photo management
    addPhotosFromUrl: (id: number, urls: string[]) =>
      fetchAPI<{ message: string; data: any[] }>(
        `/admin/menu/items/${id}/photos/from-url`,
        {
          method: "POST",
          body: JSON.stringify({ urls }),
        }
      ),
    uploadPhotos: async (id: number, files: File[]) => {
      const formData = new FormData();
      files.forEach((file) => formData.append("photos", file));

      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        `${API_BASE_URL}/admin/menu/items/${id}/photos`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }
      return response.json();
    },
    deletePhoto: (itemId: number, photoId: number) =>
      fetchAPI(`/admin/menu/items/${itemId}/photos/${photoId}`, {
        method: "DELETE",
      }),
    setPrimaryPhoto: (itemId: string, photoId: string) =>
      fetchAPI(`/admin/menu/items/${itemId}/photos/${photoId}/primary`, {
        method: "PATCH",
      }),
    // Modifiers for item
    getModifiers: (itemId: string) =>
      fetchAPI<any[]>(`/admin/menu/items/${itemId}/modifiers`),
    setModifiers: (itemId: string, groupIds: string[]) =>
      fetchAPI(`/admin/menu/items/${itemId}/modifier-groups`, {
        method: "POST",
        body: JSON.stringify({ groupIds }),
      }),
  },

  // Modifier Groups management
  modifiers: {
    getAll: () => fetchAPI<any[]>("/admin/menu/modifier-groups"),
    createGroup: (data: {
      name: string;
      selection_type: "single" | "multiple";
      min_selection?: number;
      max_selection?: number;
      required?: boolean;
    }) =>
      fetchAPI<any>("/admin/menu/modifier-groups", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateGroup: (
      id: number,
      data: {
        name: string;
        selection_type: "single" | "multiple";
        min_selection?: number;
        max_selection?: number;
        required?: boolean;
      }
    ) =>
      fetchAPI<any>(`/admin/menu/modifier-groups/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteGroup: (id: number) =>
      fetchAPI(`/admin/menu/modifier-groups/${id}`, { method: "DELETE" }),
    // Options
    addOption: (
      groupId: number,
      data: { name: string; price_adjustment: number }
    ) =>
      fetchAPI<any>(`/admin/menu/modifier-groups/${groupId}/options`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateOption: (
      optionId: number,
      data: { name: string; price_adjustment: number; status?: string }
    ) =>
      fetchAPI<any>(`/admin/menu/modifier-options/${optionId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteOption: (optionId: number) =>
      fetchAPI(`/admin/menu/modifier-options/${optionId}`, {
        method: "DELETE",
      }),
  },

  // Reports
  reports: {
    getSummary: () =>
      fetchAPI<{
        today: { orders_today: string; revenue_today: string };
        active: { active_orders: string };
      }>("/admin/reports/summary"),
    getDailyReport: (from?: string, to?: string) => {
      const query = from && to ? `?from=${from}&to=${to}` : "";
      return fetchAPI<any[]>(`/admin/reports/daily${query}`);
    },
    getTopItems: () => fetchAPI<any[]>("/admin/reports/top-items"),
  },

  // Orders management
  orders: {
    getAll: (status?: string) => {
      const query = status ? `?status=${status}` : "";
      return fetchAPI<any[]>(`/orders${query}`);
    },
    getRecent: (limit: number = 10) =>
      fetchAPI<any[]>(`/orders?limit=${limit}`),
  },
};

// ==================== QR API ====================

export const qrAPI = {
  // Verify QR token
  verify: (tableId: string, token: string) =>
    fetchAPI<{ valid: boolean; table: any }>(
      `/qr/verify?tableId=${tableId}&token=${token}`
    ),
};

// ==================== REVIEWS API ====================

export const reviewsAPI = {
  // Submit review
  submit: (data: { orderId: string; rating: number; comment?: string }) =>
    fetchAPI<{ data: any }>("/reviews", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Get reviews for item
  getItemReviews: (itemId: string) =>
    fetchAPI<{ data: any[] }>(`/reviews/item/${itemId}`),
};

export default {
  auth: authAPI,
  customerAuth: customerAuthAPI,
  menu: menuAPI,
  order: orderAPI,
  kitchen: kitchenAPI,
  waiter: waiterAPI,
  payment: paymentAPI,
  admin: adminAPI,
  qr: qrAPI,
  reviews: reviewsAPI,
};
