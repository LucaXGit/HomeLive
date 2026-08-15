import { User } from '../entities';

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthRepository {
  register(data: RegisterData): Promise<User>;
  login(data: LoginData): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}