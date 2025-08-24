// Script de nettoyage Firebase - TypeVision
// Utilisez ceci pour nettoyer les utilisateurs fantômes

import { globalMultiplayerService } from './services/globalMultiplayerService';

// ===== FONCTIONS DE NETTOYAGE =====

// 1. Supprimer l'utilisateur fantôme spécifique
export const removeSpecificGhost = async () => {
  console.log('👻 Suppression de user_4971570...');
  const success = await globalMultiplayerService.removeGhostUser('user_4971570');
  if (success) {
    console.log('✅ user_4971570 supprimé avec succès !');
  } else {
    console.log('❌ Échec de la suppression');
  }
};

// 2. Debug complet des salles
export const debugAllRooms = async () => {
  console.log('🔍 Analyse des salles...');
  await globalMultiplayerService.debugRooms();
};

// 3. Nettoyage complet automatique
export const cleanupAll = async () => {
  console.log('🧹 Nettoyage complet...');
  await globalMultiplayerService.cleanupAllGhosts();
  await globalMultiplayerService.forceCleanup();
};

// 4. Statut des utilisateurs connectés
export const getUsersStatus = async () => {
  const count = await globalMultiplayerService.getConnectedUsersCount();
  console.log(`👥 ${count} utilisateur(s) réellement connecté(s)`);
  return count;
};

// ===== UTILISATION =====
// Dans votre app, vous pouvez maintenant appeler :
//
// import { removeSpecificGhost, debugAllRooms, cleanupAll } from './firebase-cleanup';
//
// // Pour supprimer user_4971570 spécifiquement :
// removeSpecificGhost();
//
// // Pour voir toutes les salles et utilisateurs :
// debugAllRooms();
//
// // Pour un nettoyage complet :
// cleanupAll();

export default {
  removeSpecificGhost,
  debugAllRooms,
  cleanupAll,
  getUsersStatus
};
