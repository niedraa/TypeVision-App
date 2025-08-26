import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();

// Traductions
const translations = {
  fr: {
    // Menu principal
    'welcome': 'Bienvenue sur TypeVision',
    'multiplayer': 'Multijoueur',
    'shop': 'Boutique',
    'profile': 'Profil',
    'settings': 'Paramètres',
    'logout': 'Déconnexion',
    'login': 'Se connecter',
    
    // Login/Register
    'guest_login': 'Jouer en tant qu\'invité',
    'email_login': 'Se connecter avec email',
    'create_account': 'Créer un compte',
    'email': 'Email',
    'password': 'Mot de passe',
    'login_title': 'Connexion',
    'register_title': 'Créer un compte',
    'already_have_account': 'Déjà un compte ?',
    'no_account': 'Pas de compte ?',
    'login_error': 'Erreur de connexion',
    'register_error': 'Erreur lors de la création du compte',
    'fill_all_fields': 'Veuillez remplir tous les champs',
    'password_min_length': 'Le mot de passe doit contenir au moins 6 caractères',
    'account_created': 'Compte créé avec succès !',
    
    // Multiplayer
    'create_room': 'Créer une salle',
    'join_room': 'Rejoindre une salle',
    'room_code': 'Code de la salle',
    'room_name': 'Nom de la salle',
    'waiting_players': 'En attente des joueurs...',
    'start_game': 'Commencer la partie',
    'leave_room': 'Quitter la salle',
    'players_in_room': 'Joueurs dans la salle',
    'copy_code': 'Copier le code',
    'room_copied': 'Code copié dans le presse-papiers',
    'player': 'Joueur',
    'cannotFindGlobalGame': 'Impossible de trouver une partie mondiale',
    'globalServerConnectionProblem': 'Problème de connexion au serveur mondial',
    'cannotCreateGlobalRoom': 'Impossible de créer la salle mondiale',
    'pleaseEnterRoomCode': 'Veuillez entrer un code de salle',
    'cannotJoinGlobalRoom': 'Impossible de rejoindre la salle mondiale',
    'connecting': 'Connexion',
    'globalMultiplayer': 'Multijoueur Mondial',
    'playWithWorldwidePlayers': 'Jouez avec des joueurs du monde entier',
    'playersOnline': 'Joueurs en ligne',
    'waitingRooms': 'Salles en attente',
    'gamesInProgress': 'Parties en cours',
    'yourName': 'Votre nom',
    'enterYourName': 'Entrez votre nom',
    'gameOptions': 'Options de jeu',
    'quickMatch': 'Partie rapide',
    'findOpponentsQuickly': 'Trouvez rapidement des adversaires',
    'inviteFriendsToPlay': 'Invitez vos amis à jouer',
    'roomCodeSixDigits': 'Code de salle (6 chiffres)',
    'join': 'Rejoindre',
    'invalidRoomData': 'Données de salle invalides',
    'cannotStartGame': 'Impossible de démarrer la partie',
    'joinMyGame': 'Rejoins ma partie TypeVision',
    'typevisionInvitation': 'Invitation TypeVision',
    'confirmLeaveRoom': 'Êtes-vous sûr de vouloir quitter ?',
    'leave': 'Quitter',
    'players': 'Joueurs',
    'gameMode': 'Mode de jeu',
    'race': 'Course',
    'endurance': 'Endurance',
    'difficulty': 'Difficulté',
    'easy': 'Facile',
    'medium': 'Moyen',
    'hard': 'Difficile',
    'imReady': 'Je suis prêt',
    'gameWillStartAutomatically': 'La partie commencera automatiquement quand suffisamment de joueurs seront connectés',
    
    // Game
    'ready': 'Prêt ?!',
    'go': 'Commencez !',
    'start_typing': 'Commencez à taper...',
    'wpm': 'MPM',
    'accuracy': 'Précision',
    'time_remaining': 'Temps restant',
    'game_finished': 'Partie terminée',
    'results': 'Résultats',
    'back_to_lobby': 'Retour au lobby',
    'player_finished': 'Un joueur a terminé !',
    'finish_in': 'Fin dans',
    'your_stats': 'Vos statistiques',
    'final_results': 'Résultats finaux',
    'gameResults': 'Résultats de la partie',
    'finalRanking': 'Classement final',
    'continue': 'Continuer',
    
    // Settings
    'audio_visual': 'Audio & Visuel',
    'sounds': 'Sons',
    'sound_effects': 'Activer les effets sonores',
    'music': 'Musique',
    'background_music': 'Musique d\'ambiance',
    'vibrations': 'Vibrations',
    'haptic_feedback': 'Retour haptique',
    'dark_mode': 'Mode sombre',
    'dark_interface': 'Interface en mode sombre',
    'high_contrast': 'Contraste élevé',
    'improve_readability': 'Améliore la lisibilité',
    'notifications': 'Notifications',
    'push_notifications': 'Notifications push',
    'receive_notifications': 'Recevoir des notifications',
    'language': 'Langue',
    'choose_language': 'Choisir la langue',
    'account': 'Compte',
    'reset_progress': 'Réinitialiser les progrès',
    'delete_account': 'Supprimer le compte',
    'reset_progress_desc': 'Supprimer tous les progrès',
    'delete_account_desc': 'Suppression définitive',
    'support': 'Support',
    'help': 'Aide',
    'help_desc': 'FAQ et guide d\'utilisation',
    'report_bug': 'Signaler un bug',
    'report_bug_desc': 'Nous faire part d\'un bug',
    'rate_app': 'Noter l\'app',
    'rate_app_desc': 'Donnez votre avis',
    'account_section': 'Compte',
    'push_notifications': 'Notifications push',
    'sounds_enabled': 'Sons activés',
    'sounds_disabled': 'Sons désactivés',
    'music_enabled': 'Musique activée',
    'music_disabled': 'Musique désactivée',
    'dark_mode_enabled': 'Mode sombre activé',
    'light_mode_enabled': 'Mode clair activé',
    
    // Profile
    'user_profile': 'Profil utilisateur',
    'guest_user': 'Utilisateur invité',
    'statistics': 'Statistiques',
    'games_played': 'Parties jouées',
    'total_time': 'Temps total',
    'average_wpm': 'MPM moyen',
    'best_wpm': 'Meilleur MPM',
    'average_accuracy': 'Précision moyenne',
    'achievements': 'Succès',
    'account_actions': 'Actions du compte',
    'change_avatar': 'Changer d\'avatar',
    'edit_profile': 'Modifier le profil',
    
    // Shop
    'shop_title': 'Boutique',
    'themes': 'Thèmes',
    'keyboards': 'Claviers',
    'avatars': 'Avatars',
    'purchase': 'Acheter',
    'owned': 'Possédé',
    'price': 'Prix',
    'skins': 'Skins',
    'levels': 'Niveaux',
    'buy': 'Acheter',
    'errorLoadingProducts': 'Impossible de charger les produits',
    'priceNotAvailable': 'Prix non disponible',
    'cannotOpenPaymentPage': 'Impossible d\'ouvrir la page de paiement',
    'payment': 'Paiement',
    'copyLinkForPayment': 'Copiez ce lien pour procéder au paiement',
    'cannotProcessPayment': 'Impossible de procéder au paiement',
    'noProductsAvailable': 'Aucun produit disponible',
    'refresh': 'Actualiser',
    'restorePurchases': 'Restaurer les achats',
    
    // Achievements
    'first_game': 'Première partie',
    'speed_demon': 'Démon de la vitesse',
    'perfectionist': 'Perfectionniste',
    'marathon_runner': 'Marathonien',
    'social_player': 'Joueur social',
    'first_game_desc': 'Jouer votre première partie',
    'speed_demon_desc': 'Atteindre 100 MPM',
    'perfectionist_desc': 'Terminer une partie avec 100% de précision',
    'marathon_runner_desc': 'Jouer pendant 1 heure au total',
    'social_player_desc': 'Jouer 10 parties multijoueur',
    
    // Common
    'cancel': 'Annuler',
    'confirm': 'Confirmer',
    'save': 'Sauvegarder',
    'back': 'Retour',
    'close': 'Fermer',
    'error': 'Erreur',
    'success': 'Succès',
    'loading': 'Chargement...',
    'yes': 'Oui',
    'no': 'Non',
    'ok': 'OK',
    'masterTyping': 'Maîtrisez la frappe',
  },
  
  en: {
    // Main menu
    'welcome': 'Welcome to TypeVision',
    'multiplayer': 'Multiplayer',
    'shop': 'Shop',
    'profile': 'Profile',
    'settings': 'Settings',
    'logout': 'Logout',
    'login': 'Login',
    
    // Login/Register
    'guest_login': 'Play as Guest',
    'email_login': 'Login with Email',
    'create_account': 'Create Account',
    'email': 'Email',
    'password': 'Password',
    'login_title': 'Login',
    'register_title': 'Create Account',
    'already_have_account': 'Already have an account?',
    'no_account': 'No account?',
    'login_error': 'Login error',
    'register_error': 'Error creating account',
    'fill_all_fields': 'Please fill all fields',
    'password_min_length': 'Password must be at least 6 characters',
    'account_created': 'Account created successfully!',
    
    // Multiplayer
    'create_room': 'Create Room',
    'join_room': 'Join Room',
    'room_code': 'Room Code',
    'room_name': 'Room Name',
    'waiting_players': 'Waiting for players...',
    'start_game': 'Start Game',
    'leave_room': 'Leave Room',
    'players_in_room': 'Players in Room',
    'copy_code': 'Copy Code',
    'room_copied': 'Code copied to clipboard',
    'player': 'Player',
    'cannotFindGlobalGame': 'Unable to find a global game',
    'globalServerConnectionProblem': 'Global server connection problem',
    'cannotCreateGlobalRoom': 'Unable to create global room',
    'pleaseEnterRoomCode': 'Please enter a room code',
    'cannotJoinGlobalRoom': 'Unable to join global room',
    'connecting': 'Connecting',
    'globalMultiplayer': 'Global Multiplayer',
    'playWithWorldwidePlayers': 'Play with players worldwide',
    'playersOnline': 'Players Online',
    'waitingRooms': 'Waiting Rooms',
    'gamesInProgress': 'Games in Progress',
    'yourName': 'Your Name',
    'enterYourName': 'Enter your name',
    'gameOptions': 'Game Options',
    'quickMatch': 'Quick Match',
    'findOpponentsQuickly': 'Find opponents quickly',
    'inviteFriendsToPlay': 'Invite your friends to play',
    'roomCodeSixDigits': 'Room code (6 digits)',
    'join': 'Join',
    'invalidRoomData': 'Invalid room data',
    'cannotStartGame': 'Cannot start game',
    'joinMyGame': 'Join my TypeVision game',
    'typevisionInvitation': 'TypeVision Invitation',
    'confirmLeaveRoom': 'Are you sure you want to leave?',
    'leave': 'Leave',
    'players': 'Players',
    'gameMode': 'Game Mode',
    'race': 'Race',
    'endurance': 'Endurance',
    'difficulty': 'Difficulty',
    'easy': 'Easy',
    'medium': 'Medium',
    'hard': 'Hard',
    'imReady': 'I\'m ready',
    'gameWillStartAutomatically': 'The game will start automatically when enough players are connected',
    
    // Game
    'ready': 'Ready?!',
    'go': 'Go!',
    'start_typing': 'Start typing...',
    'wpm': 'WPM',
    'accuracy': 'Accuracy',
    'time_remaining': 'Time remaining',
    'game_finished': 'Game finished',
    'results': 'Results',
    'back_to_lobby': 'Back to lobby',
    'player_finished': 'A player finished!',
    'finish_in': 'Finish in',
    'your_stats': 'Your stats',
    'final_results': 'Final results',
    'gameResults': 'Game Results',
    'finalRanking': 'Final Ranking',
    'continue': 'Continue',
    
    // Settings
    'audio_visual': 'Audio & Visual',
    'sounds': 'Sounds',
    'sound_effects': 'Enable sound effects',
    'music': 'Music',
    'background_music': 'Background music',
    'vibrations': 'Vibrations',
    'haptic_feedback': 'Haptic feedback',
    'dark_mode': 'Dark mode',
    'dark_interface': 'Dark interface',
    'high_contrast': 'High contrast',
    'improve_readability': 'Improve readability',
    'notifications': 'Notifications',
    'push_notifications': 'Push notifications',
    'receive_notifications': 'Receive notifications',
    'language': 'Language',
    'choose_language': 'Choose language',
    'account': 'Account',
    'reset_progress': 'Reset progress',
    'delete_account': 'Delete account',
    'reset_progress_desc': 'Delete all progress',
    'delete_account_desc': 'Permanent deletion',
    'support': 'Support',
    'help': 'Help',
    'help_desc': 'FAQ and user guide',
    'report_bug': 'Report bug',
    'report_bug_desc': 'Tell us about a bug',
    'rate_app': 'Rate app',
    'rate_app_desc': 'Give your feedback',
    'account_section': 'Account',
    'push_notifications': 'Push notifications',
    'sounds_enabled': 'Sounds enabled',
    'sounds_disabled': 'Sounds disabled',
    'music_enabled': 'Music enabled',
    'music_disabled': 'Music disabled',
    'dark_mode_enabled': 'Dark mode enabled',
    'light_mode_enabled': 'Light mode enabled',
    
    // Profile
    'user_profile': 'User Profile',
    'guest_user': 'Guest User',
    'statistics': 'Statistics',
    'games_played': 'Games Played',
    'total_time': 'Total Time',
    'average_wpm': 'Average WPM',
    'best_wpm': 'Best WPM',
    'average_accuracy': 'Average Accuracy',
    'achievements': 'Achievements',
    'account_actions': 'Account Actions',
    'change_avatar': 'Change Avatar',
    'edit_profile': 'Edit Profile',
    
    // Shop
    'shop_title': 'Shop',
    'themes': 'Themes',
    'keyboards': 'Keyboards',
    'avatars': 'Avatars',
    'purchase': 'Purchase',
    'owned': 'Owned',
    'price': 'Price',
    'skins': 'Skins',
    'levels': 'Levels',
    'buy': 'Buy',
    'errorLoadingProducts': 'Unable to load products',
    'priceNotAvailable': 'Price not available',
    'cannotOpenPaymentPage': 'Cannot open payment page',
    'payment': 'Payment',
    'copyLinkForPayment': 'Copy this link to proceed with payment',
    'cannotProcessPayment': 'Cannot process payment',
    'noProductsAvailable': 'No products available',
    'refresh': 'Refresh',
    'restorePurchases': 'Restore Purchases',
    
    // Achievements
    'first_game': 'First Game',
    'speed_demon': 'Speed Demon',
    'perfectionist': 'Perfectionist',
    'marathon_runner': 'Marathon Runner',
    'social_player': 'Social Player',
    'first_game_desc': 'Play your first game',
    'speed_demon_desc': 'Reach 100 WPM',
    'perfectionist_desc': 'Complete a game with 100% accuracy',
    'marathon_runner_desc': 'Play for 1 hour total',
    'social_player_desc': 'Play 10 multiplayer games',
    
    // Common
    'cancel': 'Cancel',
    'confirm': 'Confirm',
    'save': 'Save',
    'back': 'Back',
    'close': 'Close',
    'error': 'Error',
    'success': 'Success',
    'loading': 'Loading...',
    'yes': 'Yes',
    'no': 'No',
    'ok': 'OK',
    'masterTyping': 'Master Typing',
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('fr'); // Français par défaut
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('userLanguage');
      if (savedLanguage) {
        setCurrentLanguage(savedLanguage);
      }
    } catch (error) {
      console.log('❌ Erreur chargement langue:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = async (newLanguage) => {
    try {
      setCurrentLanguage(newLanguage);
      await AsyncStorage.setItem('userLanguage', newLanguage);
      console.log('✅ Langue changée vers:', newLanguage);
    } catch (error) {
      console.log('❌ Erreur sauvegarde langue:', error);
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || key;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    isLoading,
    isFrench: currentLanguage === 'fr',
    isEnglish: currentLanguage === 'en'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
