import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';
import { OAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from './firebase';

class AppleAuthService {
  
  // Vérifier si l'authentification Apple est disponible
  static async isAvailable() {
    if (Platform.OS !== 'ios') {
      return false;
    }
    
    try {
      return await AppleAuthentication.isAvailableAsync();
    } catch (error) {
      console.log('❌ Erreur vérification Apple Auth:', error);
      return false;
    }
  }

  // Connexion avec Apple ID
  static async signInWithApple() {
    try {
      console.log('🍎 Début de la connexion Apple...');

      // Vérifier la disponibilité
      const isAvailable = await this.isAvailable();
      if (!isAvailable) {
        throw new Error('Apple Authentication not available on this device');
      }

      // Demander l'authentification Apple
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      console.log('🍎 Credential Apple reçu:', {
        user: credential.user,
        email: credential.email,
        fullName: credential.fullName,
        authorizationCode: credential.authorizationCode ? 'présent' : 'absent',
        identityToken: credential.identityToken ? 'présent' : 'absent'
      });

      // Vérifier que nous avons les tokens nécessaires
      if (!credential.identityToken) {
        throw new Error('No identity token received from Apple');
      }

      // Si Firebase est disponible, essayer de connecter avec Firebase
      if (auth) {
        try {
          const firebaseUser = await this.signInWithFirebase(credential);
          return this.createUserFromFirebase(firebaseUser, credential);
        } catch (firebaseError) {
          console.log('⚠️ Firebase Apple non configuré, passage en mode local:', firebaseError.message);
          console.log('💡 Pour activer la sync cloud: Activez Apple dans Firebase Console > Authentication > Sign-in method');
          // Fallback vers mode local si Firebase n'est pas configuré
          const localUser = this.createLocalUser(credential);
          console.log('✅ Connexion Apple réussie (mode local):', localUser.username);
          return localUser;
        }
      } else {
        // Mode local sans Firebase
        const localUser = this.createLocalUser(credential);
        console.log('✅ Connexion Apple réussie (mode local - Firebase non disponible):', localUser.username);
        return localUser;
      }

    } catch (error) {
      console.log('❌ Erreur connexion Apple:', error);
      
      if (error.code === 'ERR_REQUEST_CANCELED') {
        throw new Error('Apple sign-in was canceled');
      } else if (error.code === 'ERR_REQUEST_NOT_HANDLED') {
        throw new Error('Apple sign-in not handled');
      } else if (error.code === 'ERR_REQUEST_NOT_INTERACTIVE') {
        throw new Error('Apple sign-in not interactive');
      } else {
        throw error;
      }
    }
  }

  // Connexion avec Firebase en utilisant le credential Apple
  static async signInWithFirebase(appleCredential) {
    try {
      console.log('🔥 Connexion Firebase avec Apple credential...');

      // Créer le provider OAuth pour Apple
      const provider = new OAuthProvider('apple.com');

      // Créer le credential Firebase
      const firebaseCredential = provider.credential({
        idToken: appleCredential.identityToken,
        rawNonce: appleCredential.nonce, // Si vous utilisez un nonce
      });

      // Connexion à Firebase
      const userCredential = await signInWithCredential(auth, firebaseCredential);
      console.log('✅ Connexion Firebase Apple réussie:', userCredential.user.uid);
      
      return userCredential.user;
    } catch (error) {
      console.log('❌ Erreur connexion Firebase Apple:', error);
      throw error;
    }
  }

  // Créer un utilisateur à partir du user Firebase
  static createUserFromFirebase(firebaseUser, appleCredential) {
    const displayName = this.getDisplayName(appleCredential, firebaseUser);
    
    return {
      id: firebaseUser.uid,
      username: displayName,
      email: firebaseUser.email || appleCredential.email || `${firebaseUser.uid}@apple.signin`,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=000000&color=ffffff&size=100`,
      type: 'apple',
      isGuest: false,
      firebaseUser: firebaseUser,
      appleCredential: appleCredential,
      createdAt: new Date().toISOString()
    };
  }

  // Créer un utilisateur local (sans Firebase)
  static createLocalUser(appleCredential) {
    const displayName = this.getDisplayName(appleCredential);
    const userId = `apple_${appleCredential.user}`;
    
    return {
      id: userId,
      username: displayName,
      email: appleCredential.email || `${userId}@apple.signin`,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=000000&color=ffffff&size=100`,
      type: 'apple',
      isGuest: false,
      appleCredential: appleCredential,
      createdAt: new Date().toISOString()
    };
  }

  // Extraire le nom d'affichage
  static getDisplayName(appleCredential, firebaseUser = null) {
    // Essayer d'abord le nom complet d'Apple
    if (appleCredential.fullName) {
      const { givenName, familyName } = appleCredential.fullName;
      if (givenName || familyName) {
        return `${givenName || ''} ${familyName || ''}`.trim();
      }
    }

    // Ensuite le nom d'affichage Firebase
    if (firebaseUser?.displayName) {
      return firebaseUser.displayName;
    }

    // Ensuite l'email
    const email = firebaseUser?.email || appleCredential.email;
    if (email) {
      return email.split('@')[0];
    }

    // Par défaut
    return 'Utilisateur Apple';
  }

  // Déconnexion
  static async signOut() {
    try {
      if (auth && auth.currentUser) {
        await auth.signOut();
        console.log('✅ Déconnexion Firebase Apple réussie');
      }
    } catch (error) {
      console.log('❌ Erreur déconnexion Apple:', error);
      throw error;
    }
  }

  // Vérifier si l'utilisateur est connecté avec Apple
  static isSignedIn() {
    return auth?.currentUser?.providerData?.some(
      provider => provider.providerId === 'apple.com'
    ) || false;
  }

  // Obtenir l'utilisateur actuel
  static getCurrentUser() {
    return auth?.currentUser || null;
  }
}

export default AppleAuthService;
