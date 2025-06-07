// src/utils/api.js
import axios from "axios";

export const BASE_URL = "http://localhost:7000/api/";


const api = axios.create({
  baseURL: BASE_URL, 
  withCredentials: true, // Optional: for cookies or tokens
});

export default api;


