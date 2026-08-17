import * as Crypto from 'expo-crypto';

import { User } from '../../domain/entities';
import {
  AuthRepository,
  LoginData,
  RegisterData,
} from '../../domain/repositories/AuthRepository';

import {
  clearSession,
  getSession,
  getStoredUsers,
  LocalUserRecord,
  saveSession,
  saveStoredUsers,
} from '../local/authStorage';
import {
  upsertUserInSQLite,
} from '../local/userStorageSqlite';

async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function removePasswordHash(record: LocalUserRecord): User {
  const { passwordHash, ...user } = record;

  return user;
}

export class LocalAuthRepository implements AuthRepository {
  async register(data: RegisterData): Promise<User> {
    const users = await getStoredUsers();
    const email = normalizeEmail(data.email);

    const existingUser = users.find(
      (user) => normalizeEmail(user.email) === email
    );

    if (existingUser) {
      throw new Error('Ya existe una cuenta con este correo.');
    }

    const now = new Date().toISOString();
    const passwordHash = await hashPassword(data.password);

    const newRecord: LocalUserRecord = {
      id: generateId(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email,
      passwordHash,
      createdAt: now,
      updatedAt: now,
    };

    await saveStoredUsers([...users, newRecord]);

    const user = removePasswordHash(newRecord);
    await upsertUserInSQLite(user);
    await saveSession(user);

    return user;
  }

  async login(data: LoginData): Promise<User> {
    const users = await getStoredUsers();
    const email = normalizeEmail(data.email);
    const passwordHash = await hashPassword(data.password);

    const record = users.find(
      (user) => normalizeEmail(user.email) === email
    );

    if (!record || record.passwordHash !== passwordHash) {
      throw new Error('Correo o contraseña incorrectos.');
    }

    const user = removePasswordHash(record);
    await upsertUserInSQLite(user);
    await saveSession(user);

    return user;
  }

  async logout(): Promise<void> {
    await clearSession();
  }

  async getCurrentUser(): Promise<User | null> {
    const user = await getSession();
    if (!user) {
      return null;
    }

    await upsertUserInSQLite(user);
    return user;
  }
}