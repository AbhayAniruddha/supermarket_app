// Import the functions you need from the SDKs you need
import { initializeApp,getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAwvavAZGNojHbMbRz4BZVwjbhYlIa-Bas",
  authDomain: "supermarket-8a96a.firebaseapp.com",
  projectId: "supermarket-8a96a",
  storageBucket: "supermarket-8a96a.appspot.com",
  messagingSenderId: "443069892961",
  appId: "1:443069892961:web:1597cb46a3fe1b40409d20",
  measurementId: "G-VDHHEZK9W9"
};

// Initialize Firebase
const app = !getApps.length ? initializeApp(firebaseConfig) : getApp();
//const analytics = getAnalytics(app);

const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore, app };