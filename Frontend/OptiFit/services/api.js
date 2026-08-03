import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
const api = axios.create({
  //my home wifi ip
  //baseURL: "http://192.168.1.35:5000/api",
  //baseURL: "http://192.168.1.104:5000/api",
  //Render URl
  //baseURL:"https://optifit-backend-csqj.onrender.com/api",

  //RAILWAY
  //baseURL: "https://optifitmain-backend-production.up.railway.app/api"

  //Render main URL
  baseURL:"https://optifit-main-backend.onrender.com/api",
  //TailScale
  //baseURL: "http://100.105.183.83:5000/api",
  //baseURL: "https://45c03664e060c3.lhr.life/api"
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