import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, getDocs, setDoc, collection, onSnapshot } from 'firebase/firestore';

// Configuration provided in the user's simplified code snippet
const firebaseConfig = {
  apiKey: "AIzaSyCfrX0U_2dGPK6qNsBQshfJ0S_hq39pmgU",
  authDomain: "bolao-da-copa-ff854.firebaseapp.com",
  projectId: "bolao-da-copa-ff854",
  storageBucket: "bolao-da-copa-ff854.firebasestorage.app",
  messagingSenderId: "730063016595",
  appId: "1:730063016595:web:a300394ce11bff5e0bb366",
  measurementId: "G-CH72NPPMPQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export { doc, getDoc, getDocs, setDoc, collection, onSnapshot };
