
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA85b9iQPGIe5dGQbOcLDd1-zeQQOMrMZo",
  authDomain: "blood-finder-b0e5e.firebaseapp.com",
  projectId: "blood-finder-b0e5e",
  storageBucket: "blood-finder-b0e5e.firebasestorage.app",
  messagingSenderId: "796301742420",
  appId: "1:796301742420:web:937bbd8d5047a57881b8c1",
  measurementId: "G-G7VQBNBL7N"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);




// ১. Firebase App ইনিশিয়ালাইজেশন
const app = initializeApp(firebaseConfig);

// ২. Authentication ও Firestore Database সার্ভিস এক্সপোর্ট
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);