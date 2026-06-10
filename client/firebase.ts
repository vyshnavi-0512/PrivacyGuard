// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLD2jhQgCaKhOtEq0RqxEelzv2mnjc70I",
  authDomain: "privacyguard-e9f0c.firebaseapp.com",
  projectId: "privacyguard-e9f0c",
  storageBucket: "privacyguard-e9f0c.firebasestorage.app",
  messagingSenderId: "838150108497",
  appId: "1:838150108497:web:5c9a725755efd3dfcb4f70",
  measurementId: "G-H4DNBX00RG"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;

