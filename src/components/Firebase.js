import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0AlIQ8-0HjI8hpypEFbGCrCkHnYbnOmM",
  authDomain: "stock-details-ae2ae.firebaseapp.com",
  databaseURL: "https://stock-details-ae2ae-default-rtdb.firebaseio.com/",
  projectId: "stock-details-ae2ae",
  storageBucket: "stock-details-ae2ae.appspot.com",
  messagingSenderId: "913189088175",
  appId: "1:913189088175:web:7045cb632cdbe0c3ed9d5a",
  measurementId: "G-G48P3B98J3",
};

const app = initializeApp(firebaseConfig);
const database = getFirestore(app);

export { database };
