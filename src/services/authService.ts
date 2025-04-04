import axios from 'axios';
import { User } from '../types/user';
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

export const registerUser = async (userData: User) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const getUserByFirebaseUid = async (firebaseUid: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/user`, {
      params: { firebaseUid }
    });
    return response.data;
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
};