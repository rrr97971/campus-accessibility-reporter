import api from './axios';

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await api.post('/uploads/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data.image_url;
}
