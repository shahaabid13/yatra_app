import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

export const firebaseConfig = {
  apiKey: "AIzaSyAvfx0rG4oFTWK3jM3u_wAWmsX3GqToRWY",
  authDomain: "amarnath-yatra-iccc.firebaseapp.com",
  projectId: "amarnath-yatra-iccc",
  storageBucket: "amarnath-yatra-iccc.appspot.com",
  messagingSenderId: "417253505539",
  appId: "1:417253505539:web:a7a58b15cf3a6c36",
  measurementId: "G-42W8E5ZFNH"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, app };

