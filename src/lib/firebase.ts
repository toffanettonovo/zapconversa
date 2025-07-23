// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "wa-manager-3q1id",
  "appId": "1:1002987912989:web:43f778e4fd249cf8ea2bf4",
  "storageBucket": "wa-manager-3q1id.firebasestorage.app",
  "apiKey": "AIzaSyCfjMfw_7AHy1ZBTagLT1g0fOAhiW8DuVw",
  "authDomain": "wa-manager-3q1id.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "1002987912989"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
