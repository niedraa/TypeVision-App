// Configuration Firebase pour TypeVision - PRODUCTION
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration Firebase RÉELLE - TypeVision avec vos clés
const firebaseConfig = {
  apiKey: "AIzaSyBt8iyTvsgskg4byNtAJRfmuTlQDWYfv0s",
  authDomain: "typevision-ac679.firebaseapp.com",
  // URL mise à jour avec celle fournie par l'utilisateur
  databaseURL: "https://typevision-ac679-default-rtdb.firebaseio.com/",
  projectId: "typevision-ac679",
  storageBucket: "typevision-ac679.firebasestorage.app",
  messagingSenderId: "568887870769",
  appId: "1:568887870769:web:4f3714d8aa26057b56dc10",
  measurementId: "G-XPGZXZWQL6"
};

// Initialisation de Firebase avec gestion d'erreur améliorée
let app = null;
let database = null;
let auth = null;

try {
  app = initializeApp(firebaseConfig);
  console.log('🔥 Firebase App initialisé avec succès');
  
  try {
    // Initialiser la base de données
    database = getDatabase(app);
    console.log('📊 Firebase Realtime Database connecté');
  } catch (dbError) {
    console.log('⚠️ Firebase Realtime Database non disponible:', dbError.message);
    console.log('');
    console.log('📋 INSTRUCTIONS POUR CRÉER LA BASE DE DONNÉES:');
    console.log('   1. Ouvrez https://console.firebase.google.com');
    console.log('   2. Sélectionnez votre projet "typevision-ac679"');
    console.log('   3. Dans le menu, cliquez sur "Realtime Database"');
    console.log('   4. Cliquez sur "Créer une base de données"');
    console.log('   5. Choisissez "Commencer en mode test" pour les règles');
    console.log('   6. Sélectionnez la région la plus proche');
    console.log('   7. Redémarrez l\'app une fois créée');
    console.log('');
    database = null;
  }
  
  try {
    // Initialiser l'authentification
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
    console.log('🔐 Firebase Auth configuré');
  } catch (authError) {
    console.log('⚠️ Firebase Auth non disponible:', authError.message);
    auth = null;
  }
  
} catch (error) {
  console.log('❌ Erreur Firebase générale:', error.message);
  console.log('🔄 Mode local activé automatiquement');
  app = null;
  database = null;
  auth = null;
}

// Helper pour vérifier si Firebase est opérationnel
export const isFirebaseReady = () => {
  return app !== null && database !== null;
};

// Helper pour obtenir le statut Firebase
export const getFirebaseStatus = () => {
  return {
    app: app !== null,
    database: database !== null,
    auth: auth !== null,
    ready: isFirebaseReady()
  };
};

export { database, auth };
export default app;
