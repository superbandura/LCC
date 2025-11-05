import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCyvrXqToLc6LxuMoXRPLeG-c08z4aAzIo",
  authDomain: "test-autentication-8ab27.firebaseapp.com",
  projectId: "test-autentication-8ab27",
  storageBucket: "test-autentication-8ab27.firebasestorage.app",
  messagingSenderId: "64206270267",
  appId: "1:64206270267:web:37234bd7e5877e0c2f111e",
  measurementId: "G-PS4C88NLQ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);
