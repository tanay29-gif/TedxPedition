import dotenv from "dotenv";
dotenv.config();

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,

    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
};

console.log(firebaseConfig);

export const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const realtimeDB = getDatabase(app);