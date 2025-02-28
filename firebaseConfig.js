import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyA9EBWwX1HDOm3UC6E7SqaIN-0s0zOWocg',
  authDomain: 'adhd-assistant-43bcf.firebaseapp.com',
  //databaseURL: 'https://adhd-assistant-43bcf.firebaseio.com',
  projectId: 'adhd-assistant-43bcf',
  storageBucket: 'adhd-assistant-43bcf.firebasestorage.app',
  //messagingSenderId: 'sender-id',
  appId: '1:674156983431:android:3c3a628b1dc1196ce1f422',
  //measurementId: 'G-measurement-id',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
