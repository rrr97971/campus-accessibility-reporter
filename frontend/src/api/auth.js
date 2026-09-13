import api from './axios';

export async function registerUser({ name, email, password }) {
  const { data } = await api.post('/auth/register', { name, email, password });
  return data; // { success, token, user }
}

export async function loginUser({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  return data; // { success, token, user }
}

export async function verifyEmail(token) {
  const { data } = await api.get(`/auth/verify-email?token=${token}`);
  return data;
}
