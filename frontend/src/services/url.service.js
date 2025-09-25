import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_API_URL;
// console.log(import.meta.env.VITE_BACKEND_API_URL);

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export default axiosInstance;
