import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { User } from '../../domain/entities';

const USERS_KEY = '@homelive:users';
const SESSION_KEY = 'homelive_session';

export interface LocalUserRecord extends User {
  passwordHash: string;
}

export async function getStoredUsers(): Promise<LocalUserRecord[]> {
  const storedUsers = await AsyncStorage.getItem(USERS_KEY);

  if (!storedUsers) {
    return [];
  }

  return JSON.parse(storedUsers) as LocalUserRecord[];
}

export async function saveStoredUsers(
  users: LocalUserRecord[]
): Promise<void> {
  await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function saveSession(user: User): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(user));
}

export async function getSession(): Promise<User | null> {
  const session = await SecureStore.getItemAsync(SESSION_KEY);

  if (!session) {
    return null;
  }

  return JSON.parse(session) as User;
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}