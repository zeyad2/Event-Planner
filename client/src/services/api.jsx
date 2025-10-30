import axios from "axios";
const API_BASE_URL = "http://localhost:8000/api";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

//add header before
//  reqs
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//responses
// appCLient.interceptors.response.use((response) => {
//   return response;
// },
// (error)=>{
    
// });

const getToken = () => {
  return localStorage.getItem("token");
};

export default apiClient;
