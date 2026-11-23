// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBmAaGyoMeIfcofwFs5MaKbFlM-UcxY8l8",
  authDomain: "finanzas-app-39339.firebaseapp.com",
  projectId: "finanzas-app-39339",
  storageBucket: "finanzas-app-39339.firebasestorage.app",
  messagingSenderId: "195318126219",
  appId: "1:195318126219:web:6e186292b344c39e38668e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
export const db = getFirestore(app);
export const storage = getStorage(app);