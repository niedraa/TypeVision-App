import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from './firebase';

class AuthService {
  
  // Connexion avec email et mot de passe (seulement connexion)
  static async signInWithEmail(email, password) {
    try {
      console.log('📧 Connexion avec email:', email);
      
      if (!auth) {
        throw new Error('Firebase Auth not available');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ Connexion email réussie:', userCredential.user.uid);
      
      return {
        id: userCredential.user.uid,
        username: userCredential.user.displayName || email.split('@')[0],
        email: userCredential.user.email,
        avatar: userCredential.user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=2C3E50&color=ffffff&size=100`,
        type: 'email',
        isGuest: false,
        firebaseUser: userCredential.user,
        createdAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.log('❌ Erreur connexion email:', error);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('Aucun compte trouvé avec cette adresse email');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Mot de passe incorrect');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Adresse email invalide');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Trop de tentatives de connexion. Réessayez plus tard.');
      } else {
        throw new Error('Erreur de connexion. Vérifiez vos identifiants.');
      }
    }
  }

  // Créer un compte avec email et mot de passe
  static async createEmailAccount(email, password) {
    try {
      console.log('📧 Création compte email:', email);
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('✅ Compte email créé:', userCredential.user.uid);
      
      return {
        id: userCredential.user.uid,
        username: email.split('@')[0],
        email: userCredential.user.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=2C3E50&color=ffffff&size=100`,
        type: 'email',
        isGuest: false,
        firebaseUser: userCredential.user,
        createdAt: new Date().toISOString()
      };
      
    } catch (error) {
      console.log('❌ Erreur création compte email:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Cette adresse email est déjà utilisée');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Adresse email invalide');
      } else {
        throw new Error('Erreur lors de la création du compte');
      }
    }
  }

  // Déconnexion
  static async signOut() {
    try {
      if (auth && auth.currentUser) {
        await auth.signOut();
        console.log('✅ Déconnexion Firebase réussie');
      }
    } catch (error) {
      console.log('❌ Erreur déconnexion:', error);
      throw error;
    }
  }

  // Obtenir l'utilisateur actuel
  static getCurrentUser() {
    return auth?.currentUser || null;
  }

  // Vérifier si l'utilisateur est connecté
  static isSignedIn() {
    return auth?.currentUser !== null;
  }
}

export default AuthService;
