import { initializeApp } from 'firebase/app';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
// Initialize Firebase
const firebaseConfig = {
  apiKey: Constants.expoConfig.extra.FIREBASE_API_KEY,
  authDomain: 'adhd-assistant-43bcf.firebaseapp.com',
  projectId: 'adhd-assistant-43bcf',
  storageBucket: 'adhd-assistant-43bcf.firebasestorage.app',
  appId: '1:674156983431:android:3c3a628b1dc1196ce1f422',
};

export const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, { cacheSizeBytes: CACHE_SIZE_UNLIMITED });
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});