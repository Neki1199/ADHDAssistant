import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Optionally import the services that you want to use
// import {...} from 'firebase/auth';
// import {...} from 'firebase/database';
// import {...} from 'firebase/firestore';
// import {...} from 'firebase/functions';
// import {...} from 'firebase/storage';

// Initialize Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyA9EBWwX1HDOm3UC6E7SqaIN-0s0zOWocg',
  authDomain: 'adhd-assistant-43bcf.firebaseapp.com',
  databaseURL: 'https://adhd-assistant-43bcf.firebaseio.com',
  projectId: 'adhd-assistant-43bcf',
  storageBucket: 'adhd-assistant-43bcf.firebasestorage.app',
  //messagingSenderId: 'sender-id',
  appId: '1:674156983431:android:3c3a628b1dc1196ce1f422',
  //measurementId: 'G-measurement-id',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
// For more information on how to access Firebase in your project,
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase