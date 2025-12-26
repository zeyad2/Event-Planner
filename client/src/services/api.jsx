import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
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
  return localStorage.getItem("authToken");
};

// Event API functions
export const eventAPI = {
  // Get all events with optional filters
  getEvents: (params = {}) => {
    return apiClient.get("/events", { params });
  },

  // Get single event by ID
  getEventById: (id) => {
    return apiClient.get(`/events/${id}`);
  },

  // Create a new event
  createEvent: (data) => {
    return apiClient.post("/events", data);
  },

  // Update an existing event
  updateEvent: (id, data) => {
    return apiClient.put(`/events/${id}`, data);
  },

  // Delete an event
  deleteEvent: (id) => {
    return apiClient.delete(`/events/${id}`);
  },

  // Get attendees for an event
  getEventAttendees: (id) => {
    return apiClient.get(`/events/${id}/attendees`);
  },

  // Invite users to an event
  inviteToEvent: (id, emails) => {
    return apiClient.post(`/events/${id}/attendees/invite`, { emails });
  },

  // Update attendance status
  updateAttendanceStatus: (id, status) => {
    return apiClient.patch(`/events/${id}/attendees/status`, { status });
  },
};

export default apiClient;
