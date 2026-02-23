import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL;
const SERVICE_API = `${BASE}/api/service`;
const PING_API = `${BASE}/api`;

// Health Check Services
export const getStatuses = () => axios.get(`${SERVICE_API}/status/all`);
export const addService = (data) => axios.post(`${SERVICE_API}/add`, data);
export const updateCron = (id, cron) => axios.put(`${SERVICE_API}/update-cron/${id}`, null, { params: { cron } });
export const deleteService = (id) => axios.delete(`${SERVICE_API}/delete/${id}`);

// Ping
export const pingService = (data) => axios.post(`${PING_API}/ping`, data);
export const getPingHistory = () => axios.get(`${PING_API}/ping-history`);


















// import axios from "axios";

// const API = import.meta.env.VITE_API_BASE_URL + "/api/service";
// const PING_API = import.meta.env.VITE_API_BASE_URL + "/api/ping";

// export const getStatuses = () => axios.get(`${API}/status/all`);
// export const addService = (data) => axios.post(`${API}/add`, data);

// export const pingService = (data) => axios.post(PING_API, data);
// export const getPingStatuses = () => axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/statuses`);
// export const getPingHistory = () => axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/ping-history`);