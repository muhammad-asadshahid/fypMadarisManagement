import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { User } from '@/types';

const AUTH_USER_KEY = 'mms_auth_user';
const LANGUAGE_KEY = 'mms_language';

async function setSecureItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getSecureItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteSecureItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function saveAuthUser(user: User): Promise<void> {
  await setSecureItem(AUTH_USER_KEY, JSON.stringify(user));
}

export async function getAuthUser(): Promise<User | null> {
  const raw = await getSecureItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function clearAuthUser(): Promise<void> {
  await deleteSecureItem(AUTH_USER_KEY);
}

export async function saveLanguage(language: 'en' | 'ur'): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
}

export async function getLanguage(): Promise<'en' | 'ur'> {
  const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
  return lang === 'ur' ? 'ur' : 'en';
}
