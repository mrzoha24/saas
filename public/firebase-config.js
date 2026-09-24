// firebase-config.js
// Shared Firebase initialization for PUB AI. Loaded via <script type="module"> on every page.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// TODO: if you rotate this key later, only this block needs to change.
const firebaseConfig = {
  apiKey: "AIzaSyA4GC9GV_4jC6P39_XXaKM8J_Bs2TnK6Bc",
  authDomain: "saas-c405c.firebaseapp.com",
  projectId: "saas-c405c",
  storageBucket: "saas-c405c.firebasestorage.app",
  messagingSenderId: "696632747319",
  appId: "1:696632747319:web:dd46b9f354e34545f626b2",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export {
  ref,
  uploadBytes,
  getDownloadURL,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
};
