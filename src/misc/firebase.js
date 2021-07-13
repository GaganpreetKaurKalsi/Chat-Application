import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database'

const config = {
    apiKey: "AIzaSyDFDbFDH-lFac-rpKGV1rqdPJdb_W3PRNQ",
    authDomain: "chat-web-app-265cf.firebaseapp.com",
    projectId: "chat-web-app-265cf",
    storageBucket: "chat-web-app-265cf.appspot.com",
    messagingSenderId: "550480443723",
    appId: "1:550480443723:web:c3cfe24a6a789b186190ce"
  };

const app = firebase.initializeApp(config);
export const auth = app.auth();
export const database = app.database();