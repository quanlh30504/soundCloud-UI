import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCuRzAs-2f9PUCQrQXMGoPVbpTwKOk9zas",
    authDomain: "soundcloud-project-40412.firebaseapp.com",
    projectId: "soundcloud-project-40412",
    storageBucket: "soundcloud-project-40412.firebasestorage.app",
    messagingSenderId: "576788198283",
    appId: "1:576788198283:web:5c1a122ad45f31bbde358e",
    measurementId: "G-NFRXB23P4R"
  };

const app = initializeApp(firebaseConfig);

// Khởi tạo Authentication
const auth = getAuth(app);

// Khởi tạo Google Provider
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };