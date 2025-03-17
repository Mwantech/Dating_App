// app/config/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration with direct values
const firebaseConfig = {
  apiKey: "AIzaSyBERrBdm0XbHRZi4kjnyiiBqkzSOcgiTO0",
  authDomain: "connect-me-46964.firebaseapp.com",
  projectId: "connect-me-46964",
  storageBucket: "connect-me-46964.appspot.com",
  messagingSenderId: "58590315043",
  appId: "1:558590315043:web:43a93a200894efcf2a7f96",
  measurementId: "G-F71R96WWPH",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, app };