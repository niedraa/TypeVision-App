import { useCallback } from 'react';
import audioService from '../services/AudioService';

/**
 * Hook personnalisé pour ajouter facilement l'effet sonore de clic
 * à n'importe quel onPress d'un bouton
 */
export const useClickSound = (originalOnPress) => {
  const handlePressWithSound = useCallback((...args) => {
    // Jouer l'effet sonore
    audioService.playClickSound();
    
    // Appeler la fonction onPress originale si elle existe
    if (originalOnPress) {
      originalOnPress(...args);
    }
  }, [originalOnPress]);

  return handlePressWithSound;
};

/**
 * Fonction utilitaire pour wrapper n'importe quel onPress avec l'effet sonore
 */
export const withClickSound = (onPress) => {
  return (...args) => {
    audioService.playClickSound();
    if (onPress) {
      onPress(...args);
    }
  };
};

export default useClickSound;
