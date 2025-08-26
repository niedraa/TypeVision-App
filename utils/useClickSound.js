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
    // Désactive le son si soundEnabled est false dans les settings
    try {
      const settings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      if (settings.soundEnabled !== false) {
        audioService.playClickSound();
      }
    } catch (e) {
      audioService.playClickSound();
    }
    if (onPress) {
      onPress(...args);
    }
  };
};

export default useClickSound;
