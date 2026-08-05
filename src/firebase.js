// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCpKf8gANxeEgXPzMFK7lm98I9jRiZUyiM",
  authDomain: "madhuram-cafe.firebaseapp.com",
  projectId: "madhuram-cafe",
  storageBucket: "madhuram-cafe.firebasestorage.app",
  messagingSenderId: "336555611143",
  appId: "1:336555611143:web:7f142eddde20f2c7b706a2",
  measurementId: "G-HXJXDZ3BEK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);