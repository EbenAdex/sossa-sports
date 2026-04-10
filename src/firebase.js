// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmWR4GLREwFNhwMIQBe5LuKTgUzUq755A",
  authDomain: "sportmania-b1cfe.firebaseapp.com",
  projectId: "sportmania-b1cfe",
  storageBucket: "sportmania-b1cfe.firebasestorage.app",
  messagingSenderId: "1024383398422",
  appId: "1:1024383398422:web:bbfd3dc1a015df1172fb37"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;