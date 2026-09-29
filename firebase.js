import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBzlLVCZXWhfo-9Z_IU9Ywqduznx9uiFYg",
    authDomain: "bangglevollycup.firebaseapp.com",
    projectId: "bangglevollycup",
    storageBucket: "bangglevollycup.firebasestorage.app",
    messagingSenderId: "889961164354",
    appId: "1:889961164354:web:c87cf67e312b835ea5c7db"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

export { db };