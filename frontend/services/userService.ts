import axios from 'axios';
import { User } from '@/types';

export async function getAllUsers(): Promise<User[]> {
  const response = await axios.get<User[]>('http://192.168.0.34:5000/api/users');
  return response.data;
}
