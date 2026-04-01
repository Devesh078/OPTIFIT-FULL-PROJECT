import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const api = axios.create({
  //my home wifi ip
  baseURL: "http://192.168.1.38:5000/api",
  //Render URl
  //baseURL:"https://optifit-backend-csqj.onrender.com/api",
});

// Attach token automatically
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;