import axiosClient from "./axiosClient";

const authApi = {
  login: (data) => {
    // data = { email, password }
    const url = "/auth/login";
    return axiosClient.post(url, data);
  },
  
  // Sau này có thể thêm:
  // logout: () => ...
  // getProfile: () => ...
};

export default authApi;