import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebase';

class AuthService {
  // Envoyer un email de réinitialisation de mot de passe
  static async resetPassword(email) {
    try {
      if (!auth) throw new Error('Firebase Auth non disponible');
      if (!email) throw new Error('Veuillez entrer une adresse email.');
      await import('firebase/auth').then(({ sendPasswordResetEmail }) =>
        sendPasswordResetEmail(auth, email, {
          url: (auth && auth.app && auth.app.options && auth.app.options.authDomain)
            ? `https://${auth.app.options.authDomain}`
            : 'https://typevision-ac679.firebaseapp.com',
        })
      );
      return { success: true };
    } catch (error) {
      let msg = 'Erreur lors de la réinitialisation du mot de passe.';
      if (error.code === 'auth/user-not-found') {
        msg = "Aucun compte n'est associé à cette adresse email.";
      } else if (error.code === 'auth/invalid-email') {
        msg = 'Adresse email invalide.';
      } else if (error.code === 'auth/too-many-requests') {
        msg = 'Trop de tentatives. Réessayez plus tard.';
      } else if (error.message) {
        msg = error.message;
      }
      return { success: false, message: msg };
    }
  }
  
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
        emailVerified: userCredential.user.emailVerified,
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
      
      if (!auth) {
        throw new Error('Firebase Auth not available');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Compte email créé:', user.uid);
      console.log('🔍 État initial emailVerified:', user.emailVerified);
      
      // Envoyer l'email de vérification avec multiple tentatives
      let emailSent = false;
      try {
        console.log('📤 Tentative d\'envoi email de vérification...');
        
        // Méthode 1: Envoi direct avec URL spécifique
        try {
          await sendEmailVerification(user, {
            url: 'https://typevision-ac679.firebaseapp.com',
            handleCodeInApp: false
          });
          console.log('✅ Email envoyé (méthode 1)');
          emailSent = true;
        } catch (error1) {
          console.log('⚠️ Méthode 1 échouée:', error1.code);
          
          // Méthode 2: Attendre et réessayer avec reload
          try {
            console.log('🔄 Tentative méthode 2...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            await user.reload();
            
            await sendEmailVerification(auth.currentUser);
            console.log('✅ Email envoyé (méthode 2)');
            emailSent = true;
          } catch (error2) {
            console.log('⚠️ Méthode 2 échouée:', error2.code);
            
            // Méthode 3: Dernière tentative après rechargement complet
            try {
              console.log('🔄 Tentative méthode 3...');
              await new Promise(resolve => setTimeout(resolve, 3000));
              
              const currentUser = auth.currentUser;
                if (currentUser) {
                  // Build a safe continue URL from Firebase app options when available
                  const continueUrl = (auth && auth.app && auth.app.options && auth.app.options.authDomain)
                    ? `https://${auth.app.options.authDomain}`
                    : 'https://typevision-ac679.firebaseapp.com';

                  await sendEmailVerification(currentUser, {
                    url: continueUrl,
                  });
                console.log('✅ Email envoyé (méthode 3)');
                emailSent = true;
              }
            } catch (error3) {
              console.error('❌ Toutes les tentatives échouées');
              throw error3; // On lance la dernière erreur
            }
          }
        }
        
      } catch (emailError) {
        console.error('❌ Erreur finale envoi email:', emailError);
        console.error('Code d\'erreur:', emailError.code);
        console.error('Message:', emailError.message);
        
        if (emailError.code === 'auth/too-many-requests') {
          console.log('⚠️ Trop de tentatives. Compte créé, email envoyé plus tard.');
        } else if (emailError.code === 'auth/network-request-failed') {
          console.log('⚠️ Problème réseau. Compte créé, vérifiez votre connexion.');
        } else {
          console.log('⚠️ Compte créé, email envoyé après reconnexion.');
        }
        
        // Ne pas faire échouer la création de compte
        emailSent = false;
      }
      
      return {
        id: user.uid,
        username: email.split('@')[0],
        email: user.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(email.split('@')[0])}&background=2C3E50&color=ffffff&size=100`,
        type: 'email',
        isGuest: false,
        firebaseUser: user,
        emailVerified: user.emailVerified,
        emailSent: emailSent,
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
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Problème de connexion. Vérifiez votre internet.');
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

  // Vérifier la configuration email et donner des instructions
  static async checkEmailConfiguration() {
    console.log('🔧 Vérification configuration email Firebase...');
    
    if (!auth) {
      return {
        configured: false,
        error: 'Firebase Auth non disponible'
      };
    }

    try {
      // Avoid creating test users (can trigger rate limits). Instead provide diagnostics
      const info = {
        configured: true,
        projectId: auth?.app?.options?.projectId || null,
        authDomain: auth?.app?.options?.authDomain || null,
        instructions: [
          '1. Ouvrir Firebase Console: https://console.firebase.google.com',
          `2. Sélectionner le projet "${auth?.app?.options?.projectId || 'typevision-ac679'}"`,
          '3. Aller dans Authentication > Templates et vérifier que les templates d\'email sont configurés',
          '4. Vérifier dans Authentication > Sign-in method que Email/Password est activé et que les domaines autorisés contiennent votre domaine',
          '5. Si vous utilisez Firebase en production et envoyez beaucoup d\'emails, passez au plan Blaze pour éviter les quotas stricts',
          '6. Vérifier la section Usage / Quotas dans la console Firebase pour voir des erreurs d\'envoi ou des limitations'
        ]
      };

      // If authDomain or projectId are missing, mark as not configured
      if (!info.authDomain || !info.projectId) {
        info.configured = false;
        info.error = 'Domaine d\'authentification ou projectId manquant dans la configuration Firebase';
      }

      return info;
    } catch (err) {
      return {
        configured: false,
        error: err?.message || String(err)
      };
    }
  }
  static async resendEmailVerification() {
    // Exponential backoff retry (up to 3 attempts) to reduce rate-limit errors
    const user = auth?.currentUser;
    if (!user) {
      throw new Error('Aucun utilisateur connecté');
    }

    if (user.emailVerified) {
      return { success: true, alreadyVerified: true };
    }

    // Make sure we have freshest user data
    try {
      await user.reload();
    } catch (reloadErr) {
      console.warn('⚠️ reload user failed before resend:', reloadErr?.message || reloadErr);
    }

    const maxAttempts = 3;
    let attempt = 0;
    let lastError = null;

    // determine a safe continue URL
    const continueUrl = (auth && auth.app && auth.app.options && auth.app.options.authDomain)
      ? `https://${auth.app.options.authDomain}`
      : 'https://typevision-ac679.firebaseapp.com';

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        // small delay before each attempt (increasing)
        const delayMs = 500 * Math.pow(2, attempt - 1);
        await new Promise(r => setTimeout(r, delayMs));

        await sendEmailVerification(user, {
          url: continueUrl,
          handleCodeInApp: false
        });

        console.log(`📨 Email de vérification renvoyé (attempt ${attempt}) à:`, user.email);
        return { success: true, alreadyVerified: false };
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ Tentative ${attempt} échouée:`, error?.code || error?.message || error);

        // If it's a network error, try again; if too-many-requests, bail out and escalate wait time
        if (error?.code === 'auth/too-many-requests') {
          // encourage caller to set a longer cooldown
          throw new Error('Trop de tentatives d\'envoi. Attendez quelques minutes avant de réessayer.');
        }

        if (error?.code === 'auth/network-request-failed' && attempt < maxAttempts) {
          // loop to retry
          continue;
        }

        // For other errors, break and surface the message
        break;
      }
    }

    console.error('❌ Erreur renvoi email après tentatives:', lastError);
    if (lastError?.code === 'auth/network-request-failed') {
      throw new Error('Problème de connexion. Vérifiez votre internet et réessayez.');
    }
    throw new Error(lastError?.message || 'Erreur lors de l\'envoi de l\'email');
  }

  // Vérifier le statut de vérification de l'email
  static async checkEmailVerification() {
    try {
      const user = auth?.currentUser;
      if (!user) {
        return { verified: false, user: null };
      }

      // Recharger les données utilisateur pour obtenir le statut à jour
      await user.reload();
      
      return { 
        verified: user.emailVerified, 
        user: {
          id: user.uid,
          email: user.email,
          emailVerified: user.emailVerified
        }
      };

    } catch (error) {
      console.log('❌ Erreur vérification statut email:', error);
      return { verified: false, user: null };
    }


}
}

export default AuthService;
