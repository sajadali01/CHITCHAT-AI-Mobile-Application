import axios from 'axios';
import { User } from '@/types';
import { AuthResponse } from '@/types';
// Replace this with your backend base URL
const API_BASE_URL = 'http://10.138.62.96:5000/api';

export async function loginUser(email: string, password: string):  Promise<AuthResponse>{
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });
    return {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      token: response.data.token,
      // profileImage: response.data.profileImage || '',
    };
  } catch (error: any) {
    console.error('Login error:', error);
    throw new Error(error.response?.data?.message || 'Login failed');
  }
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthResponse>{
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      name,
      email,
      password,
    });
    return {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      token: response.data.token,
      // profileImage: response.data.profileImage || '',
    };
  } catch (error: any) {
    console.error('Register error:', error);
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
}


export async function googleRegister(token: string, name: string, profileImage?: string): Promise<User> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/google-register`,
      { name, profileImage },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      // profileImage: response.data.profileImage || '',
    };
  } catch (error: any) {
    console.error('Google register error:', error);
    throw new Error(error.response?.data?.message || 'Google registration failed');
  }
}

export async function googleLogin(token: string): Promise<User> {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/google-login`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return {
      id: response.data.id,
      name: response.data.name,
      email: response.data.email,
      // profileImage: response.data.profileImage || '',
    };
  } catch (error: any) {
    console.error('Google login error:', error);
    throw new Error(error.response?.data?.message || 'Google login failed');
  }
}
