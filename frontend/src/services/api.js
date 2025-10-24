import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_URL}/api/registrations`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadCSV = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  return api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      if (onProgress) {
        onProgress(percentCompleted);
      }
    },
  });
};

export const getAllData = async () => {
  return api.get('/all');
};

export const seedDatabase = async () => {
  return api.post('/seed');
};

export const addStudent = async (studentData) => {
  return api.post('/students', studentData);
};

export const addInstructor = async (instructorData) => {
  return api.post('/instructors', instructorData);
};

export const addClassType = async (classTypeData) => {
  return api.post('/classtypes', classTypeData);
};

export default api;

