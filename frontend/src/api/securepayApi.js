import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 9000
});

export const getLiveTransactions = () => api.get('/transactions/live');
export const simulateTransaction = (payload) => api.post('/transactions/simulate', payload);
export const checkOTP = (payload) => api.post('/otp-check', payload);
export const checkQRCode = (payload) => api.post('/qrcode-check', payload);
export const getBehavior = () => api.get('/behavior');
export const getAlerts = () => api.get('/alerts');
export const receiverCheck = (payload) => api.post('/receiver-check', payload);

export default api;
